# Data Hub 긴급 품질 업그레이드 지시사항

## 🚨 발견된 심각한 품질 문제

### 현재 상태 (메인 플랫폼 190개 기준)
- ❌ 메뉴 데이터: 0개 (100% 누락)
- ❌ 설명 길이: 38-59자 (목표: 200자+)
- ❌ 썸네일 이미지: 경로만 있고 실제 파일 없음
- ❌ 네이버 PlaceID: 수집 안 함
- ❌ 구글 PlaceID/플러스 코드: 수집 안 함
- ❌ 실제 리뷰 데이터: 수집 안 함 (할루시네이션 발생)

---

## 🎯 업그레이드 목표

### 1. 네이버 Maps API 수집 개선
**파일:** `data-hub/src/scrapers/naver_maps_api.py`

**추가 수집 필드:**
```python
# 기존 수집 항목
- name, address, phone, latitude, longitude

# 신규 추가 필수
- naver_place_id (네이버 플레이스 고유 ID)
  → URL에서 추출: https://pcmap.place.naver.com/restaurant/{PLACE_ID}
  
- image_urls (복수 이미지, 최소 3장)
  → 실제 이미지 URL 수집 (썸네일 + 메뉴 + 인테리어)
  
- opening_hours (영업시간 상세)
  → 요일별 영업시간 (예: "월-금 11:00-22:00, 토-일 10:00-23:00")
  
- menu_items (메뉴 리스트)
  → [{name: "삼계탕", price: 15000}, {name: "백숙", price: 50000}]
  → 최소 3개 메뉴 수집
  
- reviews (실제 리뷰 5-10개)
  → [{author: "김**", rating: 5, comment: "삼계탕 국물이 진하고 맛있어요"}, ...]
  → Gemini AI 할루시네이션 방지용
```

**네이버 API 엔드포인트 참고:**
```
Place Detail API: /map-place/v1/place/{placeId}
Reviews API: /map-place/v1/place/{placeId}/reviews
Photos API: /map-place/v1/place/{placeId}/photos
```

---

### 2. 이미지 다운로드 시스템 구축
**새 파일:** `data-hub/src/downloaders/image_downloader.py`

```python
import requests
from pathlib import Path

class ImageDownloader:
    def __init__(self, save_dir="downloaded_images"):
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(exist_ok=True)
    
    def download_image(self, url, restaurant_name, index=0):
        """
        네이버/구글 이미지 다운로드
        Returns: 로컬 파일 경로 또는 Replit Object Storage URL
        """
        # 1. 이미지 다운로드
        # 2. 파일명 생성: f"{restaurant_name}-{index}.jpg"
        # 3. Replit Object Storage 업로드 (선택)
        # 4. URL 반환
        pass
```

**통합 위치:** `naver_maps_api.py`에서 이미지 URL 수집 후 즉시 다운로드

---

### 3. Gemini AI 프롬프트 개선
**파일:** `data-hub/src/processors/gemini.py`

**현재 문제:**
- 설명이 38-59자로 너무 짧음
- 실제 리뷰 없이 "예상"으로 할루시네이션
- 메뉴 정보 생성 안 함

