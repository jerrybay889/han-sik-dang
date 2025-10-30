# Data Hub 인기지수 시스템 업그레이드 지시사항

## 🎯 목표
네이버/구글 평점 및 리뷰수를 수집하여 종합 인기지수를 계산하는 시스템 구축

---

## 📊 추가 수집 필드

### 1. 네이버 데이터
**파일:** `data-hub/src/scrapers/naver_maps_api.py`

```python
# 기존 수집 항목에 추가
{
    # 기존 필드들...
    "naver_rating": 4.5,           # 네이버 평점 (0.0-5.0)
    "naver_review_count": 1234,    # 네이버 리뷰 개수
}
```

**수집 방법:**
```python
def get_place_details(self, place_id):
    """
    네이버 플레이스 상세 정보에서 평점/리뷰수 추출
    
    API Response 예시:
    {
        "place": {
            "visitorReviewCount": 1234,  # 리뷰수
            "visitorReviewScore": 4.5     # 평점
        }
    }
    """
    url = f"https://pcmap.place.naver.com/restaurant/{place_id}"
    # HTML 파싱 또는 API 호출
    # <span class="place_section_count">리뷰 1,234</span>
    # <span class="rate_primary"><em>4.5</em></span>
    
    return {
        "naver_rating": float(rating),
        "naver_review_count": int(review_count)
    }
```

---

### 2. 구글 데이터
**파일:** `data-hub/src/scrapers/google_maps_scraper.py` (Apify 활용)

```python
from apify_client import ApifyClient

def get_google_place_data(place_name, address):
    """
    Apify Google Maps Scraper로 평점/리뷰수 수집
    
    Returns:
    {
        "google_rating": 4.3,
        "google_review_count": 856,
        "google_place_id": "ChIJ...",
        "plus_code": "8Q98+XY Seoul"
    }
    """
    client = ApifyClient(os.getenv("APIFY_API_TOKEN"))
    
    run_input = {
        "searchStringsArray": [f"{place_name} {address}"],
        "maxCrawledPlacesPerSearch": 1,
        "language": "ko",
    }
    
    run = client.actor("nwua9Gu5YrADL7ZDj").call(run_input=run_input)
    
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        return {
            "google_rating": item.get("totalScore", 0.0),
            "google_review_count": item.get("reviewsCount", 0),
            "google_place_id": item.get("placeId"),
            "plus_code": item.get("plusCode")
        }
```

---

## 🧮 인기지수 계산 로직

**파일:** `data-hub/src/processors/popularity_calculator.py` (신규 생성)

```python
class PopularityCalculator:
    """
    네이버/구글 평점과 리뷰수를 기반으로 종합 인기지수(0-100) 계산
    """
    
    @staticmethod
    def calculate_popularity_score(
        naver_rating: float = 0.0,
        naver_review_count: int = 0,
        google_rating: float = 0.0,
        google_review_count: int = 0
    ) -> float:
        """
        인기지수 계산 공식:
        
        1. 평점 점수 (50점 만점)
           - 네이버 평점: (naver_rating / 5.0) * 25점
           - 구글 평점: (google_rating / 5.0) * 25점
        
        2. 리뷰수 점수 (50점 만점)
           - 네이버 리뷰수: min(naver_review_count / 100, 1.0) * 25점
           - 구글 리뷰수: min(google_review_count / 100, 1.0) * 25점
        
        3. 최종 점수 = 평점 점수 + 리뷰수 점수 (0-100)
        
        예시:
        - 네이버 4.5점 (1,200개), 구글 4.3점 (856개)
        - 평점: (4.5/5)*25 + (4.3/5)*25 = 22.5 + 21.5 = 44점
        - 리뷰수: min(1200/100, 1)*25 + min(856/100, 1)*25 = 25 + 25 = 50점
        - 최종: 44 + 50 = 94점 (매우 인기)
        """
        
        # 평점 점수 (최대 50점)
        rating_score = 0.0
        if naver_rating > 0:
            rating_score += (naver_rating / 5.0) * 25
        if google_rating > 0:
            rating_score += (google_rating / 5.0) * 25
        
        # 리뷰수 점수 (최대 50점)
        # 리뷰 100개를 기준점으로 설정 (100개 이상은 만점)
        review_score = 0.0
        if naver_review_count > 0:
            review_score += min(naver_review_count / 100, 1.0) * 25
        if google_review_count > 0:
            review_score += min(google_review_count / 100, 1.0) * 25
        
        # 최종 점수 (0-100)
        final_score = round(rating_score + review_score, 1)
        
        return final_score
    
    @staticmethod
    def get_popularity_tier(score: float) -> str:
        """
        인기지수 등급 분류
        - 90-100: 최고 인기 (Top Rated)
        - 70-89: 높은 인기 (Highly Popular)
        - 50-69: 인기 (Popular)
        - 30-49: 보통 (Average)
        - 0-29: 신규/정보 부족 (New/Limited Data)
        """
        if score >= 90:
            return "top_rated"
        elif score >= 70:
            return "highly_popular"
        elif score >= 50:
            return "popular"
        elif score >= 30:
            return "average"
        else:
            return "new_or_limited"
```

