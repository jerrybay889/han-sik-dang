# 현재 아키텍처: 스마트 분리 전략

## 개요

한식당 프로젝트는 **단일 빌드, 런타임 분리** 전략을 사용합니다.

이는 프론트엔드와 어드민을 같은 코드베이스에 두되, 사용자가 실제로 필요한 코드만 로드하도록 최적화한 접근 방식입니다.

## 아키텍처 장점

### 1. 런타임 분리 ✅

**일반 사용자 접속 시 (`/`)**:
```
로드되는 코드:
- index.html
- main.tsx (진입점)
- App.tsx (라우터)
- MainScreen, AIPage, ContentPage 등 (lazy loaded)
- 공통 컴포넌트 (UI, hooks, lib)

로드되지 않는 코드:
- AdminRoutes ❌
- AdminDashboard, AdminRestaurants 등 모든 어드민 페이지 ❌
- AdminSidebar ❌
```

**어드민 접속 시 (`/admin`)**:
```
로드되는 코드:
- index.html
- main.tsx (진입점)
- App.tsx (라우터)
- AdminRoutes (lazy loaded)
- AdminDashboard, AdminRestaurants 등 (lazy loaded)
- 공통 컴포넌트 (UI, hooks, lib)

로드되지 않는 코드:
- MainScreen ❌
- AIPage, ContentPage 등 사용자 페이지 ❌
```

**핵심**: React lazy loading으로 각 사용자는 필요한 코드만 로드합니다.

### 2. 코드 스플리팅 ✅

Vite는 자동으로 다음과 같이 번들을 분리합니다:

```
dist/public/
├── index.html
├── assets/
│   ├── main-[hash].js           # 진입점
│   ├── AdminRoutes-[hash].js    # 어드민 청크
│   ├── AdminDashboard-[hash].js # 어드민 대시보드
│   ├── MainScreen-[hash].js     # 사용자 메인
│   ├── shared-[hash].js         # 공통 코드
│   └── ...
```

**브라우저 네트워크 탭**:
- 사용자 접속: `main.js`, `MainScreen.js`, `shared.js` 로드
- 어드민 접속: `main.js`, `AdminRoutes.js`, `AdminDashboard.js`, `shared.js` 로드

### 3. 라우팅 독립성 ✅

**App.tsx** (루트 라우터):
```typescript
<Route path="/admin" component={AdminRoutes} />
<Route path="/admin/:rest*" component={AdminRoutes} />
```

**AdminRoutes.tsx** (어드민 라우터):
```typescript
<Router base="/admin">
  <Route path="/" component={AdminDashboard} />
  <Route path="/restaurants" component={AdminRestaurants} />
  <Route path="/restaurants/applications" component={AdminRestaurantApplications} />
  ...
</Router>
```

- 각 앱은 독립적인 라우팅 로직
- `/admin` 하위 경로는 AdminRoutes가 완전히 제어
- wouter의 Router base 활용으로 깔끔한 경로 관리

### 4. 개발 생산성 ✅

**단일 코드베이스 장점**:
- 타입 자동 공유 (`shared/schema.ts`)
- API 클라이언트 자동 공유 (`lib/queryClient.ts`)
- 인증 시스템 통합 (`AuthContext`)
- shadcn UI 컴포넌트 공유
- 같은 개발 서버, 같은 HMR

**어드민 페이지 추가 방법**:
1. `client/src/pages/admin/NewPage.tsx` 생성
2. `AdminRoutes.tsx`에 라우트 추가
3. `AdminSidebar.tsx`에 메뉴 추가
4. 끝! (별도 빌드 설정 불필요)

### 5. 배포 단순성 ✅

- 단일 빌드 명령: `npm run build`
- 단일 배포: `dist/public` 디렉토리
- 단일 서버 설정
- 단일 도메인 (예: `hansikdang.com`, `hansikdang.com/admin`)

### 6. 비용 효율성 ✅

