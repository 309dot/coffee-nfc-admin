import type { CafeInfo, SocialMedia } from '../types';

export class CafeService {
  private cafeInfo: CafeInfo | null = null;
  private socialMediaAccounts: SocialMedia[] = [];

  constructor() {
    this.loadCafeInfo();
    this.loadSocialMedia();
  }

  // 카페 정보 로드
  private loadCafeInfo(): void {
    const savedInfo = localStorage.getItem('cafe-info');
    if (savedInfo) {
      this.cafeInfo = JSON.parse(savedInfo);
    } else {
      // 기본 카페 정보 설정
      this.cafeInfo = {
        id: 'cafe-001',
        name: 'M1CT Coffee',
        description: '최고급 스페셜티 커피와 NFC 기술이 만나는 혁신적인 카페입니다. 각 원두의 스토리를 NFC 코스터를 통해 경험해보세요.',
        logo: '/logo.png',
        address: {
          street: '서울특별시 강남구 테헤란로 123',
          city: '서울',
          zipCode: '06142',
          coordinates: {
            lat: 37.5665,
            lng: 126.9780
          }
        },
        contact: {
          phone: '02-1234-5678',
          email: 'info@m1ct.coffee',
          website: 'https://m1ct.coffee'
        },
        businessHours: {
          monday: { open: '07:00', close: '22:00', isClosed: false },
          tuesday: { open: '07:00', close: '22:00', isClosed: false },
          wednesday: { open: '07:00', close: '22:00', isClosed: false },
          thursday: { open: '07:00', close: '22:00', isClosed: false },
          friday: { open: '07:00', close: '23:00', isClosed: false },
          saturday: { open: '08:00', close: '23:00', isClosed: false },
          sunday: { open: '08:00', close: '21:00', isClosed: false }
        }
      };
      this.saveCafeInfo();
    }
  }

  // SNS 계정 정보 로드
  private loadSocialMedia(): void {
    const savedSocial = localStorage.getItem('social-media');
    if (savedSocial) {
      this.socialMediaAccounts = JSON.parse(savedSocial).map((account: any) => ({
        ...account,
        lastUpdated: new Date(account.lastUpdated)
      }));
    } else {
      // 기본 SNS 계정 설정
      this.socialMediaAccounts = [
        {
          platform: 'instagram',
          handle: '@m1ct_coffee',
          url: 'https://instagram.com/m1ct_coffee',
          isActive: true,
          followerCount: 12500,
          lastUpdated: new Date()
        },
        {
          platform: 'facebook',
          handle: 'M1CT Coffee',
          url: 'https://facebook.com/m1ctcoffee',
          isActive: true,
          followerCount: 8200,
          lastUpdated: new Date()
        },
        {
          platform: 'threads',
          handle: '@m1ct_coffee',
          url: 'https://threads.net/@m1ct_coffee',
          isActive: false,
          followerCount: 0,
          lastUpdated: new Date()
        },
        {
          platform: 'blog',
          handle: 'M1CT Coffee Blog',
          url: 'https://blog.m1ct.coffee',
          isActive: true,
          followerCount: 0,
          lastUpdated: new Date()
        }
      ];
      this.saveSocialMedia();
    }
  }

  // 카페 정보 저장
  private saveCafeInfo(): void {
    if (this.cafeInfo) {
      localStorage.setItem('cafe-info', JSON.stringify(this.cafeInfo));
    }
  }

  // SNS 정보 저장
  private saveSocialMedia(): void {
    localStorage.setItem('social-media', JSON.stringify(this.socialMediaAccounts));
  }

  // 카페 정보 가져오기
  getCafeInfo(): CafeInfo | null {
    return this.cafeInfo;
  }

  // 카페 정보 업데이트
  updateCafeInfo(updates: Partial<CafeInfo>): Promise<CafeInfo> {
    return new Promise((resolve, reject) => {
      if (this.cafeInfo) {
        this.cafeInfo = { ...this.cafeInfo, ...updates };
        this.saveCafeInfo();
        resolve(this.cafeInfo);
      } else {
        reject(new Error('카페 정보가 없습니다.'));
      }
    });
  }

  // 영업시간 업데이트
  updateBusinessHours(day: string, hours: { open: string; close: string; isClosed: boolean }): Promise<CafeInfo> {
    return new Promise((resolve) => {
      if (this.cafeInfo) {
        this.cafeInfo.businessHours[day] = hours;
        this.saveCafeInfo();
        resolve(this.cafeInfo);
      }
    });
  }

  // SNS 계정 목록 가져오기
  getSocialMediaAccounts(): SocialMedia[] {
    return this.socialMediaAccounts;
  }

