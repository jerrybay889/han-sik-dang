# han sik dang (한식당) - Korean Restaurant Discovery Platform

## Overview
han sik dang is a hybrid content platform and utility app for discovering Korean restaurants, integrating content monetization through advertising. It offers restaurant search, rich media, and a mobile-first, visually-driven design emphasizing Korean food culture. The platform is a full-stack TypeScript web application using React for the frontend and Express for the backend, built with PWA capabilities. It aims for a content-first approach with integrated ad monetization, strong SEO, and includes a comprehensive Admin Dashboard and a B2B Restaurant Dashboard. All 30 initial restaurants feature pre-generated AI insights. The platform is architected for enterprise scalability, supporting tens of thousands of restaurants, hundreds of thousands of images, and millions of users.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
-   **Framework**: React 18+ with TypeScript.
-   **Routing**: Wouter with a flat route structure; Admin routes use an HOC pattern for code separation within a single build.
-   **State Management**: TanStack React Query v5 for server state and caching.
-   **UI Components**: shadcn/ui (New York style) built on Radix UI, styled with Tailwind CSS v4 and custom CSS variables.
-   **Design System**: Fully responsive (mobile/tablet/desktop), 8px grid, dual-mode theming, multi-language typography, accessibility-focused.
-   **Internationalization (i18n)**: i18next with 9-language support, HTTP backend for translations, automatic language detection, localStorage persistence.
-   **SEO**: `react-helmet-async` for dynamic meta tags, structured data (Schema.org JSON-LD), sitemap, robots.txt, multilingual SEO.
-   **PWA**: `manifest.json`, Service Worker for offline caching, installability.
-   **Features**: Naver Maps integration with GPS, advanced multi-criteria filtering, image lazy loading, code splitting.

### Backend
-   **Framework**: Express.js with TypeScript on Node.js (ESM).
-   **Build System**: `esbuild` for production, `tsx` for development.
-   **API Structure**: RESTful, structured logging, standardized error handling with secure messages, session management.
-   **Storage**: Interface-based `IStorage` implemented by `DbStorage` using PostgreSQL via Drizzle ORM with transaction support.
-   **Query Safety**: Drizzle's parameterized methods prevent SQL injection.
-   **Authentication**: Replit Auth with OIDC via Passport.js, session-based (`connect-pg-simple`), JWT refresh token support.
-   **Authorization**: Role-based access control with `isAdmin` field and middleware.
-   **Admin Dashboard**: 30+ API endpoints (`/api/admin/*`) for platform management (restaurant applications, inquiries, notices, payments, user analytics, blog posts, AI task prioritization, platform statistics).
-   **Restaurant Dashboard**: B2B management system with 15+ authenticated endpoints for ownership verification, review response, promotions, image management, and analytics.

### Data Storage
-   **Database**: PostgreSQL (Supabase) with `postgres` client and connection pooling.
-   **ORM**: Drizzle ORM, with Zod validation.
-   **Content**: 30 restaurant records seeded (ready for menus, reviews, YouTube content, and AI insights).
-   **User Reviews**: CRUD operations with ownership validation and automatic rating recalculation.
-   **Admin Tables**: 23 total tables including platform management, restaurant operations, and AI insights.

### AI Integration
-   **Mechanism**: Pre-generated AI insights (review summaries, "best for" scenarios, cultural tips) stored in `restaurantInsights` table.
-   **AI Tool**: Google Gemini 2.5 Flash (`@google/genai`) for bilingual content generation.

### Analytics
-   **Platform**: Google Analytics 4 (GA4) for tracking page views and events.

## External Dependencies

### AI Integration
-   `@google/genai`: Google Generative AI SDK.

### UI Framework & Utilities
-   `@radix-ui/*`: Accessible UI primitives.
-   `lucide-react`: Icon library.
-   `shadcn/ui`: UI components built on Radix UI.
-   `tailwindcss`: CSS framework.
-   `recharts`: Charting library.

### Data & Validation
-   `zod`: Schema validation.
-   `drizzle-orm`: TypeScript ORM.
-   `@neondatabase/serverless`: Serverless PostgreSQL driver for Neon.

### Routing & State
-   `wouter`: Lightweight client-side routing.
-   `@tanstack/react-query`: Server state management.

### Internationalization
-   `i18next`: Internationalization framework.
-   `react-i18next`: React bindings for i18next.

