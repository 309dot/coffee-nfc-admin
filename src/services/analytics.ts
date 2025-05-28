import type { 
  NFCScanEvent, 
  ScanAnalytics, 
  BeanPerformance, 
  LocationAnalytics, 
  RealtimeStats, 
  AnalyticsFilter,
  AnalyticsTimeRange,
  CoffeeBean 
} from '../types';

export class AnalyticsService {
  private scanEvents: NFCScanEvent[] = [];
  private realtimeUpdateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadScanEvents();
    this.generateSampleData();
    this.startRealtimeUpdates();
  }

  // 스캔 이벤트 로드
  private loadScanEvents(): void {
    const savedEvents = localStorage.getItem('nfc-scan-events');
    if (savedEvents) {
      this.scanEvents = JSON.parse(savedEvents).map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp)
      }));
    }
  }

  // 스캔 이벤트 저장
  private saveScanEvents(): void {
    localStorage.setItem('nfc-scan-events', JSON.stringify(this.scanEvents));
  }

  // 샘플 데이터 생성 (실제 환경에서는 제거)
  private generateSampleData(): void {
    if (this.scanEvents.length > 0) return;

    const beans = this.getBeansData();
    const countries = ['South Korea', 'Japan', 'United States', 'Germany', 'France', 'Australia'];
    const cities = {
      'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu'],
      'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama'],
      'United States': ['New York', 'Los Angeles', 'Chicago', 'San Francisco'],
      'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'],
      'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
      'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth']
    };

    const deviceTypes = ['mobile', 'desktop', 'tablet'] as const;
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
    const os = ['iOS', 'Android', 'Windows', 'macOS'];

    // 지난 30일간의 샘플 데이터 생성
    for (let i = 0; i < 500; i++) {
      const randomBean = beans[Math.floor(Math.random() * beans.length)];
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      const randomCity = cities[randomCountry as keyof typeof cities][
        Math.floor(Math.random() * cities[randomCountry as keyof typeof cities].length)
      ];
      const randomDevice = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
      
      // 시간 분포를 현실적으로 (오전 9시-오후 9시에 집중)
      const hour = Math.random() < 0.8 
        ? Math.floor(Math.random() * 12) + 9 // 9-21시
        : Math.floor(Math.random() * 24); // 전체 시간

      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 30));
      timestamp.setHours(hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));

      const scanEvent: NFCScanEvent = {
        id: `scan-${Date.now()}-${i}`,
        chipId: randomBean?.nfcChipId || `NFC-${i}`,
        beanId: randomBean?.id || `bean-${i}`,
        timestamp,
        location: {
          country: randomCountry,
          city: randomCity,
          coordinates: {
            lat: 37.5665 + (Math.random() - 0.5) * 0.1,
            lng: 126.9780 + (Math.random() - 0.5) * 0.1
          }
        },
        device: {
          type: randomDevice,
          os: os[Math.floor(Math.random() * os.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)]
        },
        sessionId: `session-${Math.floor(Math.random() * 1000)}`
      };

      this.scanEvents.push(scanEvent);
    }

    this.saveScanEvents();
  }

  // 실시간 업데이트 시작
  private startRealtimeUpdates(): void {
    this.realtimeUpdateInterval = setInterval(() => {
      // 실시간 스캔 이벤트 시뮬레이션
      if (Math.random() < 0.3) { // 30% 확률로 새 스캔 생성
        this.simulateNewScan();
      }
    }, 10000); // 10초마다
  }

  // 새 스캔 시뮬레이션
  private simulateNewScan(): void {
    const beans = this.getBeansData();
    if (beans.length === 0) return;

    const randomBean = beans[Math.floor(Math.random() * beans.length)];
    const newScan: NFCScanEvent = {
      id: `scan-${Date.now()}`,
      chipId: randomBean.nfcChipId,
      beanId: randomBean.id,
      timestamp: new Date(),
      location: {
        country: 'South Korea',
        city: 'Seoul'
      },
      device: {
        type: 'mobile',
        os: 'iOS',
        browser: 'Safari'
      },
      sessionId: `session-${Date.now()}`
    };

    this.scanEvents.push(newScan);
    this.saveScanEvents();

    // 최대 1000개 이벤트 유지
    if (this.scanEvents.length > 1000) {
      this.scanEvents = this.scanEvents.slice(-1000);
      this.saveScanEvents();
    }
  }

  // 스캔 분석 데이터 가져오기
  getScanAnalytics(filter?: AnalyticsFilter): ScanAnalytics {
    let filteredEvents = this.scanEvents;

    // 필터 적용
    if (filter) {
      filteredEvents = this.applyFilter(filteredEvents, filter);
    }

    const totalScans = filteredEvents.length;
    const uniqueScans = new Set(filteredEvents.map(e => e.sessionId)).size;

    // 시간별 분석
    const scansByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: filteredEvents.filter(e => e.timestamp.getHours() === hour).length
    }));

    // 일별 분석 (최근 7일)
    const scansByDay = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString('ko-KR', { weekday: 'short' });
      const count = filteredEvents.filter(e => 
        e.timestamp.toDateString() === date.toDateString()
      ).length;
      return { day: dayStr, count };
    }).reverse();

    // 원두별 분석
    const beanCounts = new Map<string, number>();
    const beans = this.getBeansData();
    
    filteredEvents.forEach(event => {
      const count = beanCounts.get(event.beanId) || 0;
      beanCounts.set(event.beanId, count + 1);
    });

    const topBeans = Array.from(beanCounts.entries())
      .map(([beanId, count]) => {
        const bean = beans.find(b => b.id === beanId);
        return {
          beanId,
          beanName: bean?.name || 'Unknown',
          scanCount: count,
          percentage: (count / totalScans) * 100
        };
      })
      .sort((a, b) => b.scanCount - a.scanCount)
      .slice(0, 10);

    // 지역별 분석
    const locationCounts = new Map<string, number>();
    filteredEvents.forEach(event => {
      if (event.location) {
        const key = `${event.location.country}-${event.location.city}`;
        const count = locationCounts.get(key) || 0;
        locationCounts.set(key, count + 1);
      }
    });

    const topLocations = Array.from(locationCounts.entries())
      .map(([location, count]) => {
        const [country, city] = location.split('-');
        return {
          country,
          city,
          count,
          percentage: (count / totalScans) * 100
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 디바이스 통계
    const deviceStats = {
      mobile: filteredEvents.filter(e => e.device?.type === 'mobile').length,
      desktop: filteredEvents.filter(e => e.device?.type === 'desktop').length,
      tablet: filteredEvents.filter(e => e.device?.type === 'tablet').length
    };

    return {
      totalScans,
      uniqueScans,
      scansByPeriod: [], // 구현 필요시 추가
      scansByHour,
      scansByDay,
      topBeans,
      topLocations,
      deviceStats,
      conversionRate: Math.random() * 10 + 5 // 5-15% 임시값
    };
  }

  // 원두 성능 분석
  getBeanPerformance(beanId?: string): BeanPerformance[] {
    const beans = this.getBeansData();
    const targetBeans = beanId ? beans.filter(b => b.id === beanId) : beans;

    return targetBeans.map(bean => {
      const beanEvents = this.scanEvents.filter(e => e.beanId === bean.id);
      const totalScans = beanEvents.length;
      const uniqueScans = new Set(beanEvents.map(e => e.sessionId)).size;

      // 최근 7일과 이전 7일 비교
      const now = new Date();
      const recent7Days = beanEvents.filter(e => {
        const daysDiff = (now.getTime() - e.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      }).length;

      const previous7Days = beanEvents.filter(e => {
        const daysDiff = (now.getTime() - e.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff > 7 && daysDiff <= 14;
      }).length;

      let popularityTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      let trendPercentage = 0;

      if (previous7Days > 0) {
        const change = ((recent7Days - previous7Days) / previous7Days) * 100;
        trendPercentage = Math.abs(change);
        
        if (change > 5) popularityTrend = 'increasing';
        else if (change < -5) popularityTrend = 'decreasing';
      }

      // 피크 시간 계산
      const hourCounts = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: beanEvents.filter(e => e.timestamp.getHours() === hour).length
      }));
      const peakHour = hourCounts.reduce((max, current) => 
        current.count > max.count ? current : max
      );

      return {
        beanId: bean.id,
        beanName: bean.name,
        totalScans,
        uniqueScans,
        averageScansPerDay: totalScans / 30, // 최근 30일 기준
        peakScanTime: `${peakHour.hour}:00`,
        popularityTrend,
        trendPercentage,
        lastScanDate: beanEvents.length > 0 
          ? new Date(Math.max(...beanEvents.map(e => e.timestamp.getTime())))
          : undefined,
        conversionRate: Math.random() * 15 + 5, // 5-20% 임시값
        revenue: bean.saleInfo?.price ? bean.saleInfo.price * totalScans * 0.1 : 0
      };
    });
  }

  // 실시간 통계
  getRealtimeStats(): RealtimeStats {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const scansInLastHour = this.scanEvents.filter(e => e.timestamp >= oneHourAgo).length;
    const scansInLastDay = this.scanEvents.filter(e => e.timestamp >= oneDayAgo).length;

    // 최근 스캔된 원두
    const recentBeanScans = new Map<string, number>();
    this.scanEvents
      .filter(e => e.timestamp >= oneDayAgo)
      .forEach(e => {
        const count = recentBeanScans.get(e.beanId) || 0;
        recentBeanScans.set(e.beanId, count + 1);
      });

    const topScanningBeanId = Array.from(recentBeanScans.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    const beans = this.getBeansData();
    const topScanningBean = beans.find(b => b.id === topScanningBeanId)?.name || 'N/A';

    // 최근 스캔 이벤트 (최대 10개)
    const recentScans = this.scanEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      currentActiveUsers: Math.floor(Math.random() * 50) + 10, // 10-60명 임시값
      scansInLastHour,
      scansInLastDay,
      topScanningBean,
      recentScans,
      alertsCount: 0,
      systemHealth: 'good'
    };
  }

  // 지역별 분석
  getLocationAnalytics(): LocationAnalytics[] {
    const locationMap = new Map<string, {
      country: string;
      city: string;
      events: NFCScanEvent[];
    }>();

    this.scanEvents.forEach(event => {
      if (event.location) {
        const key = `${event.location.country}-${event.location.city}`;
        if (!locationMap.has(key)) {
          locationMap.set(key, {
            country: event.location.country,
            city: event.location.city,
            events: []
          });
        }
        locationMap.get(key)!.events.push(event);
      }
    });

    const beans = this.getBeansData();

    return Array.from(locationMap.values()).map(location => {
      const events = location.events;
      const uniqueUsers = new Set(events.map(e => e.sessionId)).size;

      // 해당 지역에서 인기 있는 원두
      const beanCounts = new Map<string, number>();
      events.forEach(event => {
        const count = beanCounts.get(event.beanId) || 0;
        beanCounts.set(event.beanId, count + 1);
      });

      const topBeans = Array.from(beanCounts.entries())
        .map(([beanId, count]) => {
          const bean = beans.find(b => b.id === beanId);
          return {
            beanName: bean?.name || 'Unknown',
            scanCount: count
          };
        })
        .sort((a, b) => b.scanCount - a.scanCount)
        .slice(0, 5);

      // 시간대별 분포
      const timeDistribution = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: events.filter(e => e.timestamp.getHours() === hour).length
      }));

      return {
        country: location.country,
        city: location.city,
        totalScans: events.length,
        uniqueUsers,
        topBeans,
        timeDistribution
      };
    }).sort((a, b) => b.totalScans - a.totalScans);
  }

  // 필터 적용
  private applyFilter(events: NFCScanEvent[], filter: AnalyticsFilter): NFCScanEvent[] {
    return events.filter(event => {
      // 날짜 범위 필터
      if (filter.dateRange) {
        if (event.timestamp < filter.dateRange.start || event.timestamp > filter.dateRange.end) {
          return false;
        }
      }

      // 원두 필터
      if (filter.beanIds && filter.beanIds.length > 0) {
        if (!filter.beanIds.includes(event.beanId)) {
          return false;
        }
      }

      // 지역 필터
      if (filter.locations && filter.locations.length > 0) {
        if (!event.location || !filter.locations.includes(event.location.country)) {
          return false;
        }
      }

      // 디바이스 타입 필터
      if (filter.deviceTypes && filter.deviceTypes.length > 0) {
        if (!event.device || !filter.deviceTypes.includes(event.device.type)) {
          return false;
        }
      }

      return true;
    });
  }

  // 원두 데이터 가져오기
  private getBeansData(): CoffeeBean[] {
    const savedBeans = localStorage.getItem('coffee-beans');
    return savedBeans ? JSON.parse(savedBeans) : [];
  }

  // 새 스캔 이벤트 기록
  recordScan(chipId: string, beanId: string, metadata?: Partial<NFCScanEvent>): void {
    const scanEvent: NFCScanEvent = {
      id: `scan-${Date.now()}`,
      chipId,
      beanId,
      timestamp: new Date(),
      ...metadata
    };

    this.scanEvents.push(scanEvent);
    this.saveScanEvents();
  }

  // 서비스 정리
  destroy(): void {
    if (this.realtimeUpdateInterval) {
      clearInterval(this.realtimeUpdateInterval);
    }
  }
}

// 싱글톤 인스턴스
export const analyticsService = new AnalyticsService(); 