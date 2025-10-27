# 한식당 (han sik dang) 확장성 마이그레이션 가이드

## 개요

한식당 플랫폼은 MVP(30-50개 레스토랑)에서 엔터프라이즈급 규모(수만 개 레스토랑, 수십만 개 이미지, 수백만 사용자)로 확장하기 위한 아키텍처 변경을 완료했습니다.

### 주요 변경사항

1. **데이터베이스**: Neon PostgreSQL → Supabase PostgreSQL (연결 풀링, 더 큰 용량)
2. **이미지 저장소**: 로컬 파일 시스템 → Replit Object Storage (무제한 확장)
3. **외부 데이터 수집**: 새로운 REST API 엔드포인트 추가
4. **연결 풀링**: postgres.js를 사용한 효율적인 데이터베이스 연결 관리

---

## Phase 1: Supabase 마이그레이션

### 1.1 Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 로그인
2. "New Project" 클릭
3. 프로젝트 설정:
   - **Name**: hansikdang-production
   - **Database Password**: 안전한 비밀번호 생성
   - **Region**: 서울(ap-northeast-2) 또는 가까운 지역 선택
4. 프로젝트 생성 완료 대기 (2-3분)

### 1.2 데이터베이스 연결 정보 확인

1. Supabase 대시보드에서 **Settings** → **Database** 이동
2. **Connection string** 섹션에서 **URI** 복사:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### 1.3 환경 변수 설정

Replit Secrets에 다음 환경 변수를 추가:

```bash
# Supabase 데이터베이스 (프로덕션용)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
USE_SUPABASE=true

# 기존 Neon 데이터베이스는 백업용으로 유지
# DATABASE_URL_NEON=postgresql://...
```

### 1.4 데이터베이스 스키마 마이그레이션

```bash
# 1. Supabase를 활성화
export USE_SUPABASE=true

# 2. 스키마 푸시 (Drizzle ORM이 자동으로 테이블 생성)
npm run db:push

# 경고가 나타나면:
npm run db:push --force
```

### 1.5 데이터 마이그레이션 (옵션)

기존 Neon 데이터를 Supabase로 이동하려면:

```bash
# Neon에서 데이터 덤프
pg_dump $DATABASE_URL_NEON > neon_backup.sql

# Supabase로 복원
psql $DATABASE_URL < neon_backup.sql
```

---

## Phase 2: Replit Object Storage 설정

### 2.1 Object Storage 버킷 생성

1. Replit 에디터에서 **Tools** → **Object Storage** 클릭
2. 두 개의 버킷 생성:
   - **hansikdang-private**: 사용자 업로드 이미지 (비공개)
   - **hansikdang-public**: 정적 애셋 (공개)

### 2.2 환경 변수 설정

```bash
# Private Object Storage (사용자 업로드)
PRIVATE_OBJECT_DIR=/hansikdang-private

# Public Object Storage (정적 애셋, 쉼표로 구분)
PUBLIC_OBJECT_SEARCH_PATHS=/hansikdang-public/assets,/hansikdang-public/static
```

### 2.3 이미지 업로드 테스트

레스토랑 대시보드(`/dashboard`)에서:
1. 레스토랑 선택
2. "Upload Image" 버튼 클릭
3. 이미지 선택 및 업로드
4. Object Storage에 저장 확인

### 2.4 기존 이미지 마이그레이션 (옵션)

로컬 파일 시스템의 이미지를 Object Storage로 마이그레이션:

```bash
# 스크립트 작성 필요 (향후 구현)
node scripts/migrate-images-to-object-storage.js
```

---

## Phase 3: 외부 데이터 수집 프로젝트 연동

### 3.1 API 키 생성

```bash
# 안전한 API 키 생성
openssl rand -hex 32

# Replit Secrets에 추가
DATA_COLLECTION_API_KEY=<생성된-키>
```

### 3.2 외부 데이터 수집 API 엔드포인트