### Other Integrations
-   Google AdSense: Content monetization.
-   Naver Maps API: Interactive maps.
-   Google Analytics 4 (GA4): Platform analytics.
-   Replit Auth: User authentication.
-   `@google-cloud/storage`: Google Cloud Storage client for Replit Object Storage.
-   `@uppy/core`, `@uppy/react`, `@uppy/dashboard`, `@uppy/aws-s3`: File upload components.
-   `postgres`: PostgreSQL client with connection pooling support.

## Enterprise Scalability Architecture (October 27, 2025)

### Overview
The platform has been architected to scale from MVP (30-50 restaurants) to enterprise-level (tens of thousands of restaurants, hundreds of thousands of images, millions of users).

### Scalability Features

#### 1. Database Layer - Flexible PostgreSQL Backend
-   **Dual Database Support**: Seamless switching between Neon (development) and Supabase (production) via `USE_SUPABASE` environment variable
-   **Connection Pooling**: postgres.js client with max 10 concurrent connections, 20s idle timeout, 10s connect timeout
-   **Query Optimization**: Composite indexes on critical columns (district+cuisineType+priceRange for restaurants)
-   **Transaction Support**: Atomic multi-step operations preventing orphaned data
-   **SQL Injection Prevention**: Drizzle ORM parameterized queries (`eq()`, `ilike()`, `or()`, `and()`)

#### 2. Object Storage - Scalable Image Management
-   **Replit Object Storage**: Google Cloud Storage backend for unlimited image storage
-   **ACL Policies**: Fine-grained access control with public/private visibility settings
-   **Two-Bucket Architecture**:
    -   `PRIVATE_OBJECT_DIR`: User-uploaded images with authentication
    -   `PUBLIC_OBJECT_SEARCH_PATHS`: Static assets with public access
-   **Upload Flow**: Client → Presigned URL → Direct GCS upload → Server metadata update
-   **Components**: `ObjectUploader.tsx` (frontend), `ObjectStorageService` (backend), `ObjectAcl` (permissions)

#### 3. External Data Collection API
-   **API Key Authentication**: Secure endpoints with `DATA_COLLECTION_API_KEY` validation
-   **Bulk Import Endpoints**:
    -   `POST /api/external/restaurants`: Batch restaurant creation
    -   `POST /api/external/reviews`: Batch external review import
    -   `POST /api/external/menus`: Batch menu item creation
    -   `GET /api/external/status`: Data collection statistics
-   **Error Handling**: Detailed success/failure tracking per batch item
-   **Use Case**: Connect with future web scraping/data collection projects

#### 4. Performance Optimizations
-   **API Response Caching**: 5-minute stale-while-revalidate for restaurant listings
-   **Image Lazy Loading**: `loading="lazy"` attribute on all images
-   **Code Splitting**: Vite-based route-level code splitting
-   **Structured Logging**: `server/logger.ts` with context-aware JSON formatting

### Environment Variables for Scalability

```bash
# Database (Supabase for Production)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
USE_SUPABASE=true

# Object Storage
PRIVATE_OBJECT_DIR=/hansikdang-private
PUBLIC_OBJECT_SEARCH_PATHS=/hansikdang-public/assets,/hansikdang-public/static

# External Data Collection
DATA_COLLECTION_API_KEY=<32-byte-hex-key>

# Existing
GEMINI_API_KEY=<key>
NAVER_MAPS_CLIENT_ID=<key>
SESSION_SECRET=<key>
VITE_GA_MEASUREMENT_ID=<key>
```

### Migration Guide
See `SCALABILITY_MIGRATION_GUIDE.md` for detailed instructions on:
-   Migrating from Neon to Supabase
-   Setting up Object Storage buckets
-   Connecting external data collection projects
-   Performance monitoring and optimization

### Current Status (Updated: October 27, 2025)
-   **Database**: ✅ **Supabase PostgreSQL (Active)** - 23 tables migrated, 30 restaurants seeded
-   **Images**: ✅ **Object Storage Configured** - Environment variables set (`PRIVATE_OBJECT_DIR`, `PUBLIC_OBJECT_SEARCH_PATHS`)
-   **Data Collection**: ✅ **External API Active** - API key generated (`DATA_COLLECTION_API_KEY`), endpoints ready
-   **Scale Target**: Ready for 10,000+ restaurants, 100,000+ images, 1M+ users

### Migration Completed
-   **From**: Neon PostgreSQL (local development)
-   **To**: Supabase PostgreSQL (production-ready)
-   **Method**: Transaction Pooler (port 6543) for IPv4 compatibility
-   **Status**: All enterprise scalability features activated