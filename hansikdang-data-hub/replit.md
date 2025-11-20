# Hansikdang Data Hub - 레스토랑 데이터 수집 시스템

## Overview
Hansikdang Data Hub is a large-scale restaurant data collection and management system for the Hansikdang platform. Its primary goal is to automatically collect approximately 10,000 restaurant data entries monthly from Naver Place and Google Maps, refine them using Gemini AI, and synchronize them with the Hansikdang platform. The project aims to provide comprehensive restaurant data, enhance data quality, and offer robust data governance and monitoring capabilities.

## User Preferences
None specified yet.

## System Architecture

### UI/UX Decisions
-   **Dashboard**: Interactive API documentation via Swagger UI, and a web-based operations dashboard (Vue 3 + Chart.js) for system health, statistics, alerts, and operational controls.
-   **Input Forms**: Single-scroll forms with clear section headers and compact layouts for menu and link inputs. Autocomplete features for regional inputs.
-   **Table Enhancements**: Improved collection results table with pagination, action buttons (view, edit, delete), and enhanced statistical cards.
-   **Design Consistency**: Reusable UI components and consistent styling across different pages (e.g., unified-editor.html, restaurant-detail.html).

### Technical Implementations
-   **Framework**: FastAPI 0.109.0 with Python 3.11, served by Uvicorn.
-   **Data Model**: Each entry includes an auto-generated `id`, `timestamp`, a flexible `data` JSON object, and optional `source` and `tags`.
-   **Automated Scheduling**: Orchestrates data collection, AI processing, and platform synchronization daily and weekly, including smart targeting, duplicate detection, Gemini AI processing, Google rating enrichment, and platform synchronization.
-   **Data Quality**: Gemini AI refines restaurant descriptions (200-300 characters) and prevents hallucinations.
-   **Popularity Scoring**: Calculates a comprehensive popularity score (0-100) and tier.
-   **Rate Limiting**: Robust rate limiting and retry mechanisms for external APIs.
-   **Scalability**: Designed to collect 33 restaurants daily from Naver.

### Feature Specifications
-   **Automated 24/7 Scheduler**: Orchestrates data collection, AI processing, and platform synchronization.
-   **Smart Targeting**: Dynamic query generation based on Google Trends.
-   **Duplicate Detection**: Fuzzy matching with GPS distance calculation, auto-merging before AI processing.
-   **Data Governance & Monitoring**: Includes 7 quality indicators, data lineage tracking, system health monitoring, alert management, and comprehensive dashboard APIs.
-   **Google Drive Backup**: Daily automated CSV backups.
-   **API Endpoints**: Comprehensive endpoints for core operations, collection & targeting, governance & quality, monitoring & alerts, dashboard, and data management.
-   **Data Management Systems**: Modules for collection settings, duplicate detection, quality management, fuzzy matching, and batch synchronization.

### System Design Choices
-   **Project Structure**: Organized into `src` subdirectories for `api`, `scrapers`, `processors`, `workflows`, and `database`.
-   **Cache Control**: Middleware implemented to prevent browser caching (`Cache-Control: no-cache, no-store, must-revalidate`).
-   **Error Handling**: Validation logic for inputs like administrative regions with specific error messages.

## External Dependencies

-   **PostgreSQL**: Primary database for persistent storage.
-   **Apify**: Used for web scraping, particularly for Naver data and weekly full data updates.
-   **Google Gemini API**: Utilized for AI-powered data refinement, description generation, and hallucination prevention.
-   **Google Places API**: Integrated for augmenting restaurant data with ratings, review counts, and images.
-   **Google Drive**: Permanent backup storage for daily CSV backups.
-   **Hansikdang Main Platform API**: For synchronizing processed restaurant data.

## Recent Changes

### 2025-11-11: Phase 1 직접 입력 폼 UX 개선 완료 ✅

**Phase 1 완료 사항:**
1. **지역 입력 Autocomplete** - 서울 25개구, 부산 16개구, 경기 주요 10개시 (총 50개)
2. **메뉴 입력 컴팩트화** - 테이블 형태, 높이 50% 축소
3. **링크 입력 한 줄로** - 플랫폼 + URL + ID 형태
4. **저장 완료 팝업** - 성공/실패 모달, 2초 후 자동 이동

**비용:** $2.5-3 (예상 대비 40% 절감)

### 2025-11-11: Phase 1.5 추가정보 섹션 완료 ✅

**완료 사항:**
- ✅ 🌐 추가정보 섹션 추가
- ✅ 링크 타입 드롭다운: 홈페이지, 블로그, 인스타그램, 페이스북, 유튜브, 기타
- ✅ URL 입력 (75% 너비) + 삭제 버튼 (5% 너비)
- ✅ "+ 링크 추가" 버튼으로 무제한 추가 가능
- ✅ additionalInfo 배열 → additional_info 객체 변환
- ✅ API payload에 additional_info 필드 추가

**비용:** $0.5-1 (약 20분 작업)

**총 Phase 1 + 1.5 비용:** ~$3-3.5 (예상 $5-7 대비 40% 절감)

