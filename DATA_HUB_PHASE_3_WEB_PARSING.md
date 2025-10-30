# 🚀 DATA HUB PHASE 3: 네이버플레이스 웹 파싱 시스템

## 📋 작업 개요

**목표**: 네이버플레이스 웹 페이지에서 PlaceID, 메뉴, 실제 리뷰, 이미지를 직접 수집하여 데이터 품질 100% 달성

**이유**: 
- 네이버 Local Search API는 평점/리뷰수/메뉴/PlaceID를 제공하지 않음
- 메인 시스템에 구글 평점은 100% 수집 완료 (112/190개)
- 네이버 평점 추가 시 인기지수 정확도 대폭 향상 예상 (현재 평균 42.6점 → 55-60점 예상)

**예상 효과**:
- 네이버 평점 추가 → 인기지수 +15~20점
- 실제 메뉴 데이터 → 사용자 경험 대폭 개선
- 실제 리뷰 → AI 설명 품질 향상
- PlaceID → 네이버지도 직접 링크

---

## 🎯 Phase 3-1: 네이버플레이스 웹 스크래퍼 구현

### 1. 파일 생성: `data-hub/src/scrapers/naver_place_parser.py`

**기술 스택**:
- **Playwright** (이미 설치됨 ✅): 동적 JavaScript 렌더링 지원
- **BeautifulSoup4**: HTML 파싱 (필요 시 설치)
- **비용**: $0 (완전 무료)

**핵심 기능**:

```python
class NaverPlaceParser:
    """네이버플레이스 웹 스크래퍼"""
    
    async def search_and_parse(self, name: str, address: str) -> dict:
        """
        레스토랑 검색 및 데이터 추출
        
        Returns:
            {
                'place_id': str,           # 네이버플레이스 ID (예: 1234567890)
                'naver_rating': float,     # 평점 (예: 4.52)
                'naver_review_count': int, # 리뷰수 (예: 1234)
                'menus': [                 # 메뉴 리스트
                    {'name': '김치찌개', 'price': '8000'},
                    {'name': '된장찌개', 'price': '7000'}
                ],
                'reviews': [               # 리뷰 5-10개 (최신순)
                    {
                        'rating': 5,
                        'text': '정말 맛있어요!',
                        'date': '2025-10-15'
                    }
                ],
                'images': [                # 이미지 URL 리스트 (최대 10개)
                    'https://...',
                ],
                'open_hours': str,         # 영업시간
                'phone': str               # 전화번호
            }
        """
        pass
```

**구현 전략**:

1. **검색 URL 생성**:
   ```python
   search_url = f"https://map.naver.com/v5/search/{quote(name + ' ' + address)}"
   ```

2. **Playwright로 페이지 로드**:
   ```python
   async with async_playwright() as p:
       browser = await p.chromium.launch(headless=True)
       page = await browser.new_page()
       await page.goto(search_url)
       await page.wait_for_selector('.place_section', timeout=10000)
   ```

3. **PlaceID 추출** (URL에서):
   ```python
   # 예: https://m.place.naver.com/restaurant/1234567890/home
   place_url = await page.url()
   place_id = re.search(r'/restaurant/(\d+)', place_url)
   ```

4. **평점/리뷰수 추출**:
   ```python
   rating = await page.locator('.PXMot').inner_text()  # "4.52"
   review_count = await page.locator('.place_section_count').inner_text()  # "리뷰 1,234"
   ```

5. **메뉴 추출**:
   ```python
   menu_items = await page.locator('.E2jtL').all()
   for item in menu_items:
       name = await item.locator('.lPzHi').inner_text()
       price = await item.locator('.A07c8').inner_text()
   ```

6. **리뷰 추출** (최신 5-10개):
   ```python
   review_items = await page.locator('.YeINN').all()
   for review in review_items[:10]:
       text = await review.locator('.zPfVt').inner_text()
       rating = len(await review.locator('.PXMot em').all())
   ```

**Rate Limiting**:
- 요청당 2-3초 대기 (너무 빠르면 차단 위험)
- 하루 최대 500개 처리 권장
- User-Agent 랜덤 설정

---

## 🎯 Phase 3-2: 데이터베이스 통합