---

## 🔄 데이터 파이프라인 통합

**파일:** `data-hub/src/api/main.py`

```python
from src.processors.popularity_calculator import PopularityCalculator

@app.post("/api/restaurants/batch")
async def create_restaurants_batch(restaurants: List[dict]):
    """
    배치 레스토랑 생성 시 인기지수 자동 계산
    """
    results = []
    
    for restaurant_data in restaurants:
        # 1. 네이버/구글 데이터 수집 (기존 로직)
        naver_data = naver_scraper.get_place_details(restaurant_data["name"])
        google_data = google_scraper.get_google_place_data(
            restaurant_data["name"], 
            restaurant_data["address"]
        )
        
        # 2. 인기지수 계산 (신규)
        popularity_score = PopularityCalculator.calculate_popularity_score(
            naver_rating=naver_data.get("naver_rating", 0.0),
            naver_review_count=naver_data.get("naver_review_count", 0),
            google_rating=google_data.get("google_rating", 0.0),
            google_review_count=google_data.get("google_review_count", 0)
        )
        
        # 3. 메인 시스템 API 호출
        payload = {
            **restaurant_data,
            "naver_rating": naver_data.get("naver_rating"),
            "naver_review_count": naver_data.get("naver_review_count"),
            "google_rating": google_data.get("google_rating"),
            "google_review_count": google_data.get("google_review_count"),
            "popularity_score": popularity_score,
        }
        
        response = await send_to_main_system(payload)
        results.append(response)
    
    return {"created": len(results), "details": results}
```

---

## 📝 데이터베이스 스키마 (Data Hub 내부)

**파일:** `data-hub/src/models/restaurant.py`

```python
class ProcessedRestaurant(BaseModel):
    # 기존 필드들...
    
    # 신규 추가 필드
    naver_rating: float = 0.0
    naver_review_count: int = 0
    google_rating: float = 0.0
    google_review_count: int = 0
    popularity_score: float = 0.0
    popularity_tier: str = "new_or_limited"  # top_rated, highly_popular, popular, average, new_or_limited
```

---

## 🧪 테스트 방법