#### 3.2.1 레스토랑 대량 추가
```http
POST /api/external/restaurants
Headers:
  x-api-key: <DATA_COLLECTION_API_KEY>
  Content-Type: application/json

Body:
{
  "restaurants": [
    {
      "name": "서울 한정식",
      "nameEn": "Seoul Hanjeongsik",
      "description": "전통 한정식 전문점",
      "descriptionEn": "Traditional Korean full-course meal restaurant",
      "cuisineType": "한정식",
      "priceRange": "$$$$",
      "district": "강남구",
      "address": "서울시 강남구...",
      "phone": "02-1234-5678",
      "latitude": 37.5665,
      "longitude": 126.9780,
      "isActive": true,
      "isVegan": false,
      "isHalal": false
    }
  ]
}

Response:
{
  "success": 1,
  "failed": 0,
  "errors": []
}
```

#### 3.2.2 외부 리뷰 대량 추가
```http
POST /api/external/reviews
Headers:
  x-api-key: <DATA_COLLECTION_API_KEY>
  Content-Type: application/json

Body:
{
  "reviews": [
    {
      "restaurantId": 1,
      "source": "Naver",
      "rating": 4.5,
      "comment": "음식이 정말 맛있어요!",
      "commentEn": "The food is really delicious!",
      "author": "김철수",
      "publishedAt": "2025-01-15T10:00:00Z",
      "imageUrls": []
    }
  ]
}

Response:
{
  "success": 1,
  "failed": 0,
  "errors": []
}
```

#### 3.2.3 메뉴 대량 추가
```http
POST /api/external/menus
Headers:
  x-api-key: <DATA_COLLECTION_API_KEY>
  Content-Type: application/json

Body:
{
  "menus": [
    {
      "restaurantId": 1,
      "name": "김치찌개",
      "nameEn": "Kimchi Jjigae",
      "description": "전통 김치찌개",
      "descriptionEn": "Traditional kimchi stew",
      "price": 9000,
      "category": "찌개",
      "isSpicy": true,
      "isVegetarian": false,
      "imageUrl": null
    }
  ]
}

Response:
{
  "success": 1,
  "failed": 0,
  "errors": []
}
```

#### 3.2.4 데이터 수집 상태 확인
```http
GET /api/external/status
Headers:
  x-api-key: <DATA_COLLECTION_API_KEY>

Response:
{
  "timestamp": "2025-10-27T12:00:00.000Z",
  "database": "Supabase",
  "statistics": {
    "restaurants": 30,
    "reviews": 130,
    "menus": 145
  }
}
```

### 3.3 Python 예제 코드

외부 데이터 수집 프로젝트에서 사용할 Python 코드:

```python
import requests
import os

API_BASE_URL = "https://hansikdang.replit.app"
API_KEY = os.environ["DATA_COLLECTION_API_KEY"]

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

# 레스토랑 추가
def add_restaurants(restaurants):
    response = requests.post(
        f"{API_BASE_URL}/api/external/restaurants",
        headers=headers,
        json={"restaurants": restaurants}
    )
    return response.json()

# 리뷰 추가
def add_reviews(reviews):
    response = requests.post(
        f"{API_BASE_URL}/api/external/reviews",
        headers=headers,
        json={"reviews": reviews}
    )
    return response.json()

# 메뉴 추가
def add_menus(menus):
    response = requests.post(
        f"{API_BASE_URL}/api/external/menus",
        headers=headers,
        json={"menus": menus}
    )
    return response.json()

# 상태 확인
def get_status():
    response = requests.get(
        f"{API_BASE_URL}/api/external/status",
        headers=headers
    )
    return response.json()

# 사용 예제
if __name__ == "__main__":
    # 상태 확인
    status = get_status()
    print(f"현재 데이터베이스: {status['database']}")
    print(f"레스토랑 수: {status['statistics']['restaurants']}")
    
    # 레스토랑 추가
    new_restaurants = [
        {
            "name": "테스트 레스토랑",
            "nameEn": "Test Restaurant",
            # ... 나머지 필드
        }
    ]
    result = add_restaurants(new_restaurants)
    print(f"성공: {result['success']}, 실패: {result['failed']}")
```

---

## Phase 4: 성능 최적화 설정

