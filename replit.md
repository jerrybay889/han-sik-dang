# han sik dang (한식당) - Korean Restaurant Discovery Platform

## Overview

han sik dang is a hybrid content platform and utility app focused on Korean restaurant discovery with content monetization through advertising. The platform combines restaurant search functionality with rich content (videos, blogs) in a mobile-first, visually-driven design that prioritizes Korean food imagery and user experience.

The application is built as a full-stack TypeScript web application using React for the frontend, Express for the backend, and designed to be mobile-native with Progressive Web App (PWA) capabilities in mind.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript in SPA (Single Page Application) mode
- **Routing**: Wouter - lightweight client-side routing library
- **State Management**: TanStack React Query v5 for server state management
- **UI Components**: shadcn/ui component library (New York style variant) built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming
- **SEO**: react-helmet-async for dynamic meta tag management

**Design System**:
- Mobile-first responsive design with max-width container approach (`max-w-md mx-auto`)
- 8px grid spacing system (8, 16, 24, 32px intervals)
- Dual-mode theming (light/dark) using CSS custom properties
- Typography: Multi-language support (Korean: Noto Sans KR, English: SF Pro Display)
- Accessibility: Minimum 44px touch targets, 4.5:1 text contrast ratio

**Key Architectural Decisions**:
- Component-based architecture with shared UI components in `client/src/components/ui/`
- CSS variable-based theming for consistent design across light/dark modes
- Content-first approach with ad monetization zones integrated into UI
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)
- SEO-first approach for both mobile app deployment and web search visibility

### Backend Architecture

**Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM (ES Modules)
- **Build System**: esbuild for production builds, tsx for development
- **Development Server**: Vite integration for HMR (Hot Module Replacement)

**API Structure**:
- RESTful API pattern with `/api` prefix for all routes
- Request/response logging middleware for development debugging
- Error handling middleware with standardized error responses
- Session management configured via connect-pg-simple

**Storage Layer**:
- In-memory storage implementation (`MemStorage`) as current default
- Interface-based design (`IStorage`) for easy database swapping
- Designed to support future database integration (PostgreSQL via Drizzle ORM)

**Key Architectural Decisions**:
- Separation of concerns: routes, storage, and server setup in distinct modules
- Development/production environment separation with conditional Vite integration
- Type-safe API contracts shared between frontend and backend via `shared/` directory
- Middleware-first request processing (JSON parsing, URL encoding, logging)

### Data Storage Solutions

**Current State**: In-memory storage with PostgreSQL preparation
- Schema definitions in `shared/schema.ts` using Drizzle ORM
- PostgreSQL dialect configured in `drizzle.config.ts`
- Database connection via `@neondatabase/serverless` for Neon compatibility
- Migration support configured with output to `./migrations/`

**Schema Structure**:
- Users table with UUID primary keys, username/password authentication
- Zod schema validation via `drizzle-zod` integration
- Type-safe queries and mutations using Drizzle ORM's type inference

**Key Architectural Decisions**:
- Interface-based storage abstraction allows swapping implementations without changing business logic
- Shared schema definitions ensure type consistency across frontend/backend
- Prepared for serverless PostgreSQL deployment via Neon Database
- Migration-first approach for schema changes

### Authentication and Authorization

**Current Implementation**: Foundation in place, not fully implemented
- User schema with username/password fields defined
- Storage interface includes `getUser`, `getUserByUsername`, `createUser` methods
- Session management prepared via `connect-pg-simple` package
- Query client configured with credential inclusion for cookie-based sessions

**Key Architectural Decisions**:
- Cookie-based session approach (via `credentials: "include"` in fetch)
- Password storage prepared (hashing implementation pending)
- 401 unauthorized handling with configurable behavior (return null or throw)
- Session store ready for PostgreSQL backend integration

### External Dependencies

**AI Integration**:
- `@google/genai` v1.25.0 - Google Generative AI SDK for AI concierge features and content generation

**UI Framework**:
- `@radix-ui/*` - Comprehensive suite of accessible, unstyled UI primitives (accordion, dialog, dropdown, popover, tabs, toast, tooltip, etc.)
- `class-variance-authority` - Type-safe variant styling utility
- `cmdk` - Command menu component for search interfaces
- `embla-carousel-react` - Carousel/slider implementation
- `lucide-react` - Icon library
- `react-day-picker` - Date picker component
- `react-hook-form` - Form state management
- `vaul` - Drawer component for mobile interfaces

**Data & Validation**:
- `zod` - Schema validation library
- `@hookform/resolvers` - Form validation integration
- `date-fns` - Date manipulation utilities

**Database & ORM**:
- `drizzle-orm` v0.39.1 - TypeScript ORM
- `drizzle-zod` - Zod schema generation from Drizzle schemas
- `@neondatabase/serverless` - Serverless PostgreSQL driver for Neon
- `connect-pg-simple` - PostgreSQL session store for Express

