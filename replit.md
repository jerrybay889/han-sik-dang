# han sik dang (한식당) - Korean Restaurant Discovery Platform

## Overview

han sik dang is a hybrid content platform and utility app designed for discovering Korean restaurants, featuring content monetization through advertising. It offers restaurant search, rich media content (videos, blogs), and a mobile-first, visually-driven design emphasizing Korean food culture. The platform is a full-stack TypeScript web application utilizing React for the frontend and Express for the backend, built with Progressive Web App (PWA) capabilities. The project aims for a content-first approach with integrated ad monetization and strong SEO. It includes a comprehensive Admin Dashboard for platform management and a backend for a B2B Restaurant Dashboard. All 30 initial restaurants have pre-generated AI insights.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

-   **Framework**: React 18+ with TypeScript.
-   **Routing**: Wouter.
-   **State Management**: TanStack React Query v5 for server state and caching.
-   **UI Components**: shadcn/ui (New York style) built on Radix UI, styled with Tailwind CSS v4 and custom CSS variables.
-   **Design System**: Mobile-first responsive, 8px grid, dual-mode theming, multi-language typography (Noto Sans KR, SF Pro Display), accessibility-focused.
-   **SEO**: `react-helmet-async` for dynamic meta tags, structured data (Schema.org JSON-LD), sitemap, robots.txt, multilingual SEO.
-   **PWA**: `manifest.json`, Service Worker for offline caching, installability, standalone display, app icons, shortcuts.
-   **Features**: Naver Maps integration with 4-language support, GPS location services for "Nearby" filtering, advanced multi-criteria filtering (price, cuisine, sort), image lazy loading, code splitting.

### Backend

-   **Framework**: Express.js with TypeScript on Node.js (ESM).
-   **Build System**: `esbuild` for production, `tsx` for development.
-   **API Structure**: RESTful, logging middleware, standardized error handling, session management.
-   **Storage**: Interface-based `IStorage` implemented by `DbStorage` using PostgreSQL via Drizzle ORM.
-   **Authentication**: Replit Auth with OIDC via Passport.js, session-based (`connect-pg-simple`), auto-upsert on login, JWT refresh token support.
-   **Authorization**: Role-based access control with `isAdmin` field and middleware for admin routes.
-   **Admin Dashboard**: Master admin dashboard with 15+ API endpoints (`/api/admin/*`) for managing restaurants, users, reviews, announcements, and event banners, including platform statistics with charts.
-   **Restaurant Dashboard (Backend)**: Backend infrastructure for B2B restaurant management with 12 authenticated API endpoints for ownership verification, review responses, promotions, image management, and analytics.

### Data Storage

-   **Database**: PostgreSQL (Neon) with `@neondatabase/serverless`.
-   **ORM**: Drizzle ORM, with Zod validation for schema defined in `shared/schema.ts`.
-   **Content**: 30 restaurant records with complete menu data, external reviews, YouTube content integration, and AI insights.
-   **User Reviews**: CRUD operations with ownership validation, automatic restaurant rating recalculation.

### AI Integration

-   **Mechanism**: Pre-generated AI insights (review summaries, "best for" scenarios, cultural tips) stored in `restaurantInsights` table for all 30 restaurants.
-   **AI Tool**: Google Gemini 2.5 Flash (`@google/genai`) for bilingual content generation.

### Analytics

-   **Platform**: Google Analytics 4 (GA4) with custom utility for tracking page views and events.

## External Dependencies

### AI Integration

-   `@google/genai`: Google Generative AI SDK.

### UI Framework & Utilities

-   `@radix-ui/*`: Accessible UI primitives.
-   `class-variance-authority`: Type-safe variant styling.
-   `cmdk`: Command menu.
-   `embla-carousel-react`: Carousel/slider.
-   `lucide-react`: Icon library.
-   `react-day-picker`: Date picker.
-   `react-hook-form`: Form state management.
-   `vaul`: Drawer component.
-   `recharts`: Charting library for admin dashboard.

### Data & Validation

-   `zod`: Schema validation.
-   `@hookform/resolvers`: Form validation integration.
-   `date-fns`: Date manipulation utilities.

### Database & ORM

-   `drizzle-orm`: TypeScript ORM.
-   `drizzle-zod`: Zod schema generation from Drizzle schemas.
-   `@neondatabase/serverless`: Serverless PostgreSQL driver for Neon.
-   `connect-pg-simple`: PostgreSQL session store for Express.

### Build & Development Tools

-   `vite`: Frontend build tool and dev server.
-   `@vitejs/plugin-react`: React integration for Vite.
-   `tailwindcss`, `autoprefixer`: CSS processing.
-   `tsx`: TypeScript execution for development.
-   `esbuild`: Fast JavaScript bundler for production.

### Routing & State

-   `wouter`: Lightweight client-side routing.
-   `@tanstack/react-query`: Server state management with caching.

### Other Integrations

-   Google AdSense: For content monetization.
-   Naver Maps API: For interactive maps.
-   Google Analytics 4 (GA4): For platform analytics.
-   Replit Auth: For user authentication.