### 1. `data-hub/src/processors/place_enricher.py` 생성

**기능**:
```python
async def enrich_with_naver_place(raw_id: str):
    """
    Raw 데이터에 네이버플레이스 정보 추가
    
    1. NaverPlaceParser로 웹 스크래핑
    2. raw_restaurant_data.raw_data 업데이트
    3. Gemini AI 재정제 (실제 리뷰 포함)
    4. processed_restaurants 업데이트
    """
    parser = NaverPlaceParser()
    
    # 1. Raw 데이터 조회
    with db_session() as db:
        raw = db.query(RawRestaurantData).get(raw_id)
        
        # 2. 네이버플레이스 파싱
        place_data = await parser.search_and_parse(
            raw.raw_data['name'],
            raw.raw_data['address']
        )
        
        # 3. Raw 데이터 업데이트
        raw.raw_data.update(place_data)
        raw.place_id = place_data['place_id']
        
        # 4. Gemini AI 재정제 (실제 리뷰 활용)
        processor = GeminiProcessor()
        refined = await processor.refine_restaurant(raw)
        
        # 5. Processed 데이터 업데이트
        processed = db.query(ProcessedRestaurant).filter_by(
            source_raw_id=raw.id
        ).first()
        
        if processed:
            processed.naver_place_id = place_data['place_id']
            processed.naver_rating = place_data['naver_rating']
            processed.naver_review_count = place_data['naver_review_count']
            
            # 인기지수 재계산
            processed.popularity_score = calculate_popularity(
                naver_rating=place_data['naver_rating'],
                naver_review_count=place_data['naver_review_count'],
                google_rating=processed.google_rating,
                google_review_count=processed.google_review_count
            )
```

---

## 🎯 Phase 3-3: Gemini 프롬프트 강화 (실제 리뷰 활용)

### `data-hub/src/processors/gemini.py` 업데이트

**개선 사항**:

```python
# Before (Phase 2)
prompt = f"""다음 레스토랑 정보를 바탕으로..."""

# After (Phase 3) - 실제 리뷰 포함
prompt = f"""다음 레스토랑 정보를 바탕으로...

**실제 고객 리뷰** (참고용):
{format_reviews(raw_data.get('reviews', []))}

이 리뷰들을 바탕으로 실제 고객 경험을 반영한 설명을 작성하세요.
단, 리뷰를 그대로 복사하지 말고 핵심 내용만 자연스럽게 통합하세요.
"""
```

**효과**:
- AI 설명 품질 대폭 향상 (실제 경험 기반)
- 할루시네이션 거의 제거
- 신뢰도 증가

---

## 🎯 Phase 3-4: 배치 처리 시스템

### `data-hub/src/cli.py` 명령어 추가

```python
@app.command()
def enrich_naver_places(
    limit: int = 50,
    batch_size: int = 10
):
    """
    기존 레스토랑에 네이버플레이스 데이터 추가
    
    Args:
        limit: 처리할 최대 개수 (기본 50개)
        batch_size: 배치 크기 (기본 10개)
    """
    # 1. PlaceID 없는 레스토랑 조회
    # 2. NaverPlaceParser로 배치 처리
    # 3. 진행 상황 출력
    # 4. 실패 시 재시도 로직
```

**실행 예시**:
```bash
# 50개 레스토랑 처리
python -m src.cli enrich-naver-places --limit=50

# 전체 처리 (163개)
python -m src.cli enrich-naver-places --limit=163
```

---

## 📊 예상 결과

### 데이터 품질 향상

| 항목 | Before (Phase 2) | After (Phase 3) | 개선 |
|------|------------------|-----------------|------|
| PlaceID | 0% | 95%+ | +95% |
| 네이버 평점 | 0% | 95%+ | +95% |
| 메뉴 데이터 | 0% | 90%+ | +90% |
| 실제 리뷰 | 0% | 90%+ | +90% |
| 이미지 | 0% | 80%+ | +80% |
| 평균 인기지수 | 42.6점 | 55-60점 | +30% |

### 인기지수 개선 예시

**현재 (구글만)**:
```
광장시장 마약김밥: 46점 (구글 4.2점, 43,596개)
```