### 4.1 연결 풀링 설정

`server/storage.ts`에서 자동으로 설정됨:

```typescript
const pool = postgres(connectionString, {
  max: 10,              // 최대 10개 동시 연결
  idle_timeout: 20,     // 20초 유휴 타임아웃
  connect_timeout: 10,  // 10초 연결 타임아웃
});
```

### 4.2 인덱스 최적화

주요 쿼리 성능을 위한 복합 인덱스가 이미 설정되어 있음:
- `restaurants`: district, cuisineType, priceRange
- `reviews`: restaurantId, userId
- `menus`: restaurantId

### 4.3 캐싱 전략

API 응답 캐싱이 이미 설정되어 있음:
- 레스토랑 목록: 5분 stale-while-revalidate
- AI 채팅: 캐싱 없음 (실시간)

---

## 환경 변수 전체 목록

### 필수 환경 변수

```bash
# 데이터베이스 (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
USE_SUPABASE=true

# Object Storage
PRIVATE_OBJECT_DIR=/hansikdang-private
PUBLIC_OBJECT_SEARCH_PATHS=/hansikdang-public/assets,/hansikdang-public/static

# 외부 데이터 수집
DATA_COLLECTION_API_KEY=<32-byte-hex-key>

# 기존 환경 변수 (유지)
GEMINI_API_KEY=<your-gemini-api-key>
NAVER_MAPS_CLIENT_ID=<your-naver-maps-client-id>
SESSION_SECRET=<your-session-secret>
VITE_GA_MEASUREMENT_ID=<your-ga-measurement-id>
```

### 옵션 환경 변수

```bash
# 백업용 Neon 데이터베이스
DATABASE_URL_NEON=postgresql://...

# 개발 환경에서 Neon 사용
# USE_SUPABASE=false
```

---

## 롤백 계획

문제가 발생하면 즉시 롤백:

```bash
# 1. Neon 데이터베이스로 되돌리기
export USE_SUPABASE=false

# 2. 애플리케이션 재시작
npm run dev

# 3. Object Storage는 독립적이므로 영향 없음
```

---

## 모니터링 및 로깅

### 로그 확인

```bash
# 서버 로그 확인
tail -f server.log

# 데이터베이스 연결 확인
grep "Database connection" server.log

# Object Storage 오류 확인
grep "Object" server.log
```

### 성능 모니터링

Supabase 대시보드에서:
1. **Database** → **Query Performance** 확인
2. **Database** → **Connection Pooling** 상태 확인
3. **Logs** → 느린 쿼리 분석

---

## FAQ

### Q1: Supabase와 Neon을 동시에 사용할 수 있나요?
A: 네. `USE_SUPABASE` 환경 변수로 전환 가능합니다. 개발은 Neon, 프로덕션은 Supabase로 사용할 수 있습니다.

### Q2: Object Storage 비용은?
A: Replit Object Storage는 사용량 기반 과금입니다. 첫 10GB는 무료, 이후는 GB당 $0.10/월입니다.

### Q3: 외부 데이터 수집 API 속도 제한은?
A: 현재 속도 제한이 없지만, 대량 데이터는 배치 처리(한 번에 100개씩)를 권장합니다.

### Q4: 이미지 최대 크기는?
A: 현재 5MB로 제한되어 있습니다. 필요시 `server/routes.ts`의 `multer` 설정에서 변경 가능합니다.

### Q5: 연결 풀링이 작동하는지 확인하려면?
A: Supabase 대시보드의 **Database** → **Connection Pooling**에서 활성 연결 수를 확인할 수 있습니다.

---

## 다음 단계

1. ✅ Supabase 마이그레이션
2. ✅ Object Storage 설정
3. ✅ 외부 데이터 수집 API 연동
4. 🔄 대량 데이터 수집 프로젝트 시작
5. 🔄 AI 인사이트 자동 생성 확장
6. 🔄 다국어 번역 자동화
7. 🔄 프로덕션 배포

---

**작성일**: 2025년 10월 27일  
**버전**: 1.0  
**담당자**: 한식당 개발팀
