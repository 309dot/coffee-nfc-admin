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