**개선된 프롬프트:**
```python
RESTAURANT_PROMPT = """
당신은 한국 음식 전문가입니다. 다음 레스토랑 정보를 바탕으로 상세한 설명을 작성하세요.

**레스토랑 정보:**
- 이름: {name}
- 주소: {address}
- 카테고리: {category}
- 전화번호: {phone}
- 메뉴: {menu_items}
- 실제 고객 리뷰 (네이버/구글):
{real_reviews}

**작성 요구사항:**

1. **한글 설명 (200-300자, 필수):**
   - 첫 문장: 레스토랑의 핵심 특징 (대표 메뉴, 역사, 분위기)
   - 두 번째: 인기 메뉴 상세 (맛, 재료, 조리법)
   - 세 번째: 고객 리뷰 기반 장점 (위 실제 리뷰 참고)
   - 네 번째: 추천 방문 시간/상황
   - 예시: "1962년부터 3대째 이어온 전통 육류 전문점으로, 신선한 한우 육회와 불고기가 대표 메뉴입니다. 육회는 참기름과 배, 마늘을 버무려 고소하고 부드러운 식감이 일품이며, 불고기는 직접 만든 양념에 재워 달콤하면서도 깊은 맛이 특징입니다. 고객들은 '밑반찬이 정갈하고 맛있다', '직원분들이 친절하다'는 평가를 남겼습니다. 점심 특선 메뉴가 합리적인 가격으로 제공되어 직장인들에게 인기가 높습니다."

2. **영문 설명 (150-200자, 필수):**
   - 한글 설명의 핵심 내용을 자연스러운 영어로 번역
   - 외국인 관광객이 이해하기 쉽게 작성
   - 예시: "A traditional Korean beef restaurant since 1962, famous for fresh yukhoe (Korean beef tartare) and bulgogi. The yukhoe is mixed with sesame oil, pear, and garlic for a smooth texture, while the bulgogi is marinated in house-made sauce for a sweet and deep flavor. Customers praise the well-prepared side dishes and friendly staff. The lunch special menu is popular among office workers for its reasonable price."

3. **리뷰 인사이트 (실제 리뷰 기반, 100-150자):**
   - 위 실제 리뷰에서 공통적인 칭찬/불만 추출
   - "예상" 금지, 반드시 실제 리뷰 내용 인용
   - 예시: "고객들은 '육회가 신선하고 맛있다', '밑반찬이 다양하고 정갈하다', '직원이 친절하다'고 평가했습니다. 일부는 '가격이 다소 비싸다'는 의견도 있지만, 품질 대비 합리적이라는 반응이 많습니다."

4. **Best For (추천 상황, 80-100자):**
   - 실제 메뉴와 리뷰 기반으로 작성
   - 예시: "한우 육회와 불고기를 즐기고 싶은 분, 접대나 기념일 식사, 전통 한식을 경험하고 싶은 외국인 관광객"

5. **Cultural Tips (문화 팁, 80-100자):**
   - 한국 음식 문화 설명
   - 예시: "육회는 한국의 전통 음식으로, 신선한 생고기를 양념과 함께 먹는 요리입니다. 불고기는 '불에 구운 고기'라는 뜻으로, 달콤한 간장 양념이 특징입니다."

6. **First Timer Tips (첫 방문 팁, 80-100자):**
   - 실제 메뉴 기반 추천
   - 예시: "처음 방문한다면 '육회 + 불고기 세트'를 추천합니다. 점심 특선 메뉴(11:00-14:00)가 가성비가 좋습니다. 예약 권장합니다."

**JSON 출력 형식:**
{{
  "description_ko": "200-300자 한글 설명",
  "description_en": "150-200자 영문 설명",
  "review_insights_ko": "100-150자 리뷰 인사이트",
  "review_insights_en": "영문 번역",
  "best_for_ko": "80-100자",
  "best_for_en": "영문 번역",
  "cultural_tips_ko": "80-100자",
  "cultural_tips_en": "영문 번역",
  "first_timer_tips_ko": "80-100자",
  "first_timer_tips_en": "영문 번역",
  "quality_score": 85
}}

**중요:** "예상", "아마도", "것으로 보입니다" 같은 불확실한 표현 금지. 반드시 실제 데이터(메뉴, 리뷰)를 기반으로 작성하세요.
"""
```

---

### 4. 구글 Maps 데이터 통합 (선택)
**파일:** `data-hub/src/scrapers/google_maps_scraper.py`

**Apify 스크래퍼 활용:**
```python
from apify_client import ApifyClient

def scrape_google_place(place_name, address):
    """
    구글 Maps 데이터 수집
    Returns: {
        google_place_id: "ChIJ...",
        plus_code: "8Q98+XY Seoul",
        rating: 4.5,
        reviews: [...],
        photos: [...],
        menu_items: [...]
    }
    """
    # Apify Google Maps Scraper 호출
    # 네이버 데이터와 병합
    pass
```

