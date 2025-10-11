# Figma AI Guidelines for 'han sik dang' Project (Final & Detailed)

## 1. Project Overview & Core Identity (재확인)
- **Project Name:** han sik dang (한식당)
- **Core Purpose:** "Your personal guide to authentic Korean taste." To connect global users with authentic Korean food and cultural experiences through personalized, AI-driven recommendations.
- **Key Differentiator:** AI-powered personalized discovery, immersive Korean cultural experience, and community engagement.
- **Target Audience:** International users, tourists, and locals seeking authentic Korean culinary experiences.
- **Brand Personality:** Friendly, authentic, modern, inviting, trustworthy, insightful.

## 2. Design Philosophy & Principles (핵심 철학)
- **User-Centric Discovery:** Design for effortless exploration and delightful discovery of new places and tastes. Every interaction should guide the user towards finding their next favorite.
- **AI as an Intuitive Concierge:** The AI should feel like a natural, empathetic, and intelligent companion, offering guidance and curated choices, not just data. AI suggestions should be visually distinguishable and clearly beneficial.
- **Korean Authenticity, Modern Flair:** Blend traditional Korean aesthetics (subtle patterns, warm color accents) with a clean, contemporary, and globally accessible UI. Avoid cliché or overly abstract interpretations.
- **Clarity & Simplicity:** Information hierarchy must be crystal clear. Reduce visual clutter, use ample whitespace, and ensure text is highly legible.
- **Consistency is King:** All elements, from micro-interactions to macro layouts, must adhere to the established design system. This builds trust and reduces cognitive load.
- **Emotional Connection:** Aim for designs that evoke positive emotions related to food, culture, and discovery (e.g., warmth, excitement, satisfaction).
- **Global Language Support (i18n) - CORE PRINCIPLE:** All UI elements and content must be designed with Internationalization (i18n) in mind. This means:
  - **Text String Management:** UI text strings (e.g., "모든 메뉴", "리뷰 작성", "예약/주문") should be treated as placeholders for i18n keys, allowing for easy translation.
  - **Dynamic Layout for Text Length:** Designs MUST use Auto Layout extensively, especially for text-heavy components and sections, to gracefully accommodate varying text lengths across different languages (e.g., Korean text vs. English text can have vastly different widths).
  - **Content i18n Readiness:** Understand that actual content (restaurant names, menu descriptions, user reviews) will also require i18n treatment in the final product. Your designs should support this conceptually.
  - **Consistent Typography:** Ensure typography scales appropriately across languages while maintaining readability and visual hierarchy.

## 3. Figma Library & Design System Usage (절대적 준수)
- **ALWAYS and ONLY use components, styles, and tokens published in the 'Design System for han sik dang' Figma Library.**
- **NEVER create new colors, text styles, effects, grids, or components.** If a required element is not in the library, request its creation *before* attempting to generate it.
- **Reference existing components by their exact names and Variant properties.**
    - **Color Tokens:** `Primary`, `Accent`, `Text / Primary`, `Text / Secondary`, `Background / Primary`, `Background / Secondary`, `System / Error`, `System / Success`, etc.
    - **Typography Styles:** `H1 / Bold / 24px`, `H2 / Bold / 20px`, `Body / Regular / 16px`, `Small / Medium / 14px`, `Caption / Regular / 12px`, etc.
    - **Effects:** `Elevation / Small`, `Elevation / Medium`, `Elevation / Large` (for shadows/depth).
    - **Grid Styles:** `Layout Grid / 8px Column` for main layouts.
    - **Iconography:** Use icons from our `Icon / Standard` component set or via `Iconify` plugin, ensuring they match our visual style (e.g., line icons, fill icons as specified).

### 3.1. Core Component List (필수 사용 및 재사용)
- **Buttons:**
    - `Button / Primary` (for main calls-to-action)
    - `Button / Secondary` (for alternative actions)
    - `Button / Text Only` (for tertiary actions or links)
    - `Button / Icon Only`
- **Input Fields:**
    - `Input / Text Field` (for general text input)
    - `Input / Search Bar` (for search functionality)
- **Chips:**
    - `Chip / Filter` (with `State=Default`, `State=Selected` variants)
    - `Chip / Tag` (for static labels like cuisine types)
- **Cards:**
    - `Card / Restaurant` (for restaurant listings in feeds)
    - `Card / AI Recommendation` (distinctive card for AI suggestions)
    - `Card / Photo` (for image-focused content)
