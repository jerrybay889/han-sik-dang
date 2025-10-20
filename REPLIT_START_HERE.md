# 🚀 Replit 개발 시작 가이드
**한식당 프로젝트 - Figma 디자인 대체 패키지**

---

## 👋 환영합니다!

Figma 디자인 파일 대신 **더 나은 것**을 제공합니다:
**실제로 작동하는 완전한 웹 애플리케이션**과 **상세한 디자인 시스템**입니다.

---

## 🎯 빠른 시작 (3단계)

### Step 1: 라이브 프리뷰 확인 ⭐️
현재 Figma Make 프리뷰 URL에서 34개 화면 모두 실제 작동하는 앱을 확인하세요.

### Step 2: 모든 화면 둘러보기
- 테스트 메뉴: `?page=test-menu`
- 갤러리 뷰: `?page=gallery`

### Step 3: 디자인 시스템 다운로드
필수 파일:
1. ✅ `/styles/globals.css` - 모든 CSS 변수
2. ✅ `/guidelines/Guidelines.md` - 완전한 디자인 명세
3. ✅ `/DESIGN_HANDOFF.md` - 상세 핸드오프 문서

---

## 📦 제공 자료 목록

### 🔴 최우선 (반드시 확인)
- ✅ **라이브 프리뷰 URL** - 작동하는 앱 전체
- ✅ **globals.css** - 88개 CSS 변수 (디자인 토큰)
- ✅ **Guidelines.md** - 70페이지 디자인 명세서
- ✅ **DESIGN_HANDOFF.md** - Replit용 핸드오프 문서

---

## 🎨 디자인 시스템 핵심 요약

### 색상 팔레트
```css
Primary:   #1A5F7A  (var(--primary))
Accent:    #FF7B54  (var(--accent))
Text:      #000000  (var(--foreground))
Muted:     #868B94  (var(--muted-foreground))
Card:      #F8F9FA  (var(--card))
```

### 타이포그래피
```
Font: Pretendard
Sizes: 24px (h1), 20px (h2), 16px (body), 12px (small)
Weights: 700 (medium), 400 (normal)
```

### 간격 시스템
```
8px 그리드 - 8, 16, 24, 32, 40...
```

### 모바일 최적화
```
Max Width: 390px (iPhone 14 Pro)
Touch Target: 최소 44px
```

---

## 📱 전체 화면 목록 (34개)

### 기초 (7개)
1. Splash Screen
2-6. Onboarding Flow (5개)
7. Main Screen ⭐️

### AI & 검색 (3개)
8. AI Concierge
9. Search Results
10. Search Results Empty

### 레스토랑 상세 (9개)
11-19. 레스토랑 홈, 정보, 메뉴, 리뷰, 사진 등

### 마이페이지 (10개)
20-29. 프로필, 설정, 저장 목록 등

### 소셜 (4개)
30-33. 사용자 발견, 팔로워, 피드

### 기타 (2개)
34. Gallery View
35. AI Collaboration Guide

---

## 🔗 화면별 직접 링크

모든 화면은 `?page=` 파라미터로 접근 가능:

```
기초: ?page=splash, ?page=main
AI: ?page=ai-concierge, ?page=search
레스토랑: ?page=detail
마이: ?page=my-page
소셜: ?page=social-feeds
기타: ?page=gallery, ?page=test-menu
```

---

## 🎯 Replit에서 개발 시작하는 방법

### Option 1: 코드 복사 (추천)
1. 현재 프로젝트의 모든 파일 다운로드
2. Replit에 새 프로젝트 생성
3. 모든 파일 업로드
4. npm install 실행
5. 개발 시작!

### Option 2: 참조 개발
1. 라이브 프리뷰를 별도 탭에 열어둠
2. Replit에서 새로 개발
3. 각 화면을 보면서 코드 작성
4. globals.css와 Guidelines.md 참조

---

## 🚨 중요: 절대 지켜야 할 규칙

### ✅ DO (반드시 할 것)
```tsx
// CSS 변수 사용
backgroundColor: 'var(--primary)'
fontSize: 'var(--text-xl)'
fontFamily: 'var(--font-family-primary)'

// 8px 그리드
padding: '16px'
margin: '24px'
gap: '8px'

// 필수 아이콘 (Lucide React)
<Search />        // Discover
<MessageCircle /> // AI Concierge
<Heart />         // Saved
<User />          // MY
```

### ❌ DON'T (절대 금지)
```tsx
// Tailwind 클래스로 폰트 설정 ❌
className="text-2xl font-bold"

// 하드코딩된 색상 ❌
backgroundColor: "#1A5F7A"

// 불규칙한 간격 ❌
padding: '13px'
```

---

## 📊 프로젝트 규모

```
총 파일 수: 100+ 파일
화면 수: 34개
컴포넌트 수: 70+ 개
CSS 변수: 88개
디자인 가이드: 70페이지
개발 시간: 12시간 (AI 협업)
```

---

**시작하세요! 모든 준비가 완료되었습니다!** 🎊
