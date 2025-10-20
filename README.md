# 한식당 (han sik dang)

**Your personal guide to authentic Korean taste**

AI 기반 한식 레스토랑 발견 서비스

---

## 📱 프로젝트 소개

한식당은 AI 기반의 개인화된 추천을 통해 전 세계 사용자에게 진정한 한식 경험을 제공하는 모바일 웹 애플리케이션입니다.

### 핵심 기능
- 🤖 AI 기반 개인화 추천
- 🔍 스마트 레스토랑 검색
- 📝 사용자 리뷰 및 평점
- 💾 즐겨찾기 및 방문 기록
- 🌐 8개 언어 지원 (준비 중)

---

## 🚀 빠른 시작

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

---

## 🎨 디자인 시스템

### CSS 변수 기반
모든 스타일은 `styles/globals.css`의 CSS 변수를 사용합니다.

```css
--primary: rgba(26, 95, 122, 1.00)    /* 메인 브랜드 색상 */
--accent: rgba(255, 123, 84, 1.00)     /* 강조 색상 */
--font-family-primary: 'Pretendard'    /* 메인 폰트 */
```

### 타이포그래피
- Font: Pretendard
- Sizes: 24px (h1), 20px (h2), 16px (body), 12px (small)
- 8px 그리드 시스템

---

## 📂 프로젝트 구조

```
han-sik-dang/
├── App.tsx                    # 메인 앱 컴포넌트
├── components/                # 34개 화면 컴포넌트
│   ├── MainScreen.tsx
│   ├── AIConciergeScreen.tsx
│   └── ...
├── components/ui/             # 35개 ShadCN UI 컴포넌트
├── styles/globals.css         # CSS 변수 (88개)
├── guidelines/Guidelines.md   # 디자인 명세서
└── utils/supabase/            # Supabase 설정
```

---

## 🔗 중요 문서

- **REPLIT_START_HERE.md** - Replit 개발 시작 가이드
- **DESIGN_HANDOFF.md** - 디자인 핸드오프 문서
- **Guidelines.md** - 완전한 디자인 시스템 명세서
- **PROJECT_SUMMARY.md** - 프로젝트 요약

---

## 🛠 기술 스택

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS v4, CSS Variables
- **UI Components**: ShadCN UI, Lucide React Icons
- **Backend**: Supabase (Database, Auth, Storage)
- **Build Tool**: Vite

---

## 📱 화면 구성 (34개)

### 기초 (7개)
- Splash, Onboarding (4개), Main

### AI & 검색 (3개)
- AI Concierge, Search Results

### 레스토랑 (9개)
- Detail, Info, Menu, Reviews, Photos

### 마이페이지 (10개)
- Profile, Settings, Saved, Reviews, Visits

### 소셜 (4개)
- Discovery, Followers, Feed

---

## 👥 개발자

**jerry871**

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

**Happy Coding! 🚀**