- **Global Elements:**
    - `Global / Language Selector Dropdown` (Overlay component for language choice)
    - `Global / Onboarding Page Indicator` (with `State` variants)
    - `Global / Top Navigation Bar` (for screens with only back/title/options)
    - `Global / Bottom Navigation Bar` (Sticky bottom navigation with main tabs)

## 4. UI Elements & Interaction Principles (상세 규정)

### 4.1. Global Layout & Structure
- **Frame Preset:** iPhone 14 Pro (`390px` width).
- **Primary Layout Grid:** Apply `Layout Grid / 8px Column` to all main frames. All spacing, padding, and element alignments must snap to this grid.
- **Vertical Auto Layout:** All screens should primarily be a vertical Auto Layout stack for responsiveness and consistent flow.
- **Whitespace:** Utilize generous whitespace to ensure readability and a clean aesthetic.

### 4.2. Navigation & Sticky Elements
- **Sticky Top Header:**
    - Always `Fixed position when scrolling`.
    - Background: `Background / Primary` (`#FFFFFF`).
    - Contains: "han sik dang" logo (`Text / Primary`) and Language Selector (`Text / Secondary`).
    - Interaction: Language Selector opens `Global / Language Selector Dropdown` (Overlay, `Smart Animate`).
- **Sticky Search Bar:**
    - Always `Fixed position when scrolling`, immediately below Top Header.
    - Background: `Background / Primary` (`#FFFFFF`).
    - Use `Input / Search Bar` component.
    - Placeholder: "What Korean food are you craving?"
    - Interaction: Tapping navigates to `3.0 AI Concierge` (`Slide In (Up)` animation).
- **Sticky Bottom Navigation Bar (`Global / Bottom Navigation Bar`):**
    - Always `Fixed position when scrolling` at the bottom.
    - Background: `Background / Primary` (`#FFFFFF`).
    - Items: `Discover`, `AI Concierge`, `Saved`, `MY`.
    - Interaction: `Instant` transitions between main tabs.
        - `Discover` (Active on Main Screen): Stay on `2.0 Main Screen`.
        - `AI Concierge`: Navigate to `3.0 AI Concierge`.
        - `Saved`: Navigate to `6.2 My Saved Lists`.
        - `MY`: Navigate to `6.0 My Place`.

### 4.3. AI-Powered Personalization Section (메인 화면 핵심)
- **`AI Recommendation Card` (`Card / AI Recommendation` component):**
    - Position: Prominently displayed after the search bar and filters on `2.0 Main Screen`.
    - Content:
        - Use a friendly, non-threatening AI avatar/icon (from `Icon / Standard`).
        - Headline: "jerry871님, 이런 한식은 어떠세요?" (Typography: `H2 / Bold / 20px`, Color: `Text / Primary`).
        - Subtext: "AI가 당신의 활동 기반으로 장소를 추천합니다." (Typography: `Body / Regular / 16px`, Color: `Text / Secondary`).
        - Clear Call-to-Action: A right-aligned arrow icon (from `Icon / Standard`, Color: `Accent`) or `Button / Text Only` instance saying "자세히 보기" (See Details).
    - Interaction: Tapping the entire card navigates to `4.0 Search Results` (`Push` animation).

### 4.4. Content Discovery Sections
- **Filter Chips (`Chip / Filter` component):**
    - Displayed in a horizontal Auto Layout, allowing for easy horizontal scrolling (no external navigation arrows/sliders).
    - Use `Text / Secondary` color for default text, `Primary` color for selected text.
    - Use `Background / Secondary` for default chip background, `Primary` for selected chip background.
    - Interaction: Tapping changes the `State` variant of the `Chip / Filter` component.
