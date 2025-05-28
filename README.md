# M1CT Coffee Admin Dashboard

M1CT 커피 NFC 코스터 관리자 대시보드입니다.

## 프로젝트 구조

```
coffee-admin-dashboard/
├── src/
│   ├── components/          # 공통 컴포넌트
│   │   └── Layout.tsx      # 메인 레이아웃
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── Dashboard.tsx   # 대시보드 메인
│   │   ├── BeansManagement.tsx  # 원두 관리
│   │   ├── NFCManagement.tsx    # NFC 관리
│   │   ├── CafeManagement.tsx   # 카페 관리
│   │   ├── Analytics.tsx        # 분석
│   │   └── Login.tsx           # 로그인
│   ├── services/           # API 서비스
│   │   └── api.ts         # 기존 사이트와 연동 API
│   ├── types/             # TypeScript 타입 정의
│   │   └── index.ts       # 공통 타입
│   ├── App.tsx            # 메인 앱 컴포넌트
│   └── main.tsx           # 엔트리 포인트
├── public/                # 정적 파일
├── package.json           # 의존성 관리
└── README.md             # 프로젝트 문서
```

## 기능

### 1. 대시보드
- NFC 스캔 통계 (일별, 주별, 월별)
- 원두 관리 현황
- 매출 통계
- 지역별 스캔 분석
- 시스템 상태 모니터링

### 2. 원두 관리
- 원두 정보 CRUD
- NFC 칩 연결 관리
- 판매 정보 설정
- 구글 시트 연동

### 3. NFC 관리
- NFC 칩 등록/수정
- 커스텀 URL 생성
- QR 코드 생성
- 스캔 로그 관리

### 4. 카페 관리
- 카페 기본 정보
- 영업시간 설정
- SNS 연동 관리
- 연락처 정보

### 5. 분석
- 상세 스캔 분석
- 사용자 행동 분석
- 매출 리포트
- 지역별 통계

## 기존 사이트와의 연동

### API 연동
- 기존 coffee-coaster-app과 동일한 API 엔드포인트 사용
- 실시간 데이터 동기화
- 로컬 스토리지를 통한 세션 관리

### 데이터 동기화
```typescript
import { DataSyncService } from './services/api';

// 기존 사이트와 동기화
DataSyncService.syncWithMainSite();

// 데이터 전송
await DataSyncService.pushToMainSite(data);
```

## 설치 및 실행

### 개발 환경
```bash
npm install
npm run dev
```

### 빌드
```bash
npm run build
```

### 배포
```bash
npm run preview
```

## 환경 설정

### 환경 변수
```env
VITE_API_BASE_URL=https://coffee-npc.vercel.app/api
VITE_MAIN_SITE_URL=https://coffee-npc.vercel.app
```

## 로그인 정보

### 테스트 계정
- 이메일: admin@m1ct.coffee
- 비밀번호: admin123

## 기술 스택

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router DOM

## 개발 가이드

### 새로운 페이지 추가
1. `src/pages/` 폴더에 컴포넌트 생성
2. `src/App.tsx`에 라우트 추가
3. `src/components/Layout.tsx`에 네비게이션 메뉴 추가

### API 서비스 확장
1. `src/types/index.ts`에 타입 정의 추가
2. `src/services/api.ts`에 API 메서드 추가
3. 컴포넌트에서 서비스 사용

### 스타일링 가이드
- Tailwind CSS 클래스 사용
- 커피 테마 색상: `coffee-*` 클래스
- 반응형 디자인: `sm:`, `md:`, `lg:` 접두사 사용

## 배포

### Vercel 배포
1. GitHub 저장소 연결
2. 빌드 명령어: `npm run build`
3. 출력 디렉토리: `dist`
4. 환경 변수 설정

### 도메인 설정
- 메인 사이트: `coffee-npc.vercel.app`
- 관리자: `admin.coffee-npc.vercel.app` (예정)

## 라이센스

MIT License
