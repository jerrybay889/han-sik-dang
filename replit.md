# han sik dang (한식당) - Korean Restaurant Discovery Platform

## Overview

han sik dang is a hybrid content platform and utility app for discovering Korean restaurants, featuring content monetization through advertising. It offers restaurant search, rich media content (videos, blogs), and a mobile-first, visually-driven design emphasizing Korean food culture. The platform is a full-stack TypeScript web application using React for the frontend and Express for the backend, designed with Progressive Web App (PWA) capabilities. The project aims for a content-first approach with integrated ad monetization and strong SEO.

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
-   **Storage**: Interface-based `IStorage` (currently in-memory `MemStorage`), designed for future PostgreSQL integration via Drizzle ORM.
-   **Key Decisions**: Separation of concerns, environment separation, type-safe API contracts via `shared/` directory, middleware-first processing.

### Data Storage

-   **Current**: In-memory, with preparation for PostgreSQL.
-   **Schema**: Defined in `shared/schema.ts` using Drizzle ORM, with Zod validation.
-   **Database**: `@neondatabase/serverless` for Neon compatibility, migration support.
-   **Key Decisions**: Interface-based abstraction, shared schema for type consistency, serverless-ready (Neon), migration-first.

### Authentication and Authorization

-   **Foundation**: User schema, storage interface methods (`getUser`, `createUser`), session management with `connect-pg-simple`.
-   **Key Decisions**: Cookie-based sessions, prepared password storage, 401 handling, PostgreSQL integration for session store.

### AI Restaurant Insights

-   **Mechanism**: Pre-generated AI insights for restaurants (review summaries, "best for" scenarios, cultural tips, first-timer tips) stored in a `restaurantInsights` table.
-   **API**: Endpoints for fetching insights and admin-triggered batch generation.
-   **AI Integration**: Uses Google Gemini API (`@google/genai`) for bilingual content generation.
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