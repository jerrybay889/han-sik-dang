# Design Guidelines: han sik dang (한식당)

## Design Philosophy
**Hybrid Content Platform + Utility App** - Korean restaurant discovery with content monetization through ads. Content-first, mobile-native, visually-driven design prioritizing Korean food imagery and efficient information architecture.

---

## Color System

**Foundation Variables (Based on Logo):**
```css
--primary: 155 65% 45%        /* Forest Green (from logo text) */
--secondary: 28 70% 55%       /* Warm Orange (from bowl) */
--foreground: 20 15% 25%      /* Dark Brown */
--card: 0 0 100               /* Pure White */
--background: 40 20% 97%      /* Warm Off-White */
--muted-foreground: 30 10% 50%
--accent-success: 142 76% 36% /* Ratings */
--accent-warning: 28 85% 60%  /* Spicy indicator */
--video-indicator: 0 84% 60%
--blog-indicator: 155 65% 55%
--ad-zone: 40 15% 96%         /* Ad backgrounds */
```

**Dark Mode:**
```css
--background: 20 20% 12%
--card: 20 15% 15%
--primary: 155 60% 55%        /* Lighter green for contrast */
--secondary: 28 75% 65%       /* Lighter orange */
--foreground: 40 20% 95%
```

**Requirements:** 4.5:1 text contrast, 3:1 icon contrast, ad zones maintain visibility in both modes.

---

## Typography

**Font Stack:**
- Korean: `-apple-system, "Noto Sans KR", sans-serif`
- English: `-apple-system, "SF Pro Display", sans-serif`
- Long-form: `"Georgia", serif` (blogs)

**Scale:**
```css
Display:  32px / 700  /* Hero only */
XL:       24px / 600  /* Sections */
LG:       18px / 500  /* Restaurant/blog titles */
Base:     16px / 400  /* Body */
SM:       14px / 400  /* Metadata */
XS:       12px / 400  /* Labels */
```

**Content-Specific:**
- Video titles: 18px/600, line-height 1.3
- Blog excerpts: 16px/400, line-height 1.6
- Min mobile text: 14px, 44px touch targets

---

## Layout Architecture

**Spacing:** 8px increments only: `8, 16, 24, 32, 48px`  
**Container:** `max-w-md` (448px) mobile, centered desktop

**Universal Screen Structure:**
```
┌─────────────────────┐
│ Header (60px) z-50  │ Sticky
├─────────────────────┤
│ Scrollable Content  │ flex-1
│ (8px grid spacing)  │
├─────────────────────┤
│ Bottom Nav (72px)   │ z-40 Sticky
└─────────────────────┘
```

**Ad Placement Pattern:**
- Top: 90px banner after header
- Mid: 250px rectangle every 3 content items (32px margin top/bottom)
- Detail pages: Mid-content rectangle after description
- Bottom: 90px banner before nav

---

## Core Components

### Cards
```css
background: var(--card);
border-radius: 12px;
padding: 16px;
box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
hover: translateY(-4px) + enhanced shadow;
active: scale(0.98);
```

### Buttons
- **Primary:** `var(--primary)` bg, white text, 44px height
- **Secondary:** Transparent bg, `var(--primary)` border/text
- **Icon:** 40×40px circle, 24px icon

### Bottom Navigation (72px)
- 4 tabs: Discover, AI, Content, My
- Icons: 24px Lucide React
- Active: `var(--primary)` + 2px top border
- Labels: 12px below icons, 4px gap

### Tags/Chips
```css
padding: 8px 16px;
border-radius: 16px; /* Pill */
background: var(--primary) at 10% opacity;
font-size: 14px;
```

### Search Bar
```css
height: 48px;
border-radius: 24px; /* Pill */
background: var(--muted);
icon: left-aligned, 16px;
```

---

## Content Components

### YouTube Embed
```css
aspect-ratio: 16/9;
border-radius: 12px;
play-button: 64px centered circle overlay;
duration-badge: bottom-right, 8px padding, dark bg;
autoplay: OFF;
related-videos: OFF;
```

### Blog Card
```
┌─────────────────────┐
│ Thumbnail (16:9)    │ 200px height, cover
│ 200px height        │
├─────────────────────┤
│ Title (18px/600)    │ 2 lines max, ellipsis
│ Excerpt (14px/400)  │ 3 lines max
│ 🕒 Read Time (12px) │ Muted
└─────────────────────┘
```