- **Curated Content Sections:**
    - Each section must have a clear `H2 / Bold / 20px` headline.
    - Include a "See All" `Button / Text Only` on the right side of the section headline.
    - **Section Layouts:**
        - **Horizontal Scrollable Lists:** For "Recommended for You", "Hidden Gems". Contain multiple instances of `Card / Restaurant`.
        - **Vertical Grids/Lists:** For "Trending This Week", "Popular Categories". Contain instances of `Card / Restaurant` or `Card / Photo`.
    - **`Card / Restaurant` Component Usage:**
        - Always use `Card / Restaurant` component for restaurant listings.
        - Populate with realistic placeholder images (use `Content Reel` plugin if needed).
        - Ensure text layers within the component use specified Typography styles (e.g., restaurant name `H3 / Bold / 18px`, rating `Small / Medium / 14px` with `Accent` color, description `Body / Regular / 16px`, price `Caption / Regular / 12px`).
        - Interaction: Tapping `Card / Restaurant` navigates to `5.0 Restaurant Detail - Home` (`Push` animation).
    - **"See All" Button Interaction:** Tapping "See All" navigates to `4.0 Search Results` (`Push` animation`) with appropriate filter context.

### 4.5. Onboarding Flow (Reference for consistency)
- **Screens:** `1.0 Splash`, `1.1a Onboarding - Discover`, `1.1b Onboarding - AI`, `1.2 Onboarding - Culture`, `1.3 Permission`.
- **Components:** `Global / Onboarding Page Indicator`, `Button / Primary`, `Button / Text Only`.
- **Transitions:** `Slide In (Left)` for sequential onboarding, `Slide In (Left)` for "Skip" to `2.0 Main Screen`.

## 5. Micro-interactions & Animations
- **Tap Feedback:** Buttons, chips, and cards should show a subtle visual change (e.g., slight opacity decrease, subtle scale down) on tap.
- **Transitions:** Strictly follow specified animation types (e.g., `Slide In (Up)`, `Push`, `Instant`, `Smart Animate`). Default duration `300ms`, ease `Ease Out`.

## 6. Naming Conventions (명확한 구조화)
- **Frames:** `Screen_Number. Screen_Name` (e.g., `2.0_Main_Screen`, `3.0_AI_Concierge`). Use underscores for multi-word names.
- **Layers & Groups:** Descriptive and hierarchical (e.g., `Header / Top`, `Section / Recommended`, `Card / Bibimbap`).
- **Components & Variants:** `Component_Name / Variant_Property=Value` (e.g., `Button / State=Primary`, `Chip / Filter / State=Selected`).

## 7. Critical Implementation Standards (실제 구현에서 중요시되는 핵심 원칙들)

### 7.1. CSS Variables & Design System Integration (절대적 우선순위)
- **MANDATORY: All UI components MUST use CSS variables from `/styles/globals.css`** instead of hardcoded values.
- **Typography Variables:**
    - Font sizes: `var(--text-2xl)`, `var(--text-xl)`, `var(--text-base)`, `var(--text-sm)`
    - Font weights: `var(--font-weight-medium)`, `var(--font-weight-normal)`
    - Font family: `var(--font-family-primary)` (Pretendard)
- **Color Variables:**
    - Backgrounds: `var(--background)`, `var(--card)`, `var(--secondary)`
    - Text colors: `var(--foreground)`, `var(--muted-foreground)`
    - Interactive: `var(--primary)`, `var(--accent)`, `var(--ring)`
    - Borders: `var(--border)`, `var(--input)`
- **Spacing & Radius Variables:**
    - Border radius: `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-lg)`, `var(--radius-xl)`
    - All spacing must follow 8px grid system

### 7.2. Text Accessibility & Visual Contrast (가시성 최우선)
- **White Text on Dark Backgrounds:** Always use `#FFFFFF` or `text-white` on Primary (`#1A5F7A`) backgrounds.
- **WCAG AA Compliance:** Ensure minimum 4.5:1 contrast ratio for all text.
- **Explicit Color Override:** When using dark backgrounds (Primary, Accent), explicitly set text color to white in both CSS classes and inline styles.
- **Icon Visibility:** All icons on colored backgrounds must have sufficient contrast.

### 7.3. Mobile-First Responsive Design (iPhone 14 Pro 기준)
- **Frame Width:** 390px for iPhone 14 Pro optimization
- **Touch Targets:** Minimum 44px height for all interactive elements
- **Sticky Elements Implementation:**
    - Header: `position: sticky, top: 0, z-index: 50`
    - Bottom Navigation: `position: sticky, bottom: 0, z-index: 40`
    - Input Areas: `position: sticky, bottom: 0, z-index: 40`
- **Scroll Behavior:** Content areas between sticky elements must have `flex-1 overflow-y-auto`

### 7.4. Korean Cultural Authenticity & Localization
- **Korean Language Priority:** All primary text in Korean, with English subtitles where appropriate
- **Cultural Context:** References to Korean food culture, dining etiquette, and regional variations
- **8-Language Support:** Interface must be prepared for Korean, English, Japanese, Chinese (Simplified/Traditional), Spanish, French, Vietnamese
- **Local Context Integration:** Location-based recommendations, local events, seasonal considerations

### 7.5. AI Interaction & Personalization Standards
- **Conversational Tone:** AI responses should be friendly, informative, and culturally sensitive
- **Multi-Modal Input:** Support for text, voice, and visual inputs
- **Contextual Awareness:** AI should remember user preferences, dietary restrictions, and past interactions
- **Transparency:** Clear indication when content is AI-generated vs. user-generated