  // SNS 계정 추가
  addSocialMediaAccount(account: Omit<SocialMedia, 'lastUpdated'>): Promise<SocialMedia[]> {
    return new Promise((resolve) => {
      const newAccount: SocialMedia = {
        ...account,
        lastUpdated: new Date()
      };
      this.socialMediaAccounts.push(newAccount);
      this.saveSocialMedia();
      resolve(this.socialMediaAccounts);
    });
  }

  // SNS 계정 업데이트
  updateSocialMediaAccount(platform: string, updates: Partial<SocialMedia>): Promise<SocialMedia[]> {
    return new Promise((resolve) => {
      const index = this.socialMediaAccounts.findIndex(account => account.platform === platform);
      if (index !== -1) {
        this.socialMediaAccounts[index] = {
          ...this.socialMediaAccounts[index],
          ...updates,
          lastUpdated: new Date()
        };
        this.saveSocialMedia();
      }
      resolve(this.socialMediaAccounts);
    });
  }

  // SNS 계정 삭제
  deleteSocialMediaAccount(platform: string): Promise<SocialMedia[]> {
    return new Promise((resolve) => {
      this.socialMediaAccounts = this.socialMediaAccounts.filter(
        account => account.platform !== platform
      );
      this.saveSocialMedia();
      resolve(this.socialMediaAccounts);
    });
  }

  // SNS 계정 활성화/비활성화
  toggleSocialMediaAccount(platform: string): Promise<SocialMedia[]> {
    return new Promise((resolve) => {
      const account = this.socialMediaAccounts.find(acc => acc.platform === platform);
      if (account) {
        account.isActive = !account.isActive;
        account.lastUpdated = new Date();
        this.saveSocialMedia();
      }
      resolve(this.socialMediaAccounts);
    });
  }

  // 팔로워 수 업데이트 (외부 API 연동 시뮬레이션)
  updateFollowerCounts(): Promise<SocialMedia[]> {
    return new Promise((resolve) => {
      this.socialMediaAccounts.forEach(account => {
        if (account.isActive && account.followerCount !== undefined) {
          // 팔로워 수 변화 시뮬레이션 (±5% 범위)
          const change = Math.floor(account.followerCount * (Math.random() * 0.1 - 0.05));
          account.followerCount = Math.max(0, account.followerCount + change);
          account.lastUpdated = new Date();
        }
      });
      this.saveSocialMedia();
      resolve(this.socialMediaAccounts);
    });
  }

  // 카페 통계 가져오기
  getCafeStats(): {
    totalFollowers: number;
    activePlatforms: number;
    lastUpdate: Date;
    topPlatform: string;
  } {
    const totalFollowers = this.socialMediaAccounts
      .filter(account => account.isActive)
      .reduce((sum, account) => sum + (account.followerCount || 0), 0);

    const activePlatforms = this.socialMediaAccounts.filter(account => account.isActive).length;

    const lastUpdate = this.socialMediaAccounts.reduce((latest, account) => {
      return account.lastUpdated > latest ? account.lastUpdated : latest;
    }, new Date(0));

    const topPlatform = this.socialMediaAccounts
      .filter(account => account.isActive)
      .sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0))[0]?.platform || 'none';

    return {
      totalFollowers,
      activePlatforms,
      lastUpdate,
      topPlatform
    };
  }

  // 영업 상태 확인
  getBusinessStatus(): {
    isOpen: boolean;
    nextChange: string;
    todayHours: { open: string; close: string; isClosed: boolean } | null;
  } {
    if (!this.cafeInfo) {
      return { isOpen: false, nextChange: '', todayHours: null };
    }

    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = dayNames[now.getDay()];
    const todayHours = this.cafeInfo.businessHours[today];

    if (todayHours.isClosed) {
      return { isOpen: false, nextChange: '휴무일', todayHours };
    }

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const openTime = parseInt(todayHours.open.split(':')[0]) * 60 + parseInt(todayHours.open.split(':')[1]);
    const closeTime = parseInt(todayHours.close.split(':')[0]) * 60 + parseInt(todayHours.close.split(':')[1]);

    const isOpen = currentTime >= openTime && currentTime < closeTime;
    const nextChange = isOpen ? `${todayHours.close}에 마감` : `${todayHours.open}에 오픈`;

    return { isOpen, nextChange, todayHours };
  }

  // 로고 업로드 (파일 처리 시뮬레이션)
  uploadLogo(file: File): Promise<string> {
    return new Promise((resolve) => {
      // 실제 환경에서는 파일 업로드 API 호출
      const logoUrl = URL.createObjectURL(file);
      if (this.cafeInfo) {
        this.cafeInfo.logo = logoUrl;
        this.saveCafeInfo();
      }
      resolve(logoUrl);
    });
  }
}

// 싱글톤 인스턴스
export const cafeService = new CafeService(); 