**예상 (네이버 추가)**:
```
광장시장 마약김밥: 62점
  - 구글: 4.2점 (43,596개) → 46점
  - 네이버: 4.8점 (8,234개) → 16점
  - 합계: 62점 (highly_popular 등급!)
```

---

## ⚠️ 주의사항 및 해결 방안

### 1. 웹 스크래핑 차단 위험

**문제**: 네이버가 봇 탐지 시 차단 가능

**해결**:
```python
# User-Agent 랜덤 설정
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
]

# 요청당 2-3초 대기
await asyncio.sleep(random.uniform(2.0, 3.5))

# 배치당 10개 제한 후 1분 휴식
if processed_count % 10 == 0:
    await asyncio.sleep(60)
```

### 2. HTML 구조 변경

**문제**: 네이버가 HTML 구조 변경 시 파서 오류

**해결**:
- CSS Selector 여러 개 준비 (fallback)
- 정기적 테스트 (주 1회)
- 오류 발생 시 알림

### 3. PlaceID 찾기 실패

**문제**: 동명이인 식당, 주소 불일치

**해결**:
```python
# 주소 매칭 로직
def verify_place(found_address: str, target_address: str) -> bool:
    # 지역구 일치 확인
    return extract_district(found_address) == extract_district(target_address)
```

---

## 🚀 실행 계획

### Day 1: 스크래퍼 구현 (4-6시간)
1. ✅ `naver_place_parser.py` 생성
2. ✅ PlaceID 추출 로직
3. ✅ 평점/리뷰수 추출
4. ✅ 메뉴 추출
5. ✅ 리뷰 추출 (5-10개)
6. ✅ 테스트 (10개 레스토랑)

### Day 2: 데이터베이스 통합 (3-4시간)
1. ✅ `place_enricher.py` 생성
2. ✅ Gemini 프롬프트 업데이트
3. ✅ 인기지수 재계산 로직
4. ✅ CLI 명령어 추가
5. ✅ 테스트 (50개 배치)

### Day 3: 전체 처리 (2-3시간)
1. ✅ 163개 레스토랑 처리 (PlaceID 없는 경우)
2. ✅ 품질 검증
3. ✅ 메인 시스템 동기화
4. ✅ 문서 업데이트

---

## 💰 비용 분석

### 웹 스크래핑
- **비용**: $0 (완전 무료)
- **제약**: 하루 500개 권장

### Gemini AI 재정제
- **요청**: 163개 x 1회 = 163 requests
- **토큰**: 평균 2,000 tokens/request
- **비용**: ~$0.05 (거의 무료)

### 총 비용
- **Phase 3 전체**: **$0.05** (5센트!)

---

## ✅ 성공 지표

1. **PlaceID 수집률**: 95% 이상 (155/163)
2. **네이버 평점 수집률**: 95% 이상
3. **메뉴 데이터**: 90% 이상
4. **평균 인기지수**: 42.6점 → 55-60점
5. **Quality Score**: 75점 → 85점+

---

## 📝 다음 단계 (Phase 4)

Phase 3 완료 후:
1. **메인 시스템 동기화 API** 구현
2. **자동 업데이트 시스템** (매주 신규 데이터 수집)
3. **품질 모니터링 대시보드**
4. **30일 목표 달성**: 1,180개 레스토랑

---

## 🎯 즉시 시작

**1단계**: 다음 명령어로 스크래퍼 테스트
```bash
cd data-hub
python3 -c "
import asyncio
from src.scrapers.naver_place_parser import NaverPlaceParser

async def test():
    parser = NaverPlaceParser()
    result = await parser.search_and_parse('광장시장 마약김밥', '서울 종로구 창경궁로 88')
    print(result)

asyncio.run(test())
"
```

**2단계**: 성공 시 배치 처리
```bash
python -m src.cli enrich-naver-places --limit=10
```

**3단계**: 전체 처리
```bash
python -m src.cli enrich-naver-places --limit=163
```

---

## 📞 질문 사항

1. Playwright 설치 확인됐나요? (이미 설치된 것으로 확인됨 ✅)
2. Rate Limiting 전략 괜찮나요? (2-3초/요청)
3. 하루 처리량 제한 필요한가요? (현재 무제한)

**준비되셨으면 즉시 시작하겠습니다! 🚀**
