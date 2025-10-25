# 프론트엔드-어드민 완전 분리 계획

## 현재 상태 (Phase 0)

### ✅ 이미 달성된 것들

1. **런타임 분리** 
   - 일반 사용자가 `/` 경로 접근 시 어드민 코드를 전혀 로드하지 않음
   - React lazy loading으로 AdminRoutes는 `/admin` 접근 시에만 로드
   - 코드 스플리팅으로 어드민 번들이 별도 청크로 분리됨

2. **라우팅 분리**
   - `/admin/*` 경로는 AdminRoutes 컴포넌트만 처리
   - wouter의 Router base="/admin"으로 중첩 라우팅 정상 작동
   - 사용자 앱과 어드민 앱의 라우팅 완전 독립

3. **코드 구조**
   - `client/src/pages/admin/` 디렉토리에 모든 어드민 페이지 분리
   - `AdminSidebar.tsx` 등 어드민 전용 컴포넌트 분리
   - 공통 컴포넌트(`components/ui/`, `lib/`, `contexts/`)는 공유

### ⚠️ 현재 제약사항

1. **빌드 통합**
   - 프로덕션 빌드 시 어드민 코드가 포함됨 (사용은 안 하지만 존재)
   - vite.config.ts 수정 불가로 multi-entry 빌드 불가능
   - server/vite.ts 수정 불가로 경로별 HTML 제공 불가능

2. **번들 사이즈**
   - 일반 사용자 빌드에 어드민 코드가 포함 (약 15-20% 증가 예상)
   - 실제 로드는 하지 않지만 전송됨

## Phase 1: 코드 레벨 준비 (안전한 단계)

**목표**: Vite 설정 변경 없이 미래 분리를 위한 코드 구조 정리

### 1.1 디렉토리 재구조화

```
client/src/
├── admin/              # 어드민 앱 (향후 독립 빌드)
│   ├── pages/         # 현재 pages/admin/* 이동
│   ├── components/    # 어드민 전용 컴포넌트
│   ├── AdminApp.tsx   # 어드민 루트 컴포넌트
│   └── admin.tsx      # 어드민 진입점 (향후 사용)
│
├── user/              # 사용자 앱 (향후 독립 빌드)
│   ├── pages/         # 현재 pages/* (admin 제외) 이동
│   ├── components/    # 사용자 전용 컴포넌트
│   ├── UserApp.tsx    # 사용자 루트 컴포넌트
│   └── main.tsx       # 사용자 진입점 (현재와 동일)
│
└── shared/            # 공통 코드
    ├── components/    # UI 컴포넌트 (shadcn 등)
    ├── hooks/         # 공통 훅
    ├── lib/           # 유틸리티
    └── contexts/      # 공통 컨텍스트
```

**작업 방법**:
- 점진적으로 파일 이동 (한 번에 하나씩)
- 각 이동 후 빌드/테스트 확인
- import 경로 수정 (`@/pages/admin/...` → `@/admin/pages/...`)

### 1.2 진입점 파일 준비

**admin.html** (client/ 디렉토리):
```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>한식당 관리자</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/admin/admin.tsx"></script>
  </body>
</html>
```

**admin.tsx** (client/src/admin/):
```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AdminApp from "./AdminApp";
import "../shared/i18n";
import "../shared/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>
);
```

## Phase 2: Vite 설정 수정 (환경 파괴 위험 - 신중하게)

**⚠️ 주의**: 이 단계는 vite.config.ts 수정 권한이 필요하며, 실패 시 롤백 가능해야 함

### 2.1 Vite Multi-Entry 설정

**vite.config.ts 수정**:
```typescript
export default defineConfig({
  // ... 기존 설정 ...
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, "client/index.html"),
        admin: path.resolve(import.meta.dirname, "client/admin.html"),
      },
    },
  },
});
```

**예상 결과**:
- `dist/public/index.html` - 사용자 앱
- `dist/public/admin.html` - 어드민 앱
- 각각 독립적인 JavaScript 번들

### 2.2 서버 라우팅 수정

