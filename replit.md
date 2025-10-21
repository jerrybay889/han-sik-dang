# han sik dang (한식당) - Korean Restaurant Discovery Platform

## Overview

han sik dang is a hybrid content platform and utility app for discovering Korean restaurants, featuring content monetization through advertising. It offers restaurant search, rich media content (videos, blogs), and a mobile-first, visually-driven design emphasizing Korean food culture. The platform is a full-stack TypeScript web application using React for the frontend and Express for the backend, designed with Progressive Web App (PWA) capabilities. The project aims for a content-first approach with integrated ad monetization and strong SEO.

## Recent Changes

**October 21, 2025 - Platform Updates**
-   ✅ **Phase 1 (Advertising)**: Google AdSense integration complete with strategic ad placement
-   ✅ **Phase 2 (Multilingual)**: 9-language support (Korean, English, Japanese, Chinese Simplified/Traditional, Spanish, French, German, Vietnamese)
-   ✅ **Phase 3 (Performance)**: Optimization complete - image lazy loading, code splitting, database indexing (7 indexes), React Query caching with prefetching
-   ✅ **Phase 4 (Restaurant Dashboard Backend)**: Complete backend infrastructure for B2B restaurant management
    - Database schema: restaurantOwners, reviewResponses, promotions tables
    - Storage layer: 14 new methods for ownership, responses, promotions, analytics
    - API endpoints: 11 authenticated endpoints for restaurant dashboard features
    - Ready for frontend UI implementation (pending)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

-   **Framework**: React 18+ with TypeScript (SPA)
-   **Routing**: Wouter
-   **State Management**: TanStack React Query v5
-   **UI Components**: shadcn/ui (New York style) built on Radix UI, styled with Tailwind CSS v4 and custom CSS variables.
-   **Design System**: Mobile-first responsive design, 8px grid, dual-mode theming, multi-language typography (Noto Sans KR, SF Pro Display), accessibility (44px touch targets, 4.5:1 contrast).
-   **SEO**: `react-helmet-async` for dynamic meta tags.
-   **Key Decisions**: Component-based architecture, CSS variable theming, content-first with ad zones, path aliases, SEO-first.

### Backend

-   **Framework**: Express.js with TypeScript on Node.js (ESM).
-   **Build System**: `esbuild` for production, `tsx` for development, Vite integration for HMR.
-   **API Structure**: RESTful (`/api` prefix), logging middleware, standardized error handling, session management via `connect-pg-simple`.
-   **Storage**: Interface-based `IStorage` implemented by `DbStorage` class using PostgreSQL via Drizzle ORM.
-   **Key Decisions**: Separation of concerns, environment separation, type-safe API contracts via `shared/` directory, middleware-first processing.

### Data Storage

-   **Current**: PostgreSQL (Neon) - **Migration Completed (October 2025)**
-   **Schema**: Defined in `shared/schema.ts` using Drizzle ORM, with Zod validation.
-   **Database**: `@neondatabase/serverless` for Neon compatibility, migration support.
-   **Storage Implementation**: `DbStorage` class implementing `IStorage` interface for all CRUD operations.
-   **Data Status**: 
    - 30 restaurant records (15 unique Seoul restaurants)
    - Complete menu data for all restaurants
    - External reviews from Google, Naver, TripAdvisor
    - YouTube video content integration
    - **AI insights for all 30 restaurants** (review summaries, recommendations, cultural tips)
-   **Key Decisions**: Interface-based abstraction, shared schema for type consistency, serverless-ready (Neon), migration-first.

### Authentication and Authorization

-   **System**: Replit Auth with OIDC (OpenID Connect)
-   **Implementation**: Passport.js strategy, session-based authentication via `connect-pg-simple`
-   **User Management**: Auto-upsert on login (claims.sub → users.id), JWT refresh token support
-   **Storage**: User schema with id (OIDC sub), email, firstName, lastName, profileImageUrl
-   **Key Decisions**: Cookie-based sessions, PostgreSQL session store, isAuthenticated middleware

### User Reviews

-   **Features**: Create, read, update, delete reviews with ownership validation
-   **Schema**: reviews table with userId (FK to users), restaurantId (FK to restaurants), rating (1-5 stars), comment, timestamps
-   **API Endpoints**:
    - POST /api/reviews (auth required) - Create review
    - PATCH /api/reviews/:id (auth + ownership) - Update review
    - DELETE /api/reviews/:id (auth + ownership) - Delete review
    - GET /api/reviews/:restaurantId - Get all reviews for restaurant
-   **Auto-updates**: Restaurant rating recalculated on review create/update/delete
-   **Frontend**: Dialog-based review editor, star rating input, ownership-based Edit/Delete buttons
-   **Key Decisions**: User-owned reviews only, automatic rating aggregation, React Query cache invalidation

### Analytics and Tracking

-   **Platform**: Google Analytics 4 (GA4)
-   **Implementation**: Custom analytics.ts utility with gtag integration
-   **Tracking**:
    - Automatic page view tracking on route changes (useAnalytics hook)
    - Custom event tracking via trackEvent function
    - Initialization on app mount with VITE_GA_MEASUREMENT_ID