**Build & Development Tools**:
- `vite` - Frontend build tool and dev server
- `@vitejs/plugin-react` - React integration for Vite
- `tailwindcss` & `autoprefixer` - CSS processing
- `tsx` - TypeScript execution for development
- `esbuild` - Fast JavaScript bundler for production
- `@replit/*` - Replit-specific development plugins (runtime error overlay, cartographer, dev banner)

**Routing & State**:
- `wouter` - Lightweight client-side routing (~1.2KB)
- `@tanstack/react-query` v5.60.5 - Server state management with caching

**Key Architectural Decisions**:
- Minimal dependencies approach - using lightweight alternatives (wouter vs react-router)
- shadcn/ui pattern - components are copied into codebase for full customization
- AI-first features prepared via Google Generative AI integration
- Serverless-ready database configuration for modern deployment platforms
- Replit-optimized development experience with custom plugins

### Restaurant Detail Page

**Implementation**: Comprehensive restaurant detail page with full multilingual support

**Features**:
- **Restaurant Information Display**:
  - Hero image with responsive layout
  - Dual-language restaurant names (Korean/English)
  - Star rating and review count
  - Cuisine type and dietary badges (Vegan/Halal)
  - Price range and location information
  - Full restaurant description
  
- **Contact Information**:
  - Full address display
  - Clickable phone number (`tel:` link for mobile)
  - Operating hours with multi-line support
  
- **Reviews Section**:
  - Review list display with user names, ratings, comments, dates
  - "Write Review" button (UI ready for implementation)
  - Empty state when no reviews exist
  - Loading skeleton during data fetch
  
- **Navigation**:
  - Back button to return to homepage
  - Save/bookmark button (UI ready for implementation)
  - URL structure: `/restaurant/:id`
  
- **SEO Optimization**:
  - Page-specific meta tags (title, description, keywords)
  - Open Graph tags for social sharing
  - Structured data with restaurant details

**Technical Implementation**:
- Route: `/restaurant/:id` defined in `client/src/App.tsx`
- Component: `client/src/pages/RestaurantDetailPage.tsx`
- API endpoints: GET `/api/restaurants/:id`, GET `/api/reviews/:restaurantId`
- Multilingual support: 13 new translation keys across all 8 languages
- Click navigation from MainScreen restaurant cards via wouter `<Link>`

**Translation Keys Added**:
- `restaurant.price`, `restaurant.location`, `restaurant.about`, `restaurant.info`
- `restaurant.address`, `restaurant.phone`, `restaurant.hours`
- `reviews.title`, `reviews.write`, `reviews.empty`, `reviews.beFirst`
- `error.notFound`, `discover.title`

### SEO and Search Optimization

**Implementation**: Comprehensive SEO strategy for dual-platform deployment (mobile apps + web)

**Core Components**:
- **SEO Component** (`client/src/components/SEO.tsx`):
  - React Helmet Async integration for dynamic meta tag management
  - Per-page customizable title, description, keywords
  - Open Graph tags for social media sharing (Facebook, LinkedIn)
  - Twitter Card meta tags for Twitter/X previews
  - Canonical URLs to prevent duplicate content
  - JSON-LD structured data injection
  
- **Structured Data** (`client/src/lib/structuredData.ts`):
  - Schema.org Organization schema with multilingual name
  - Schema.org WebSite schema with search action capability
  - Rich snippet support for search engines

- **Multilingual SEO**:
  - hreflang link tags in `index.html` for 8 languages (ko, en, ja, zh-Hans, zh-Hant, es, fr, de)
  - Language-specific meta descriptions and keywords
  - Ensures proper indexing for regional search engines

- **Search Engine Discovery**:
  - `sitemap.xml` - XML sitemap with all main pages and hreflang alternates
  - `robots.txt` - Search engine crawler directives with sitemap reference
  - Both files located in `client/public/`

**SEO Coverage**:
- Homepage (`/`) - Restaurant discovery, AI recommendations
- AI Guide (`/ai`) - Personalized restaurant recommendations
- Content Feed (`/content`) - Videos and blogs about Korean food
- User Profile (`/my`) - Saved restaurants and reviews

**Key SEO Features**:
- Unique meta tags per page with descriptive titles and descriptions
- Social media preview optimization (Open Graph + Twitter Cards)
- Structured data for rich search results
- Mobile-first indexing compliance
- Fast page load times for Core Web Vitals
- Semantic HTML structure with proper heading hierarchy

**Target Search Visibility**:
- Google Search (global and regional)
- LLM AI searches (ChatGPT, Perplexity, etc.)
- Social media link previews
- Mobile app store SEO (when deployed)