### 1. 단위 테스트
```python
# test_popularity.py
from src.processors.popularity_calculator import PopularityCalculator

def test_high_popularity():
    """높은 인기 레스토랑 테스트"""
    score = PopularityCalculator.calculate_popularity_score(
        naver_rating=4.5,
        naver_review_count=1200,
        google_rating=4.3,
        google_review_count=856
    )
    assert score >= 90, f"Expected >= 90, got {score}"
    assert PopularityCalculator.get_popularity_tier(score) == "top_rated"

def test_average_popularity():
    """보통 인기 레스토랑 테스트"""
    score = PopularityCalculator.calculate_popularity_score(
        naver_rating=3.5,
        naver_review_count=30,
        google_rating=3.8,
        google_review_count=25
    )
    assert 30 <= score < 70, f"Expected 30-70, got {score}"

def test_new_restaurant():
    """신규 레스토랑 (데이터 부족) 테스트"""
    score = PopularityCalculator.calculate_popularity_score(
        naver_rating=0.0,
        naver_review_count=0,
        google_rating=4.0,
        google_review_count=5
    )
    assert score < 50, f"Expected < 50, got {score}"

# 실행
pytest test_popularity.py -v
```

### 2. 실제 데이터 테스트
```bash
# 1개 레스토랑 테스트
python3 -c "
from src.scrapers.naver_maps_api import NaverMapsScraper
from src.scrapers.google_maps_scraper import GoogleMapsScraper
from src.processors.popularity_calculator import PopularityCalculator

# 데이터 수집
naver = NaverMapsScraper()
google = GoogleMapsScraper()

naver_data = naver.get_place_details('강남역 한식당')
google_data = google.get_google_place_data('강남역 한식당', '서울시 강남구')

# 인기지수 계산
score = PopularityCalculator.calculate_popularity_score(
    naver_rating=naver_data['naver_rating'],
    naver_review_count=naver_data['naver_review_count'],
    google_rating=google_data['google_rating'],
    google_review_count=google_data['google_review_count']
)

print(f'네이버: {naver_data[\"naver_rating\"]}점 ({naver_data[\"naver_review_count\"]}개)')
print(f'구글: {google_data[\"google_rating\"]}점 ({google_data[\"google_review_count\"]}개)')
print(f'인기지수: {score}점')
print(f'등급: {PopularityCalculator.get_popularity_tier(score)}')
"
```

---

## 📊 목표 품질 기준

### 각 레스토랑 필수 데이터
```
✅ 네이버 평점: 0.0-5.0 (소수점 1자리)
✅ 네이버 리뷰수: 정수
✅ 구글 평점: 0.0-5.0 (소수점 1자리)
✅ 구글 리뷰수: 정수
✅ 인기지수: 0-100 (소수점 1자리)
✅ 인기등급: top_rated | highly_popular | popular | average | new_or_limited
```

---

## 🚀 우선순위 작업 순서

### Phase 1: 즉시 (오늘)
1. ✅ `PopularityCalculator` 클래스 생성
2. ✅ 네이버 평점/리뷰수 수집 로직 추가
3. ✅ 인기지수 계산 테스트

### Phase 2: 내일
4. ✅ 구글 평점/리뷰수 수집 (Apify)
5. ✅ 메인 시스템 API 연동
6. ✅ 기존 190개 데이터 재처리

### Phase 3: 모레
7. ✅ 인기지수 기반 정렬 기능
8. ✅ 프론트엔드 UI 연동
9. ✅ 품질 검증

---

## ✅ 완료 체크리스트

- [ ] `popularity_calculator.py` - 인기지수 계산 로직 구현
- [ ] `naver_maps_api.py` - 평점/리뷰수 수집 추가
- [ ] `google_maps_scraper.py` - 평점/리뷰수 수집 추가
- [ ] `main.py` - 배치 API에 인기지수 계산 통합
- [ ] 단위 테스트 작성 및 실행
- [ ] 기존 190개 데이터 재처리
- [ ] 메인 시스템 API 연동 확인

---

## 🎯 최종 목표

**30일 후:**
- 레스토랑 수: 1,180개
- 평균 인기지수: 60점+
- 네이버 데이터: 100% (평점, 리뷰수)
- 구글 데이터: 80%+ (Apify 한도 내)
- Top Rated (90+): 10%
- Highly Popular (70-89): 30%
- Popular (50-69): 40%

**인기지수로 사용자 신뢰도 향상!** ✅
