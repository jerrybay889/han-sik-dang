# 🎨 Design Handoff for Replit
**한식당 (han sik dang) 프로젝트 디자인 참조 문서**

---

## 📋 문서 개요

이 문서는 Replit 개발을 위한 완전한 디자인 참조 자료입니다.
Figma 파일 대신 **실제 작동하는 웹 애플리케이션**과 **상세한 디자인 시스템**을 제공합니다.

---

## 🔗 핵심 참조 링크

### 1. **라이브 프리뷰 (가장 중요!)**
현재 배포된 애플리케이션에서 모든 화면을 확인하세요.

### 2. **모든 화면 직접 링크 (34개)**

#### 기초 화면
- 스플래시: `?page=splash`
- 온보딩: `?page=onboarding`
- 메인: `?page=main`

#### AI & 검색
- AI 컨시어지: `?page=ai-concierge`
- 검색 결과: `?page=search`

#### 레스토랑
- 상세: `?page=detail`
- 메뉴: `?page=detail-menu`
- 리뷰: `?page=detail-reviews`

#### 마이페이지
- 홈: `?page=my-page`
- 설정: `?page=settings`

#### 소셜
- 피드: `?page=social-feeds`

---

## 🎨 디자인 시스템 상세

### 색상 시스템 (8개 핵심 색상)

```css
/* Primary Colors */
--primary: rgba(26, 95, 122, 1.00)           /* #1A5F7A - 메인 브랜드 */
--accent: rgba(255, 123, 84, 1.00)           /* #FF7B54 - 강조 색상 */

/* Text Colors */
--foreground: rgba(0, 0, 0, 1.00)            /* #000000 - 메인 텍스트 */
--muted-foreground: rgba(134, 139, 148, 1.00) /* #868B94 - 보조 텍스트 */

/* Background Colors */
--background: rgba(255, 255, 255, 1.00)      /* #FFFFFF - 메인 배경 */
--card: rgba(248, 249, 250, 1.00)            /* #F8F9FA - 카드 배경 */

/* System Colors */
--destructive: rgba(239, 68, 68, 1.00)       /* #EF4444 - 에러/삭제 */
--border: rgba(229, 231, 235, 1.00)          /* #E5E7EB - 테두리 */
```

### 타이포그래피 시스템

```css
/* Font Family */
--font-family-primary: 'Pretendard', sans-serif

/* Font Sizes */
--text-2xl: 24px    /* H1 - 주요 제목 */
--text-xl: 20px     /* H2 - 섹션 제목 */
--text-lg: 16px     /* H3 - 소제목 */
--text-base: 16px   /* Body - 본문 */
--text-sm: 12px     /* Small - 라벨/캡션 */

/* Font Weights */
--font-weight-medium: 700   /* 강조 텍스트 */
--font-weight-normal: 400   /* 일반 텍스트 */
```

### 간격 시스템 (8px Grid)

```
8px   - 최소 간격
16px  - 작은 간격
24px  - 중간 간격
32px  - 큰 간격
40px  - 섹션 간격
48px+ - 특별 간격
```

### Border Radius

```css
--radius-sm: 8px    /* 작은 요소 */
--radius-md: 12px   /* 중간 요소 */
--radius-lg: 16px   /* 큰 요소 */
--radius-xl: 24px   /* 카드/섹션 */
```

---

## 📱 화면별 상세 명세

### 1. Main Screen (메인 화면)
**파일**: `components/MainScreen.tsx`

**구성 요소:**
- Sticky Header (로고 + 언어 선택)
- Sticky Search Bar
- Filter Chips (가로 스크롤)
- AI 추천 카드
- 추천 레스토랑 (가로 스크롤)
- 트렌딩 (세로 그리드)
- Sticky Bottom Navigation

**주요 스타일:**
- Max Width: 390px
- Sticky Elements: z-index 50 (header), 40 (nav)
- Card Shadow: var(--elevation-sm)

---

## 🧩 컴포넌트 패턴

### Button Patterns
```tsx
// Primary Button
<button style={{
  backgroundColor: 'var(--primary)',
  color: '#FFFFFF',
  padding: '12px 24px',
  borderRadius: 'var(--radius-lg)',
  fontSize: 'var(--text-base)',
  fontFamily: 'var(--font-family-primary)'
}}>
  확인
</button>

// Secondary Button
<button style={{
  backgroundColor: 'var(--secondary)',
  color: 'var(--foreground)',
  // ... same as above
}}>
  취소
</button>
```

### Card Pattern
```tsx
<div style={{
  backgroundColor: 'var(--card)',
  borderRadius: 'var(--radius-lg)',
  padding: '16px',
  boxShadow: 'var(--elevation-sm)'
}}>
  {/* Card content */}
</div>
```

---

## 🔄 인터랙션 패턴

### Navigation
- 하단 네비게이션: Instant transition
- 화면 전환: Slide/Push animation
- 모달: Fade in/out

### Hover/Active States
- Buttons: opacity 0.9
- Cards: subtle scale (0.98)
- Links: underline

---

## 📐 레이아웃 규칙

### Sticky Elements
1. **Top Header**: position: sticky, top: 0, z-index: 50
2. **Search Bar**: position: sticky, top: 60px
3. **Bottom Nav**: position: sticky, bottom: 0, z-index: 40

### Scrollable Areas
- Main content: flex-1 overflow-y-auto
- Horizontal scrolls: overflow-x-auto, hide scrollbar

---

## 🎯 개발 우선순위

### Phase 1: 디자인 시스템 (1일)
1. globals.css 복사
2. 공통 컴포넌트 (Header, BottomNav)
3. CSS 변수 테스트

### Phase 2: 메인 화면 (2일)
1. MainScreen 구조
2. AI 추천 섹션
3. 레스토랑 카드

### Phase 3: 서브 화면 (3일)
1. 레스토랑 상세 (9개)
2. 마이페이지 (10개)
3. 소셜 (4개)

### Phase 4: 통합 & 최적화 (1일)
1. 데이터 연동
2. 반응형 테스트
3. 성능 최적화

---

## ✅ 품질 체크리스트

### 디자인 시스템
- [ ] CSS 변수만 사용 (하드코딩 없음)
- [ ] Pretendard 폰트 적용
- [ ] 8px 그리드 준수
- [ ] Border radius 일관성

### 컴포넌트
- [ ] 하단 네비게이션 아이콘 일관성
- [ ] Touch target 44px 이상
- [ ] Sticky elements 제대로 작동
- [ ] 스크롤 영역 명확

### 반응형
- [ ] 390px에서 완벽
- [ ] 작은 화면 대응
- [ ] 큰 화면 max-width 적용

---

## 🚀 시작하기

1. **globals.css 다운로드**
2. **Guidelines.md 읽기**
3. **라이브 프리뷰 탐색**
4. **MainScreen 구현 시작**

---

**준비 완료! 개발을 시작하세요!** 🎉