**server/vite.ts 수정** (개발 환경):
```typescript
app.use("*", async (req, res, next) => {
  const url = req.originalUrl;
  
  // /admin 경로는 admin.html 제공
  const isAdminRoute = url.startsWith('/admin');
  const htmlFile = isAdminRoute ? 'admin.html' : 'index.html';
  const scriptFile = isAdminRoute ? '/src/admin/admin.tsx' : '/src/main.tsx';
  
  const clientTemplate = path.resolve(
    import.meta.dirname,
    "..",
    "client",
    htmlFile,
  );

  let template = await fs.promises.readFile(clientTemplate, "utf-8");
  template = template.replace(
    `src="${scriptFile}"`,
    `src="${scriptFile}?v=${nanoid()}"`,
  );
  const page = await vite.transformIndexHtml(url, template);
  res.status(200).set({ "Content-Type": "text/html" }).end(page);
});
```

**server/vite.ts 수정** (프로덕션):
```typescript
export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");
  
  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}`);
  }

  app.use(express.static(distPath));

  // /admin 경로는 admin.html 반환
  app.use("/admin*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "admin.html"));
  });

  // 나머지는 index.html 반환
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
```

### 2.3 테스트 계획

**롤백 전 체크리스트**:
1. [ ] 로컬에서 `npm run dev` 정상 작동
2. [ ] `/` 경로에서 사용자 앱 정상 로드
3. [ ] `/admin` 경로에서 어드민 앱 정상 로드
4. [ ] 각 앱의 모든 페이지 정상 작동
5. [ ] HMR (Hot Module Replacement) 정상 작동
6. [ ] 프로덕션 빌드 성공
7. [ ] 프로덕션 빌드 테스트 성공

**롤백 방법**:
1. Git에서 이전 커밋으로 복구
2. 또는 백업한 vite.config.ts, server/vite.ts 복원

## Phase 3: 완전 분리 (선택 사항)

**언제 고려?**
- 어드민 팀과 프론트 팀이 완전히 분리될 때
- 어드민 앱의 복잡도가 매우 높아질 때
- 각 앱의 배포 주기가 완전히 달라질 때

**구조**:
```
/hansikdang-user/     # 사용자 앱 레포
/hansikdang-admin/    # 어드민 앱 레포
/hansikdang-shared/   # 공통 라이브러리 (npm 패키지)
```

**장점**:
- 완전한 독립성
- 각각 다른 기술 스택 가능

**단점**:
- 복잡도 증가
- 공통 코드 동기화 필요
- 배포 복잡도 증가

## 예상 번들 사이즈 비교

### 현재 (Phase 0)
- **전체 빌드**: ~800KB (어드민 포함)
- **사용자 첫 로드**: ~400KB (어드민 제외, lazy loading)
- **어드민 첫 로드**: ~600KB (사용자 코드 일부 포함)

### Phase 2 완료 후
- **사용자 앱 빌드**: ~400KB (어드민 완전 제외)
- **어드민 앱 빌드**: ~500KB (사용자 코드 완전 제외)
- **총 빌드 사이즈**: ~900KB (중복 공통 코드)
- **사용자 첫 로드**: ~400KB ✅ 50% 감소
- **어드민 첫 로드**: ~500KB ✅ 17% 감소

## 권장 실행 순서

1. **지금 (Phase 0)**: 현재 상태 유지, 잘 작동 중
2. **필요 시 (Phase 1)**: 코드 구조만 정리 (안전함)
3. **확신 시 (Phase 2)**: Vite 설정 수정 (백업 필수)
4. **거의 안 함 (Phase 3)**: 완전 분리 (과도한 복잡도)

## 결론

**현재 Phase 0 상태로도 충분합니다**:
- ✅ 사용자는 어드민 코드를 로드하지 않음
- ✅ 어드민은 독립적으로 개발 가능
- ✅ 라우팅 완전 분리
- ⚠️ 빌드 사이즈만 약간 증가 (실제 성능 영향 미미)

Phase 1은 언제든 안전하게 진행 가능하며, Phase 2는 충분한 준비와 테스트 후에만 진행하세요.
