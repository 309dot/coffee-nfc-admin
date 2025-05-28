import type { 
  CoffeeBean, 
  GoogleSheetsConfig, 
  GoogleSheetsMapping, 
  SyncResult, 
  SyncHistory 
} from '../types';

// 구글 시트 API 설정
const GOOGLE_SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export class GoogleSheetsService {
  private config: GoogleSheetsConfig | null = null;
  private syncHistory: SyncHistory[] = [];

  constructor() {
    this.loadConfig();
    this.loadSyncHistory();
  }

  // 설정 로드
  private loadConfig(): void {
    const savedConfig = localStorage.getItem('google-sheets-config');
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
    }
  }

  // 설정 저장
  private saveConfig(): void {
    if (this.config) {
      localStorage.setItem('google-sheets-config', JSON.stringify(this.config));
    }
  }

  // 동기화 히스토리 로드
  private loadSyncHistory(): void {
    const savedHistory = localStorage.getItem('sync-history');
    if (savedHistory) {
      this.syncHistory = JSON.parse(savedHistory);
    }
  }

  // 동기화 히스토리 저장
  private saveSyncHistory(): void {
    localStorage.setItem('sync-history', JSON.stringify(this.syncHistory));
  }

  // 구글 시트 설정
  async setupGoogleSheets(config: GoogleSheetsConfig): Promise<boolean> {
    try {
      // 연결 테스트
      const isValid = await this.testConnection(config);
      if (isValid) {
        this.config = config;
        this.saveConfig();
        return true;
      }
      return false;
    } catch (error) {
      console.error('구글 시트 설정 실패:', error);
      return false;
    }
  }

  // 연결 테스트
  async testConnection(config: GoogleSheetsConfig): Promise<boolean> {
    try {
      if (!config.apiKey) {
        // API 키 없이 공개 시트 접근 시도
        const url = `${GOOGLE_SHEETS_API_BASE}/${config.spreadsheetId}/values/${config.sheetName}!${config.range}`;
        const response = await fetch(url);
        return response.ok;
      } else {
        // API 키로 접근
        const url = `${GOOGLE_SHEETS_API_BASE}/${config.spreadsheetId}/values/${config.sheetName}!${config.range}?key=${config.apiKey}`;
        const response = await fetch(url);
        return response.ok;
      }
    } catch (error) {
      console.error('연결 테스트 실패:', error);
      return false;
    }
  }

  // 시트에서 데이터 가져오기
  async importFromSheets(): Promise<SyncResult> {
    if (!this.config) {
      return {
        success: false,
        message: '구글 시트가 설정되지 않았습니다.',
        syncedCount: 0,
        errors: ['설정 없음'],
        timestamp: new Date()
      };
    }

    try {
      const url = this.config.apiKey 
        ? `${GOOGLE_SHEETS_API_BASE}/${this.config.spreadsheetId}/values/${this.config.sheetName}!${this.config.range}?key=${this.config.apiKey}`
        : `${GOOGLE_SHEETS_API_BASE}/${this.config.spreadsheetId}/values/${this.config.sheetName}!${this.config.range}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rows = data.values || [];

      if (rows.length === 0) {
        return {
          success: false,
          message: '시트에 데이터가 없습니다.',
          syncedCount: 0,
          errors: ['데이터 없음'],
          timestamp: new Date()
        };
      }

      // 첫 번째 행은 헤더로 가정
      const headers = rows[0];
      const dataRows = rows.slice(1);

      const beans: CoffeeBean[] = [];
      const errors: string[] = [];

      dataRows.forEach((row: string[], index: number) => {
        try {
          const bean = this.parseRowToBean(headers, row, index + 2); // +2는 헤더와 0-based 인덱스 보정
          if (bean) {
            beans.push(bean);
          }
        } catch (error) {
          errors.push(`행 ${index + 2}: ${error}`);
        }
      });

      // 기존 데이터와 병합
      const existingBeans = this.getExistingBeans();
      const mergedBeans = this.mergeBeans(existingBeans, beans);
      
      // 저장
      localStorage.setItem('coffee-beans', JSON.stringify(mergedBeans));

      const result: SyncResult = {
        success: true,
        message: `${beans.length}개의 원두 데이터를 성공적으로 가져왔습니다.`,
        syncedCount: beans.length,
        errors,
        timestamp: new Date()
      };

      this.addToSyncHistory('manual', 'import', result);
      
      // 마지막 동기화 시간 업데이트
      if (this.config) {
        this.config.lastSync = new Date();
        this.saveConfig();
      }

      return result;

    } catch (error) {
      const result: SyncResult = {
        success: false,
        message: `동기화 실패: ${error}`,
        syncedCount: 0,
        errors: [String(error)],
        timestamp: new Date()
      };

      this.addToSyncHistory('manual', 'import', result);
      return result;
    }
  }

  // 시트로 데이터 내보내기 (읽기 전용 API로는 불가능, 가이드만 제공)
  async exportToSheets(): Promise<SyncResult> {
    const beans = this.getExistingBeans();
    
    // Google Apps Script나 OAuth2를 통한 쓰기 권한이 필요
    // 현재는 CSV 형태로 다운로드 가능한 데이터 제공
    const csvData = this.beansToCSV(beans);
    
    // CSV 다운로드 트리거
    this.downloadCSV(csvData, 'coffee-beans-export.csv');

    const result: SyncResult = {
      success: true,
      message: `${beans.length}개의 원두 데이터를 CSV로 내보냈습니다. 구글 시트에 직접 업로드해주세요.`,
      syncedCount: beans.length,
      errors: [],
      timestamp: new Date()
    };

    this.addToSyncHistory('manual', 'export', result);
    return result;
  }

  // 행 데이터를 원두 객체로 변환
  private parseRowToBean(headers: string[], row: string[], rowNumber: number): CoffeeBean | null {
    try {
      // 기본 매핑 (사용자가 커스터마이징 가능)
      const mapping: GoogleSheetsMapping = {
        name: 'name',
        origin: 'origin',
        varieties: 'varieties',
        process: 'process',
        region: 'region',
        altitude: 'altitude',
        flavorNotes: 'flavor_notes',
        description: 'description',
        story: 'story',
        price: 'price',
        stock: 'stock',
        isActive: 'active'
      };

      const getValue = (field: keyof GoogleSheetsMapping): string => {
        const headerIndex = headers.findIndex(h => 
          h.toLowerCase().replace(/\s+/g, '_') === mapping[field] ||
          h.toLowerCase() === field ||
          h === field
        );
        return headerIndex >= 0 ? (row[headerIndex] || '') : '';
      };

      const name = getValue('name');
      if (!name) {
        throw new Error('원두명이 필요합니다');
      }

      const flavorNotesStr = getValue('flavorNotes');
      const flavorNotes = flavorNotesStr 
        ? flavorNotesStr.split(',').map(note => note.trim()).filter(note => note)
        : [];

      const price = parseFloat(getValue('price')) || 0;
      const stock = parseInt(getValue('stock')) || 0;
      const isActive = getValue('isActive').toLowerCase() === 'true' || getValue('isActive') === '1';

      const bean: CoffeeBean = {
        id: `sheet-${Date.now()}-${rowNumber}`,
        name: name.trim(),
        origin: getValue('origin') || '',
        varieties: getValue('varieties') || '',
        process: getValue('process') || '',
        region: getValue('region') || '',
        altitude: getValue('altitude') || '',
        flavorNotes,
        description: getValue('description') || '',
        story: getValue('story') || '',
        nfcChipId: `NFC-${Date.now()}-${rowNumber}`,
        customUrl: this.generateSlug(name),
        isActive,
        saleInfo: {
          price,
          isForSale: price > 0,
          stock
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return bean;
    } catch (error) {
      throw new Error(`데이터 파싱 오류: ${error}`);
    }
  }

  // 기존 원두 데이터 가져오기
  private getExistingBeans(): CoffeeBean[] {
    const savedBeans = localStorage.getItem('coffee-beans');
    return savedBeans ? JSON.parse(savedBeans) : [];
  }

  // 원두 데이터 병합 (중복 제거)
  private mergeBeans(existing: CoffeeBean[], imported: CoffeeBean[]): CoffeeBean[] {
    const merged = [...existing];
    
    imported.forEach(importedBean => {
      const existingIndex = merged.findIndex(bean => 
        bean.name.toLowerCase() === importedBean.name.toLowerCase() &&
        bean.origin.toLowerCase() === importedBean.origin.toLowerCase()
      );
      
      if (existingIndex >= 0) {
        // 기존 데이터 업데이트 (ID와 생성일은 유지)
        merged[existingIndex] = {
          ...importedBean,
          id: merged[existingIndex].id,
          nfcChipId: merged[existingIndex].nfcChipId,
          createdAt: merged[existingIndex].createdAt,
          updatedAt: new Date()
        };
      } else {
        // 새 데이터 추가
        merged.push(importedBean);
      }
    });
    
    return merged;
  }

  // 원두 데이터를 CSV로 변환
  private beansToCSV(beans: CoffeeBean[]): string {
    const headers = [
      'name', 'origin', 'varieties', 'process', 'region', 'altitude',
      'flavor_notes', 'description', 'story', 'price', 'stock', 'active'
    ];
    
    const rows = beans.map(bean => [
      bean.name,
      bean.origin,
      bean.varieties,
      bean.process,
      bean.region,
      bean.altitude,
      bean.flavorNotes.join(', '),
      bean.description,
      bean.story,
      bean.saleInfo?.price || 0,
      bean.saleInfo?.stock || 0,
      bean.isActive ? 'TRUE' : 'FALSE'
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }

  // CSV 다운로드
  private downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // URL 슬러그 생성
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  // 동기화 히스토리 추가
  private addToSyncHistory(type: 'manual' | 'auto', direction: 'import' | 'export', result: SyncResult): void {
    const historyItem: SyncHistory = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      direction,
      result
    };
    
    this.syncHistory.unshift(historyItem);
    
    // 최대 50개 히스토리 유지
    if (this.syncHistory.length > 50) {
      this.syncHistory = this.syncHistory.slice(0, 50);
    }
    
    this.saveSyncHistory();
  }

  // 설정 가져오기
  getConfig(): GoogleSheetsConfig | null {
    return this.config;
  }

  // 동기화 히스토리 가져오기
  getSyncHistory(): SyncHistory[] {
    return this.syncHistory;
  }

  // 자동 동기화 설정
  setupAutoSync(): void {
    if (!this.config?.autoSync) return;
    
    const intervalMs = this.config.syncInterval * 60 * 1000; // 분을 밀리초로 변환
    
    setInterval(async () => {
      if (this.config?.autoSync) {
        const result = await this.importFromSheets();
        // 자동 동기화 결과를 히스토리에 'auto' 타입으로 기록
        result.timestamp = new Date();
        this.addToSyncHistory('auto', 'import', result);
      }
    }, intervalMs);
  }
}

// 싱글톤 인스턴스
export const googleSheetsService = new GoogleSheetsService(); 