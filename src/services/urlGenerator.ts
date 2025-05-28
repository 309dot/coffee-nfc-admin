import type { CoffeeBean } from '../types';
import QRCode from 'qrcode';

// URL 설정 인터페이스
export interface URLConfig {
  baseUrl: string;
  customDomain?: string;
  useShortUrl: boolean;
  enableQR: boolean;
  seoOptimized: boolean;
  urlPattern: 'simple' | 'detailed' | 'custom';
}

// URL 생성 결과
export interface URLResult {
  fullUrl: string;
  shortUrl?: string;
  slug: string;
  qrCode?: string;
  seoScore: number;
  preview: {
    title: string;
    description: string;
    image?: string;
  };
}

// URL 통계
export interface URLStats {
  totalUrls: number;
  activeUrls: number;
  clickCount: number;
  topPerforming: Array<{
    slug: string;
    clicks: number;
    bean: string;
  }>;
}

export class URLGeneratorService {
  private config: URLConfig;
  private urlHistory: Array<{
    slug: string;
    beanId: string;
    createdAt: Date;
    clicks: number;
  }> = [];

  constructor() {
    this.loadConfig();
    this.loadUrlHistory();
  }

  // 설정 로드
  private loadConfig(): void {
    const savedConfig = localStorage.getItem('url-generator-config');
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
    } else {
      // 기본 설정
      this.config = {
        baseUrl: 'https://m1ct.coffee',
        useShortUrl: true,
        enableQR: true,
        seoOptimized: true,
        urlPattern: 'detailed'
      };
      this.saveConfig();
    }
  }

  // 설정 저장
  private saveConfig(): void {
    localStorage.setItem('url-generator-config', JSON.stringify(this.config));
  }

  // URL 히스토리 로드
  private loadUrlHistory(): void {
    const savedHistory = localStorage.getItem('url-history');
    if (savedHistory) {
      this.urlHistory = JSON.parse(savedHistory);
    }
  }

  // URL 히스토리 저장
  private saveUrlHistory(): void {
    localStorage.setItem('url-history', JSON.stringify(this.urlHistory));
  }

  // 고급 URL 생성
  async generateAdvancedUrl(bean: CoffeeBean): Promise<URLResult> {
    const slug = this.generateSlug(bean);
    const fullUrl = this.buildFullUrl(slug);
    const shortUrl = this.config.useShortUrl ? await this.generateShortUrl(fullUrl) : undefined;
    const qrCode = this.config.enableQR ? await this.generateQRCode(fullUrl) : undefined;
    const seoScore = this.calculateSEOScore(bean, slug);
    const preview = this.generatePreview(bean);

    // 히스토리에 추가
    this.addToHistory(slug, bean.id);

    return {
      fullUrl,
      shortUrl,
      slug,
      qrCode,
      seoScore,
      preview
    };
  }

  // 슬러그 생성 (패턴별)
  private generateSlug(bean: CoffeeBean): string {
    const { name, origin, region, process, varieties } = bean;
    
    switch (this.config.urlPattern) {
      case 'simple':
        return this.sanitizeSlug(name);
      
      case 'detailed':
        return this.sanitizeSlug(`${name}-${origin}-${process}`);
      
      case 'custom':
        return this.sanitizeSlug(`${origin}-${region}-${varieties}-${name}`);
      
      default:
        return this.sanitizeSlug(name);
    }
  }

  // 슬러그 정제
  private sanitizeSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // 특수문자 제거
      .replace(/\s+/g, '-') // 공백을 하이픈으로
      .replace(/-+/g, '-') // 연속 하이픈 제거
      .replace(/^-|-$/g, '') // 앞뒤 하이픈 제거
      .substring(0, 60); // 길이 제한
  }

  // 전체 URL 구성
  private buildFullUrl(slug: string): string {
    const domain = this.config.customDomain || this.config.baseUrl;
    return `${domain}/bean/${slug}`;
  }

  // 단축 URL 생성
  private async generateShortUrl(fullUrl: string): Promise<string> {
    // 실제 환경에서는 bit.ly, tinyurl 등의 서비스 사용
    // 여기서는 간단한 해시 기반 단축 URL 생성
    const hash = this.generateHash(fullUrl, 6);
    return `${this.config.baseUrl}/s/${hash}`;
  }

  // QR 코드 생성
  private async generateQRCode(url: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('QR 코드 생성 실패:', error);
      return '';
    }
  }

  // SEO 점수 계산
  private calculateSEOScore(bean: CoffeeBean, slug: string): number {
    let score = 0;
    
    // 슬러그 길이 (20-60자가 이상적)
    const slugLength = slug.length;
    if (slugLength >= 20 && slugLength <= 60) score += 25;
    else if (slugLength >= 10 && slugLength <= 80) score += 15;
    else score += 5;
    
    // 키워드 포함 여부
    const keywords = [bean.origin, bean.varieties, bean.process].map(k => k.toLowerCase());
    const slugLower = slug.toLowerCase();
    const keywordMatches = keywords.filter(keyword => slugLower.includes(keyword)).length;
    score += keywordMatches * 15;
    
    // 하이픈 사용 (단어 구분)
    const hyphenCount = (slug.match(/-/g) || []).length;
    if (hyphenCount >= 2 && hyphenCount <= 5) score += 20;
    else if (hyphenCount >= 1 && hyphenCount <= 7) score += 10;
    
    // 숫자 및 특수문자 없음
    if (!/\d/.test(slug)) score += 10;
    
    // 설명 및 스토리 존재
    if (bean.description && bean.description.length > 50) score += 10;
    if (bean.story && bean.story.length > 100) score += 10;
    
    return Math.min(score, 100);
  }

  // 미리보기 생성
  private generatePreview(bean: CoffeeBean): URLResult['preview'] {
    return {
      title: `${bean.name} - ${bean.origin} | M1CT Coffee`,
      description: bean.description || `${bean.origin} ${bean.region}에서 자란 ${bean.varieties} 품종의 ${bean.process} 프로세싱 원두입니다. ${bean.flavorNotes.join(', ')} 플레이버를 경험해보세요.`,
      image: `/images/beans/${bean.customUrl}.jpg` // 실제 이미지 경로
    };
  }

  // 해시 생성
  private generateHash(text: string, length: number): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit 정수로 변환
    }
    
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    let num = Math.abs(hash);
    
    for (let i = 0; i < length; i++) {
      result += chars[num % chars.length];
      num = Math.floor(num / chars.length);
    }
    
    return result;
  }

  // 히스토리에 추가
  private addToHistory(slug: string, beanId: string): void {
    const existingIndex = this.urlHistory.findIndex(item => item.slug === slug);
    
    if (existingIndex >= 0) {
      // 기존 항목 업데이트
      this.urlHistory[existingIndex] = {
        ...this.urlHistory[existingIndex],
        beanId,
        createdAt: new Date()
      };
    } else {
      // 새 항목 추가
      this.urlHistory.push({
        slug,
        beanId,
        createdAt: new Date(),
        clicks: 0
      });
    }
    
    this.saveUrlHistory();
  }

  // URL 클릭 기록
  recordClick(slug: string): void {
    const item = this.urlHistory.find(h => h.slug === slug);
    if (item) {
      item.clicks++;
      this.saveUrlHistory();
    }
  }

  // URL 통계 가져오기
  getURLStats(): URLStats {
    const beans = this.getBeansData();
    
    return {
      totalUrls: this.urlHistory.length,
      activeUrls: this.urlHistory.filter(h => {
        const bean = beans.find(b => b.id === h.beanId);
        return bean?.isActive;
      }).length,
      clickCount: this.urlHistory.reduce((sum, h) => sum + h.clicks, 0),
      topPerforming: this.urlHistory
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5)
        .map(h => {
          const bean = beans.find(b => b.id === h.beanId);
          return {
            slug: h.slug,
            clicks: h.clicks,
            bean: bean?.name || 'Unknown'
          };
        })
    };
  }

  // 원두 데이터 가져오기
  private getBeansData(): CoffeeBean[] {
    const savedBeans = localStorage.getItem('coffee-beans');
    return savedBeans ? JSON.parse(savedBeans) : [];
  }

  // 설정 업데이트
  updateConfig(newConfig: Partial<URLConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  // 현재 설정 가져오기
  getConfig(): URLConfig {
    return { ...this.config };
  }

  // URL 유효성 검사
  validateUrl(url: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      const urlObj = new URL(url);
      
      // 프로토콜 검사
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('HTTP 또는 HTTPS 프로토콜을 사용해야 합니다.');
      }
      
      // 도메인 검사
      if (!urlObj.hostname) {
        errors.push('유효한 도메인이 필요합니다.');
      }
      
      // 경로 검사
      if (urlObj.pathname.length > 100) {
        errors.push('URL 경로가 너무 깁니다 (100자 제한).');
      }
      
    } catch (error) {
      errors.push('유효하지 않은 URL 형식입니다.');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 슬러그 중복 검사
  isSlugAvailable(slug: string, excludeBeanId?: string): boolean {
    return !this.urlHistory.some(h => 
      h.slug === slug && h.beanId !== excludeBeanId
    );
  }

  // 슬러그 제안
  suggestAlternativeSlug(originalSlug: string): string[] {
    const suggestions: string[] = [];
    
    // 숫자 추가
    for (let i = 1; i <= 5; i++) {
      const suggestion = `${originalSlug}-${i}`;
      if (this.isSlugAvailable(suggestion)) {
        suggestions.push(suggestion);
      }
    }
    
    // 연도 추가
    const currentYear = new Date().getFullYear();
    const yearSuggestion = `${originalSlug}-${currentYear}`;
    if (this.isSlugAvailable(yearSuggestion)) {
      suggestions.push(yearSuggestion);
    }
    
    // 단축 버전
    if (originalSlug.length > 20) {
      const shortSuggestion = originalSlug.substring(0, 20);
      if (this.isSlugAvailable(shortSuggestion)) {
        suggestions.push(shortSuggestion);
      }
    }
    
    return suggestions.slice(0, 3);
  }

  // 대량 URL 생성
  async generateBulkUrls(beans: CoffeeBean[]): Promise<URLResult[]> {
    const results: URLResult[] = [];
    
    for (const bean of beans) {
      try {
        const result = await this.generateAdvancedUrl(bean);
        results.push(result);
      } catch (error) {
        console.error(`URL 생성 실패 (${bean.name}):`, error);
      }
    }
    
    return results;
  }
}

// 싱글톤 인스턴스
export const urlGeneratorService = new URLGeneratorService(); 