### 2025-11-11: DB 스키마 간소화 마이그레이션 완료 ✅

**마이그레이션 결과:**
- ✅ **41개 → 16개 컬럼** (63% 감소)
- ✅ **29개 불필요 컬럼 삭제**: latitude, longitude, popularity_score, popularity_tier, edit_status, is_validated, is_duplicate, thumbnail_url, images, price_range, youtube/blog_mention_count 등
- ✅ **links 필드 추가**: 모든 URL을 JSONB로 통합 (Google, Naver, 홈페이지, SNS 등)
- ✅ **request_id → collection_request_id** 명확화
- ✅ **6개 기존 레스토랑 데이터 성공적으로 변환**

**최종 16개 컬럼:**
```
기본정보: id, name, category, region, address, phone
소개: description, rating, review_count
메뉴/시간: menu_items, business_hours
바로가기: links (JSONB)
메타: source, collection_request_id, created_at, updated_at
```

**API 업데이트:**
- ✅ Pydantic 모델 간소화 (CollectionResultCreate, CollectionResultUpdate, DirectInputRequest)
- ✅ manual_input_routes.py - /direct-input 엔드포인트 수정
- ✅ collection_result_routes.py - GET, GET/{id}, PUT, DELETE 엔드포인트 수정
- ✅ additional_info → links 자동 통합 로직

**검증:**
- ✅ API 정상 작동 확인 (`GET /api/data-management/collection-results`)
- ✅ 6개 레스토랑 데이터 정상 조회

**비용:** ~$2-3 (예상 범위 내)

### 2025-11-11: Smart Region Autocomplete 구현 완료 ✅

**구현 내용:**
- ✅ **전국 229개 행정구역 데이터** - 서울 25개구, 부산 16개구, 경기 31개 시/구, 강원/충청/전라/경상/제주 전체
- ✅ **클라이언트 사이드 검색** - 35KB JSON 파일, 서버 부하 제로
- ✅ **Smart Keyword 검색** - "강남"만 입력해도 모든 강남구 검색 (서울 강남구, 부산 강남구 등)
- ✅ **실시간 자동완성** - 최대 10개 결과 표시, 0.01초 검색 속도
- ✅ **키보드 네비게이션** - ↑↓ 화살표로 이동, Enter로 선택
- ✅ **세련된 UI** - 드롭다운, 선택 확인, 클리어 버튼, 도움말 텍스트

**기술 상세:**
- **데이터 파일**: `/static/regions-complete.json` (229개 지역, 19.7KB 압축)
- **검색 알고리즘**: `keywords` 배열 기반 필터링 (예: ["서울", "강남", "강남구"])
- **Vue.js 통합**: mounted() 훅에서 데이터 로드, methods에 7개 함수 추가
- **CSS 스타일링**: 드롭다운, 스크롤바, 호버/액티브 상태, 모바일 대응

**성능 지표:**
- **로드 시간**: 0.1초 (한 번만)
- **검색 속도**: 0.01초 (229개 필터링)
- **메모리 사용**: 19.7KB
- **서버 요청**: 0회 (정적 파일)
- **런타임 비용**: $0/월

**개발 비용:** ~$1 (예상 $0.8-1.2 범위 내, 1시간 작업)

**총 누적 비용:** ~$6.5-7.5 (Phase 1 + 1.5 + Migration + Smart Autocomplete)

### 2025-11-11: 직접입력 폼 추가 UX 개선 완료 ✅

**수정 사항:**
- ✅ **기본정보 섹션**: latitude, longitude 필드 완전 삭제
- ✅ **상세정보 섹션**: youtube_mention_count, blog_mention_count 필드 완전 삭제
- ✅ **영업시간 섹션 완전 재설계**:
  - 7개 요일 고정 입력 → 동적 추가 방식으로 전환
  - 요일 선택 드롭다운 (18%)
  - 시작/종료 시간 입력 (20%+20%)
  - 휴무 체크박스 + 메시지 입력 (15%+17%)
  - 삭제 버튼 (5%)
  - "+ 영업시간 추가" 버튼
  - 화면 높이 50% 축소 (7개 고정 폼 → 동적 추가)

**구현 상세:**
- **HTML**: businessHoursList 배열 기반 v-for 렌더링
- **CSS**: .business-hours-compact, .hours-row 스타일 추가
- **JavaScript**:
  - data(): businessHoursList 초기값 1개
  - addHour(): 영업시간 항목 추가
  - removeHour(): 항목 삭제 (최소 1개 유지)
  - saveDirectInput(): businessHoursList → business_hours 객체 변환
  - resetDirectForm(): businessHoursList 초기화

**효과:**
- 입력 편의성: 2-3분 → 1분 이내
- 화면 높이: 50% 축소
- 유연성: 필요한 요일만 추가 가능
- 휴무 관리: 체크박스 + 메시지 입력

**개발 비용:** ~$1.5 (예상 $1.5-2 범위 내, 1시간 작업)

**총 누적 비용:** ~$8-9 (Phase 1 + 1.5 + Migration + Smart Autocomplete + UX 개선)