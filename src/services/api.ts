import type { CoffeeBean, NFCChip, DashboardStats, CafeInfo } from '../types';

// API 기본 설정
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://coffee-npc.vercel.app/api' 
  : 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 원두 관리 API
  async getBeans(): Promise<CoffeeBean[]> {
    return this.request<CoffeeBean[]>('/beans');
  }

  async getBean(id: string): Promise<CoffeeBean> {
    return this.request<CoffeeBean>(`/beans/${id}`);
  }

  async createBean(bean: Omit<CoffeeBean, 'id' | 'createdAt' | 'updatedAt'>): Promise<CoffeeBean> {
    return this.request<CoffeeBean>('/beans', {
      method: 'POST',
      body: JSON.stringify(bean),
    });
  }

  async updateBean(id: string, bean: Partial<CoffeeBean>): Promise<CoffeeBean> {
    return this.request<CoffeeBean>(`/beans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bean),
    });
  }

  async deleteBean(id: string): Promise<void> {
    return this.request<void>(`/beans/${id}`, {
      method: 'DELETE',
    });
  }

  // NFC 관리 API
  async getNFCChips(): Promise<NFCChip[]> {
    return this.request<NFCChip[]>('/nfc');
  }

  async createNFCChip(chip: Omit<NFCChip, 'scanCount' | 'lastScanned'>): Promise<NFCChip> {
    return this.request<NFCChip>('/nfc', {
      method: 'POST',
      body: JSON.stringify(chip),
    });
  }

  async updateNFCChip(chipId: string, chip: Partial<NFCChip>): Promise<NFCChip> {
    return this.request<NFCChip>(`/nfc/${chipId}`, {
      method: 'PUT',
      body: JSON.stringify(chip),
    });
  }

  // 대시보드 통계 API
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  // 카페 정보 API
  async getCafeInfo(): Promise<CafeInfo> {
    return this.request<CafeInfo>('/cafe');
  }

  async updateCafeInfo(info: Partial<CafeInfo>): Promise<CafeInfo> {
    return this.request<CafeInfo>('/cafe', {
      method: 'PUT',
      body: JSON.stringify(info),
    });
  }

  // 스캔 로그 API
  async logNFCScan(chipId: string, metadata?: any): Promise<void> {
    return this.request<void>('/nfc/scan', {
      method: 'POST',
      body: JSON.stringify({ chipId, metadata, timestamp: new Date() }),
    });
  }

  // 구글 시트 연동 API
  async syncWithGoogleSheets(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/sync/sheets', {
      method: 'POST',
    });
  }

  // URL 생성 API
  async generateCustomUrl(beanName: string): Promise<{ url: string; slug: string }> {
    return this.request<{ url: string; slug: string }>('/beans/generate-url', {
      method: 'POST',
      body: JSON.stringify({ name: beanName }),
    });
  }
}

// 싱글톤 인스턴스 생성
export const apiService = new ApiService();

// 기존 사이트와의 데이터 동기화를 위한 유틸리티
export class DataSyncService {
  // 기존 사이트의 로컬 스토리지와 동기화
  static syncWithMainSite() {
    try {
      // 기존 사이트에서 사용하는 데이터 구조와 맞춤
      const mainSiteData = {
        lastSync: new Date().toISOString(),
        adminAccess: true,
      };
      
      localStorage.setItem('m1ct-admin-sync', JSON.stringify(mainSiteData));
      return true;
    } catch (error) {
      console.error('Failed to sync with main site:', error);
      return false;
    }
  }

  // 기존 사이트로 데이터 전송
  static async pushToMainSite(data: any) {
    try {
      // 기존 사이트의 API 엔드포인트로 데이터 전송
      const response = await fetch('https://coffee-npc.vercel.app/api/admin/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to push data to main site:', error);
      return false;
    }
  }
}

export default apiService; 