### 7.6. Component Architecture & Reusability
- **Atomic Design Principles:** Build from atoms (buttons, inputs) to organisms (complete sections)
- **ShadCN UI Integration:** Leverage existing components from `/components/ui/` directory
- **Consistent Naming:** Follow React component naming conventions (PascalCase)
- **Props Interface:** Define clear TypeScript interfaces for all component props

### 7.7. Performance & Loading States
- **Image Optimization:** Use `ImageWithFallback` component for all images
- **Lazy Loading:** Implement progressive loading for feeds and image galleries
- **Skeleton States:** Show loading skeletons that match final content structure
- **Error Boundaries:** Graceful error handling with user-friendly messages

### 7.8. Data Management & State Handling
- **Local Storage:** Persist user preferences, favorite restaurants, search history
- **Real-time Updates:** Restaurant availability, reviews, recommendation updates
- **Offline Capability:** Basic functionality should work without internet connection
- **Data Privacy:** Follow GDPR guidelines, especially for location and preference data

### 7.9. Testing & Quality Assurance
- **Cross-Device Testing:** Test on various screen sizes and orientations
- **Accessibility Testing:** Screen reader compatibility, keyboard navigation
- **Performance Metrics:** Monitor loading times, interaction responsiveness
- **User Journey Testing:** Complete flows from onboarding to restaurant discovery

### 7.10. Version Control & Documentation
- **Backup Strategy:** Maintain `/backup/` directory with timestamped versions
- **Component Documentation:** Clear README files for complex components
- **Change Logging:** Document all major changes and feature additions
- **Design Token Evolution:** Track changes to design system variables

### 7.11. Bottom Navigation Icon Consistency (하단 네비게이션 아이콘 일관성)
- **MANDATORY: All screens MUST use identical bottom navigation icons across the entire application**
- **Standard Icon Set for Bottom Navigation:**
    - **Discover**: `Search` icon from lucide-react
    - **AI Concierge**: `MessageCircle` icon from lucide-react  
    - **Saved**: `Heart` icon from lucide-react
    - **MY**: `User` icon from lucide-react
- **Icon Specifications:**
    - **Size**: `w-6 h-6` (24px x 24px) for all bottom navigation icons
    - **Gap**: `mb-1` (4px) between icon and label using margin-bottom
    - **Active State**: `text-primary` color with `border-b-2 border-primary` underline
    - **Inactive State**: `text-muted-foreground` color with `hover:text-foreground` transition
- **Styling Requirements:**
    - **Font Family**: Must explicitly include `fontFamily: 'var(--font-family-primary)'` in all tabs
    - **Font Size**: `fontSize: 'var(--text-sm)'` for labels
    - **Font Weight**: `font-medium` class for active state, no weight class for inactive
    - **Layout**: `flex flex-col items-center py-2 px-4 min-w-0` to prevent text wrapping
    - **Container**: `flex items-center justify-around py-2` for proper spacing
- **Implementation Note:** Never use temporary placeholder divs or rounded shapes. Always use the specified Lucide React icons to maintain visual consistency across all screens including MainScreen, SearchResultsScreen, SearchResultsEmpty, and any future screens.

## 8. Self-Correction & Verification (AI의 최종 역할)
- **Upon completing any generation task, Figma Make MUST perform an internal audit against this entire guideline document.**
- **Verification Steps:**
    1.  Confirm all required frames/elements exist and are named correctly.
    2.  Verify that *all* colors, typography, and effects used are *detached* from local styles and *linked* to the published library.
    3.  Check that all specified components (e.g., `Button / Primary`, `Card / Restaurant`, `Global / Bottom Navigation Bar`) are correctly instanced from the library.
    4.  Ensure all sticky properties (`Fixed position when scrolling`) are applied to the correct elements.
    5.  Validate all prototyping links and animation types (`Slide In (Up)`, `Push`, `Instant`, etc.).
    6.  Confirm the absence of any conflicting or unintended UI elements (e.g., extraneous navigation arrows).
    7.  Check for adherence to the 8px grid system for spacing and alignment.
    8.  **NEW: Verify CSS variable usage instead of hardcoded values.**
    9.  **NEW: Confirm text visibility and WCAG compliance on all colored backgrounds.**
    10. **NEW: Test responsive behavior and sticky element functionality.**
    11. **NEW: Verify bottom navigation icon consistency across all screens (Search, MessageCircle, Heart, User icons).**
- **Final Output:** After completing the generation and self-correction, Figma Make will state: "All guidelines adhered to, self-check successfully passed. The design is ready for review."
