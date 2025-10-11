# 한식당 (han sik dang)

## 🍽️ Your Personal Guide to Authentic Korean Taste

AI 기반 한식 발견 서비스 - 외국인 친화적 한식 추천 및 문화 체험 플랫폼

### ✨ 주요 기능

- 🤖 AI 기반 개인화 추천
- 🔍 직관적인 레스토랑 검색
- 📍 위치 기반 맞춤 제안
- 💬 커뮤니티 리뷰 및 평가
- 🌍 8개 언어 지원 (한국어, 영어, 일본어, 중국어 등)

### 🛠️ 기술 스택

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Authentication, Storage)
- **AI:** OpenAI GPT-4 기반 추천 시스템
- **Design:** Figma, Pretendard 폰트

### 📱 화면 구성

총 39개 화면으로 구성된 완전한 모바일 앱 경험

#### Foundation (기초)
- Splash Screen
- Onboarding Flow (AI, Discover, Community, Permission)
- Main Screen
- AI Concierge

#### Search & Discovery (검색 & 발견)
- Search Results
- Search Results Empty State

#### Restaurant Details (레스토랑 상세)
- Restaurant Detail Home
- Info, Menu, Photos
- Review List, Write Review
- Menu AI Detail Modal

#### My Page (마이페이지)
- Profile Management
- Saved Lists
- Review History
- Settings (Privacy, Language, Notifications)

#### Social & Community (소셜 & 커뮤니티)
- User Discovery
- Follower Management
- Following Feed
- Social Activity Feeds

### 🎨 디자인 시스템

- **Primary Color:** #1A5F7A (Deep Ocean Blue)
- **Accent Color:** #FF7B54 (Warm Coral)
- **Typography:** Pretendard 폰트
- **Grid:** 8px 기반 레이아웃 시스템

### 📦 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/jerrybay889/han-sik-dang.git

# 디렉토리 이동
cd han-sik-dang

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 🔧 환경 변수 설정

`.env` 파일 생성:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 🚀 배포

```bash
# 프로덕션 빌드
npm run build

# 미리보기
npm run preview
```

### 📄 라이선스

MIT License

### 👥 개발자

- **jerry871** - Project Lead & Developer

### 📧 문의

- Email: jerrybay889@gmail.com
- GitHub: [@jerrybay889](https://github.com/jerrybay889)

---

**Made with ❤️ for authentic Korean food lovers**
