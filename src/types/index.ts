// 원두 데이터 구조
export interface CoffeeBean {
  id: string;
  name: string;
  origin: string;
  varieties: string;
  process: string;
  region: string;
  altitude: string;
  flavorNotes: string[];
  description: string;
  story: string;
  nfcChipId: string;
  customUrl: string;
  isActive: boolean;
  saleInfo?: {
    price: number;
    isForSale: boolean;
    stock: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// NFC 칩 관리 구조
export interface NFCChip {
  chipId: string;
  beanId: string;
  customUrl: string;
  isActive: boolean;
  scanCount: number;
  lastScanned: Date;
  qrCodeUrl: string;
}

// 카페 기본 정보
export interface CafeInfo {
  id: string;
  name: string;
  description: string;
  logo: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  businessHours: {
    [key: string]: {
      open: string;
      close: string;
      isClosed: boolean;
    };
  };
}

// SNS 연동 관리
export interface SocialMedia {
  platform: 'instagram' | 'facebook' | 'twitter' | 'threads' | 'blog';
  handle: string;
  url: string;
  isActive: boolean;
  followerCount?: number;
  lastUpdated: Date;
}

// 대시보드 통계 데이터
export interface DashboardStats {
  nfcStats: {
    totalScans: number;
    todayScans: number;
    weeklyScans: number;
    monthlyScans: number;
    mostScannedBean: string;
    scansByHour: Array<{hour: number, count: number}>;
  };
  
  beanStats: {
    totalBeans: number;
    activeBeans: number;
    beansForSale: number;
    popularBeans: Array<{name: string, scanCount: number}>;
  };
  
  salesStats: {
    totalRevenue: number;
    monthlyRevenue: number;
    topSellingBeans: Array<{name: string, sales: number}>;
    conversionRate: number;
  };
  
  geoStats: {
    topCountries: Array<{country: string, count: number}>;
    topCities: Array<{city: string, count: number}>;
  };
}

// 사용자 인증
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
  lastLogin: Date;
}

// 구글 시트 연동 관련 타입들
export interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheetName: string;
  range: string;
  apiKey?: string;
  isConnected: boolean;
  lastSync?: Date;
  autoSync: boolean;
  syncInterval: number; // 분 단위
}

export interface GoogleSheetsMapping {
  name: string;
  origin: string;
  varieties: string;
  process: string;
  region: string;
  altitude: string;
  flavorNotes: string;
  description: string;
  story: string;
  price: string;
  stock: string;
  isActive: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  syncedCount: number;
  errors: string[];
  timestamp: Date;
}

export interface SyncHistory {
  id: string;
  timestamp: Date;
  type: 'manual' | 'auto';
  direction: 'import' | 'export' | 'bidirectional';
  result: SyncResult;
}

// 분석 관련 타입들
export interface NFCScanEvent {
  id: string;
  chipId: string;
  beanId: string;
  timestamp: Date;
  location?: {
    country: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  device?: {
    type: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
  };
  userAgent?: string;
  referrer?: string;
  sessionId?: string;
}

export interface AnalyticsTimeRange {
  start: Date;
  end: Date;
  period: 'hour' | 'day' | 'week' | 'month' | 'year';
}

export interface ScanAnalytics {
  totalScans: number;
  uniqueScans: number;
  scansByPeriod: Array<{
    period: string;
    count: number;
    uniqueCount: number;
  }>;
  scansByHour: Array<{
    hour: number;
    count: number;
  }>;
  scansByDay: Array<{
    day: string;
    count: number;
  }>;
  topBeans: Array<{
    beanId: string;
    beanName: string;
    scanCount: number;
    percentage: number;
  }>;
  topLocations: Array<{
    country: string;
    city?: string;
    count: number;
    percentage: number;
  }>;
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  conversionRate?: number; // 스캔 → 구매 전환율
}

export interface BeanPerformance {
  beanId: string;
  beanName: string;
  totalScans: number;
  uniqueScans: number;
  averageScansPerDay: number;
  peakScanTime: string;
  popularityTrend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
  lastScanDate?: Date;
  conversionRate?: number;
  revenue?: number;
}

export interface LocationAnalytics {
  country: string;
  city?: string;
  region?: string;
  totalScans: number;
  uniqueUsers: number;
  topBeans: Array<{
    beanName: string;
    scanCount: number;
  }>;
  timeDistribution: Array<{
    hour: number;
    count: number;
  }>;
}

export interface RealtimeStats {
  currentActiveUsers: number;
  scansInLastHour: number;
  scansInLastDay: number;
  topScanningBean: string;
  recentScans: NFCScanEvent[];
  alertsCount: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

export interface AnalyticsFilter {
  dateRange: AnalyticsTimeRange;
  beanIds?: string[];
  locations?: string[];
  deviceTypes?: ('mobile' | 'desktop' | 'tablet')[];
  includeTestScans?: boolean;
} 