-   **Files**: client/src/lib/analytics.ts, client/src/hooks/use-analytics.tsx, client/env.d.ts
-   **Configuration**: Requires VITE_GA_MEASUREMENT_ID secret (optional, graceful degradation if missing)

### Restaurant Dashboard (B2B Backend - Phase 4)

-   **Purpose**: Enable restaurant owners to manage their restaurants, respond to reviews, track analytics, and create promotions
-   **Database Tables**:
    - `restaurantOwners`: Links users to restaurants they own/manage (userId, restaurantId, role)
    - `reviewResponses`: Restaurant owner responses to customer reviews (reviewId, restaurantId, userId, response, timestamps)
    - `promotions`: Promotional offers (title, description in KR/EN, discountType, dates, isActive)
-   **Storage Methods**: 14 methods including ownership verification, response CRUD, promotion management, dashboard statistics
-   **API Endpoints** (11 total):
    - Ownership: GET /api/my-restaurants, GET /api/restaurants/:id/is-owner
    - Analytics: GET /api/restaurants/:id/dashboard-stats (review stats, rating distribution, monthly trends)
    - Review Responses: GET/POST/PATCH/DELETE /api/review-responses
    - Promotions: GET/POST/PATCH/DELETE /api/promotions, GET /api/restaurants/:id/all-promotions
-   **Status**: Backend complete, frontend UI pending implementation
-   **Key Features**:
    - Ownership verification middleware for all restaurant management actions
    - Complete CRUD for review responses (one response per review)
    - Promotion management with date-based activation
    - Dashboard statistics: total reviews, average rating, rating distribution, monthly review counts

### AI Restaurant Insights

-   **Mechanism**: Pre-generated AI insights for restaurants (review summaries, "best for" scenarios, cultural tips, first-timer tips) stored in a `restaurantInsights` table.
-   **Status**: **All 30 restaurants have complete AI insights** (Korean & English) - Generated October 2025
-   **API**: Endpoints for fetching insights and admin-triggered batch generation.
-   **AI Integration**: Uses Google Gemini 2.5 Flash (`@google/genai`) for bilingual content generation.
-   **Content Generated**:
    - Review summaries analyzing customer feedback
    - "Best for" dining situations (traditional, business, romantic, etc.)
    - Cultural dining etiquette tips
    - First-timer recommendations
-   **Optimization**: One-time generation reduces API costs; insights are cached and integrated into AI chat context for enhanced recommendations.

### Progressive Web App (PWA)

-   **Core**: `manifest.json`, `sw.js` (Service Worker), `main.tsx` registration.
-   **Features**: Offline-first caching strategy, installability (Add to Home Screen), standalone display, app icons, Apple mobile web app meta tags, app shortcuts (AI Guide, Saved).
-   **Goals**: Mobile app-like experience, fast loading, robust offline capabilities.

### SEO and Search Optimization

-   **Components**: `SEO.tsx` (React Helmet Async for dynamic meta tags), `structuredData.ts` (Schema.org JSON-LD), `sitemap.xml`, `robots.txt`.
-   **Features**: Page-specific meta tags, Open Graph/Twitter Card support, canonical URLs, multilingual SEO (`hreflang` for 8 languages), structured data for rich snippets.
-   **Targets**: Google Search, LLM AI searches, social media, mobile app store SEO.

## External Dependencies

### AI Integration

-   `@google/genai` v1.25.0: Google Generative AI SDK for AI concierge and content generation.

### UI Framework & Utilities

-   `@radix-ui/*`: Accessible, unstyled UI primitives.
-   `class-variance-authority`: Type-safe variant styling.
-   `cmdk`: Command menu component.
-   `embla-carousel-react`: Carousel/slider.
-   `lucide-react`: Icon library.
-   `react-day-picker`: Date picker.
-   `react-hook-form`: Form state management.
-   `vaul`: Drawer component.

### Data & Validation

-   `zod`: Schema validation.
-   `@hookform/resolvers`: Form validation integration.
-   `date-fns`: Date manipulation utilities.

### Database & ORM

-   `drizzle-orm` v0.39.1: TypeScript ORM.
-   `drizzle-zod`: Zod schema generation from Drizzle schemas.
-   `@neondatabase/serverless`: Serverless PostgreSQL driver for Neon.
-   `connect-pg-simple`: PostgreSQL session store for Express.

### Build & Development Tools

-   `vite`: Frontend build tool and dev server.
-   `@vitejs/plugin-react`: React integration for Vite.
-   `tailwindcss`, `autoprefixer`: CSS processing.
-   `tsx`: TypeScript execution for development.
-   `esbuild`: Fast JavaScript bundler for production.
-   `@replit/*`: Replit-specific development plugins.

### Routing & State

-   `wouter`: Lightweight client-side routing.
-   `@tanstack/react-query` v5.60.5: Server state management with caching.