- 같은 PostgreSQL 데이터베이스
- 같은 인증 시스템 (Replit Auth)
- 같은 서버 인프라
- 공통 코드 중복 없음

## 성능 분석

### 첫 로드 비교 (예상)

**사용자 앱 (`/`)**:
- HTML: 5KB
- JavaScript (초기): 150KB (gzip)
  - main.js: 30KB (진입점 + 라우터)
  - shared.js: 80KB (React, UI 컴포넌트)
  - MainScreen.js: 40KB (메인 페이지)
- CSS: 20KB
- **총 첫 로드**: ~175KB

**어드민 앱 (`/admin`)**:
- HTML: 5KB
- JavaScript (초기): 180KB (gzip)
  - main.js: 30KB (진입점 + 라우터)
  - shared.js: 80KB (React, UI 컴포넌트)
  - AdminRoutes.js: 10KB
  - AdminDashboard.js: 60KB (대시보드 + 차트)
- CSS: 20KB
- **총 첫 로드**: ~205KB

### 네트워크 최적화

**캐싱 전략**:
- `[hash].js` 파일명으로 무한 캐시 (1년)
- 공통 코드 (`shared.js`)는 한 번 다운로드 후 재사용
- 어드민 청크는 `/admin` 접속 전까지 다운로드 안 됨

**실제 시나리오**:
```
1. 사용자가 hansikdang.com 방문
   → MainScreen.js (40KB) 다운로드
   
2. 사용자가 /admin 방문 (같은 세션)
   → AdminRoutes.js (10KB), AdminDashboard.js (60KB)만 추가 다운로드
   → shared.js는 캐시에서 재사용
```

## 트레이드오프

### ✅ 장점

1. **개발 속도**: 타입/API 자동 공유, 단일 설정
2. **유지보수**: 한 곳에서 관리
3. **성능**: lazy loading으로 필요한 코드만 로드
4. **안정성**: vite.config.ts 수정 불필요
5. **배포**: 단순한 빌드/배포 프로세스

### ⚠️ 단점

1. **빌드 사이즈**: 전체 빌드에 어드민 코드 포함 (~200KB 증가)
   - 하지만 사용자는 다운로드 안 함
   - CDN 저장 공간만 증가
   
2. **코드 가시성**: 프로덕션 빌드에 어드민 코드가 존재
   - 하지만 난독화되어 있음
   - 어차피 백엔드 인증 필요
   
3. **독립 배포 불가**: 어드민만 업데이트 시 전체 재빌드
   - 하지만 빌드 시간 짧음 (~30초)
   - 실제로는 문제 안 됨

## 보안 고려사항

### 프론트엔드 코드 노출

**Q**: 어드민 코드가 빌드에 포함되면 보안 문제는?
**A**: 문제 없음. 이유:

1. **백엔드 인증**: 모든 `/api/admin/*` 엔드포인트는 서버에서 인증 체크
2. **토큰 검증**: JWT/세션 토큰 없으면 API 호출 불가
3. **난독화**: 프로덕션 빌드는 압축/난독화됨
4. **표준 방식**: 대부분의 SPA(Single Page App)가 이 방식 사용

**실제 보안**:
```typescript
// 프론트엔드 (보호되지 않음, 그래도 괜찮음)
await fetch('/api/admin/users');

// 백엔드 (진짜 보안)
app.get('/api/admin/users', isAdmin, async (req, res) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // ...
});
```

## 결론

현재 아키텍처는:
- ✅ 사용자 성능 최적화 (필요한 코드만 로드)
- ✅ 개발 생산성 극대화 (타입/API 공유)
- ✅ 배포 복잡도 최소화 (단일 빌드)
- ✅ 안정성 보장 (설정 파일 수정 불필요)

**언제 완전 분리를 고려?**
- 어드민 팀과 프론트 팀 완전 분리
- 배포 주기가 완전히 다를 때
- 어드민 복잡도가 극도로 높아질 때

현 시점에서는 **현재 구조가 최적**입니다.