**목표:** 네이버 + 구글 데이터 병합으로 품질 향상

---

### 5. 메뉴 데이터 필수 수집
**파일:** `data-hub/src/scrapers/naver_maps_api.py`

**메뉴 수집 로직:**
```python
def get_menu_items(self, place_id):
    """
    네이버 플레이스에서 메뉴 정보 수집
    Returns: [
        {"name": "삼계탕", "price": 15000, "description": "인삼, 대추 등 한약재가 들어간 보양식"},
        {"name": "백숙", "price": 50000, "description": "2-3인 가족 단위 추천"}
    ]
    """
    # 네이버 API 또는 HTML 파싱
    # 최소 3개 메뉴 수집
    pass
```

**데이터베이스 저장:**
```python
# processed 테이블에 menu_items 컬럼 추가
menu_items = JSONField()  # PostgreSQL JSONB
```

---

## 🚀 우선순위 작업 순서

### Phase 1: 즉시 (오늘)
1. ✅ 네이버 API에서 `naver_place_id` 추출
2. ✅ 메뉴 데이터 수집 (최소 3개)
3. ✅ 실제 리뷰 5-10개 수집
4. ✅ 이미지 URL 3장 수집

### Phase 2: 내일
5. ✅ Gemini AI 프롬프트 개선 (200자+ 설명)
6. ✅ 리뷰 기반 인사이트 생성
7. ✅ 이미지 다운로드 시스템 구축

### Phase 3: 모레
8. ✅ 구글 Maps 데이터 통합 (Apify)
9. ✅ 데이터 품질 검증 시스템
10. ✅ 기존 190개 데이터 재처리

---

## 📊 목표 품질 기준

### 최종 목표 (각 레스토랑)
```
✅ 한글 설명: 200-300자
✅ 영문 설명: 150-200자
✅ 메뉴: 최소 3개 (이름, 가격, 설명)
✅ 실제 리뷰: 5-10개
✅ 이미지: 최소 3장 (썸네일, 메뉴, 인테리어)
✅ 네이버 PlaceID: 필수
✅ 구글 PlaceID: 선택 (Apify 연동 시)
✅ 영업시간: 요일별 상세
✅ 전화번호: 필수
✅ Quality Score: 80점+
```

---

## 🔧 테스트 방법

### 1개 레스토랑 테스트:
```bash
# 1. 네이버 수집 테스트
python3 -c "from src.scrapers.naver_maps_api import NaverMapsScraper; s = NaverMapsScraper(); print(s.search_restaurants('강남 한식당', limit=1))"

# 2. Gemini 정제 테스트
python3 -c "from src.processors.gemini import GeminiProcessor; g = GeminiProcessor(); print(g.process_restaurant({...}))"

# 3. 품질 검증
# - 설명 길이 >= 200자
# - 메뉴 >= 3개
# - 리뷰 >= 5개
# - 이미지 >= 3개
```

---

## 💰 비용 예상

**무료 유지:**
- 네이버 Maps API: 무료 (월 1,000건)
- Gemini AI: 무료 (분당 10개 제한)

**추가 비용 (선택):**
- Apify (구글 Maps): $0-29/월
- Replit Object Storage: $0 (기본 포함)

---

## ✅ 완료 체크리스트

- [ ] `naver_maps_api.py` - PlaceID, 메뉴, 리뷰, 이미지 수집 추가
- [ ] `gemini.py` - 프롬프트 개선 (200자+ 설명, 리뷰 기반)
- [ ] `image_downloader.py` - 이미지 다운로드 시스템 구축
- [ ] `google_maps_scraper.py` - 구글 데이터 통합 (선택)
- [ ] 기존 190개 데이터 재처리
- [ ] 품질 검증 (Quality Score 80+)

---

## 🎯 최종 목표

**30일 후:**
- 레스토랑 수: 1,180개
- 평균 Quality Score: 85점+
- 메뉴 데이터: 100%
- 이미지: 100% (3장+)
- 실제 리뷰 기반: 100%

**모든 할루시네이션 제거, 실제 데이터만 사용!** ✅