### Review Card
```
Avatar (40px) │ Name + Date (vertical)
              │ ★★★★★ (16px gold stars)
              │ Comment text (16px)
              │ Photos (80px squares, horizontal scroll)
```

### AI Chat Bubble
```css
user: right-aligned, var(--primary) bg, white text;
ai: left-aligned, var(--muted) bg, black text;
border-radius: 16px 16px 4px 16px; /* Speech bubble */
max-width: 80%;
padding: 12px 16px;
```

### Ad Container
```css
background: var(--ad-zone);
label: "Advertisement" 10px, top-right, muted;
min-height: 90px | 250px; /* AdSense compliant */
border: none; /* Seamless */
```

---

## Image Strategy

### NO Traditional Hero
**Instead:** AI Recommendation section (160px height)
```css
background: linear-gradient(135deg, var(--primary) 0%, #2D9CDB 100%);
content: AI icon + title + CTA;
```

### Image Specs
- **Restaurant primary:** 16:9, 400px min width
- **Gallery thumbnails:** 80×80px squares
- **Blog headers:** 16:9, 800px width
- **Video thumbnails:** YouTube auto-generated
- **Format:** WebP, lazy load (200px before viewport), blur placeholder

### Korean Food Photography
- Warm tones (enhance reds/oranges)
- Top-down banchan layouts
- Close-ups (texture focus)
- Context (wooden tables, traditional bowls)

---

## Section Patterns

### Trending Videos
```
🔥 인기 영상 (18px bold)
[Horizontal scroll: 280px cards, 16:9 thumbnail, 16px gap]
```

### Thematic Sections
```
🌱 한식 초보자 추천 / Beginner-Friendly (emoji + KR + EN)
[2-column grid mobile, 16px gap, square images with gradient title overlay]
```

### Neighborhood
```
📍 [Area Name] 맛집
[Vertical list, restaurant cards with distance badge]
```

### Blog Feed
```
📝 최신 글
[Vertical full-width: Image + Title + Excerpt + Read Time]
```

---

## Animations

**Principles:** Minimal motion, respect `prefers-reduced-motion`

```css
card-tap: scale(0.98), 100ms ease-out;
page-transition: slide-up 300ms + fade-in;
loading: skeleton shimmer (subtle gray wave);
scroll-reveal: fade-in + translateY(-20px);
```

**Prohibited:** Auto-play videos, infinite scroll animations, parallax, complex transitions

---

## Accessibility

- **Contrast:** 4.5:1 text, 3:1 icons
- **Touch targets:** 44×44px minimum
- **Bottom nav:** Primary actions (thumb-zone optimized)
- **Swipe gestures:** 100px minimum distance
- **Dark mode:** Full support, test all ad placements

---

## Mobile Optimization

**Thumb Zone:**
- Bottom: Primary nav (easy reach)
- Top: Secondary actions (search/filter)
- Center: Scroll-only content

**Performance:**
- Infinite scroll: Intersection Observer
- Virtual scrolling: Long lists
- Lazy load: Images 200px before viewport
- Target: 60fps scrolling

---

## Revenue Strategy

**High-Value Ad Zones:**
1. Above fold: 90px banner
2. Every 3 content items: 250px rectangle
3. Detail mid-content: After description
4. AI chat: Bottom sticky banner

**YouTube Integration:**
- Autoplay OFF, related videos OFF
- `maxresdefault` thumbnails
- View tracking on play event

**Engagement Drivers:**
- "Read More" truncated excerpts
- Visible video duration
- Prominent save/share buttons

---

## Critical Rules

1. ✅ **CSS Variables only** - No Tailwind classes
2. ✅ **8px grid** - All spacing multiples of 8
3. ✅ **44px touch targets** - All interactive elements
4. ✅ **Lucide React icons** - 24px size, consistent
5. ✅ **Ad labeling** - Always "Advertisement", never cover content
6. ✅ **Korean priority** - Korean first, English subtitle
7. ✅ **WebP images** - Lazy load, blur placeholder
8. ✅ **Dark mode** - Full support, test all states
9. ✅ **60fps** - Performance budgets, instant feedback
10. ✅ **Content density** - Information-rich, not cluttered

---

## Implementation Checklist

1. Implement `globals.css` with 88 CSS variables
2. Build core components (Card, Button, Nav)
3. Create MainScreen with ad placeholders
4. Integrate Gemini AI chat
5. Add YouTube/Blog content sections

**Design Priority:** Monetization through strategic ads + Korean food visual appeal + mobile-first efficiency + cultural authenticity