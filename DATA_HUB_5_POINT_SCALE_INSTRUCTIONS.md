# 🎯 Data Hub: 인기지수 5점 척도 시스템 적용 지시

## 📋 개요

**목적**: Data Hub의 인기지수 계산을 메인 시스템과 동일하게 **0-5점 척도**로 변경

**이유**:
- 메인 시스템이 0-100점 → 0-5점으로 변경됨 (2025-10-30)
- Data Hub도 동일한 척도를 사용해야 동기화 시 일관성 유지
- 5점 척도는 직관적이고 이해하기 쉬움 (별점과 동일)

**변경 사항**:
- 기존: 0-100점 (평균 42.6점)
- 신규: 0-5점 (평균 2.1점)

---

## ✅ Step 1: 인기지수 계산 로직 생성

### `data-hub/src/utils/popularity_calculator.py` 생성

```python
"""
인기지수 계산 유틸리티 (5점 척도)

메인 시스템(hansikdang)과 동일한 공식 사용
변경 이력:
- 2025-10-30: 0-100점 → 0-5점 척도로 변경
"""

from typing import Optional, Dict


def calculate_popularity_score(
    naver_rating: Optional[float] = None,
    naver_review_count: Optional[int] = None,
    google_rating: Optional[float] = None,
    google_review_count: Optional[int] = None
) -> float:
    """
    인기지수 계산 (0-5점 척도)
    
    공식:
    1. 평점 점수 (2.5점 만점)
       - 네이버 평점: (naver_rating / 5.0) × 1.25점
       - 구글 평점: (google_rating / 5.0) × 1.25점
    
    2. 리뷰수 점수 (2.5점 만점)
       - 네이버 리뷰수: min(naver_review_count / 100, 1.0) × 1.25점
       - 구글 리뷰수: min(google_review_count / 100, 1.0) × 1.25점
    
    3. 최종 점수 = 평점 점수 + 리뷰수 점수 (0-5)
    
    예시:
    - 네이버 5.0점, 3,815개 → 1.25 + 1.25 = 2.5점
    - 구글 4.5점, 500개 → 1.125 + 1.25 = 2.375점
    - 합계: 2.5 + 2.375 = 4.875점 (두 소스 평균 = 2.44점)
    
    Args:
        naver_rating: 네이버 평점 (0-5)
        naver_review_count: 네이버 리뷰 개수
        google_rating: 구글 평점 (0-5)
        google_review_count: 구글 리뷰 개수
    
    Returns:
        인기지수 (0-5점, 소수점 2자리)
    """
    rating_score = 0.0
    review_score = 0.0
    
    # 네이버 평점 계산 (최대 2.5점)
    if naver_rating and naver_rating > 0:
        rating_score += (naver_rating / 5.0) * 1.25
    
    if naver_review_count and naver_review_count > 0:
        review_score += min(naver_review_count / 100, 1.0) * 1.25
    
    # 구글 평점 계산 (최대 2.5점)
    if google_rating and google_rating > 0:
        rating_score += (google_rating / 5.0) * 1.25
    
    if google_review_count and google_review_count > 0:
        review_score += min(google_review_count / 100, 1.0) * 1.25
    
    # 최종 점수 (소수점 2자리까지)
    total_score = rating_score + review_score
    return round(total_score, 2)


def get_popularity_tier(score: float) -> str:
    """
    인기지수 등급 분류 (5점 척도)
    
    Args:
        score: 인기지수 (0-5)
    
    Returns:
        등급 (legendary, highly_popular, popular, moderate, average, low)
    """
    if score >= 4.5:
        return 'legendary'
    elif score >= 4.0:
        return 'highly_popular'
    elif score >= 3.5:
        return 'popular'
    elif score >= 3.0:
        return 'moderate'
    elif score >= 2.0:
        return 'average'
    else:
        return 'low'


def get_tier_label(tier: str, language: str = 'ko') -> str:
    """
    등급 라벨 가져오기
    
    Args:
        tier: 등급 (legendary, highly_popular, etc.)
        language: 언어 ('ko' 또는 'en')
    
    Returns:
        등급 라벨
    """
    labels = {
        'legendary': {'ko': '전설의 맛집', 'en': 'Legendary'},
        'highly_popular': {'ko': '대박 맛집', 'en': 'Highly Popular'},
        'popular': {'ko': '인기 맛집', 'en': 'Popular'},
        'moderate': {'ko': '괜찮은 곳', 'en': 'Good'},
        'average': {'ko': '평범한 곳', 'en': 'Average'},
        'low': {'ko': '신규/데이터 부족', 'en': 'New/Limited Data'},
    }
    
    return labels.get(tier, {}).get(language, '')


def get_tier_color(tier: str) -> str:
    """
    등급 색상 가져오기
    
    Args:
        tier: 등급
    
    Returns:
        HEX 색상 코드
    """
    colors = {
        'legendary': '#FFD700',      # 금색
        'highly_popular': '#FF6B6B', # 빨강
        'popular': '#FF9F43',        # 주황
        'moderate': '#48C774',       # 녹색
        'average': '#3B82F6',        # 파랑
        'low': '#94A3B8',            # 회색
    }
    
    return colors.get(tier, '#94A3B8')


def get_star_display(score: float) -> str:
    """
    별점 표시 생성 (★☆)
    
    Args:
        score: 인기지수 (0-5)
    
    Returns:
        별점 문자열 (예: "★★★☆☆")
    """
    full_stars = int(score)
    half_star = 1 if (score % 1) >= 0.5 else 0
    empty_stars = 5 - full_stars - half_star
    
    return '★' * full_stars + '☆' * half_star + '☆' * empty_stars


def get_popularity_info(
    naver_rating: Optional[float] = None,
    naver_review_count: Optional[int] = None,
    google_rating: Optional[float] = None,
    google_review_count: Optional[int] = None
) -> Dict[str, any]:
    """
    종합 인기지수 정보 가져오기
    
    Returns:
        {
            'score': 2.45,
            'tier': 'average',
            'label_ko': '평범한 곳',
            'label_en': 'Average',
            'color': '#3B82F6',
            'stars': '★★☆☆☆'
        }
    """
    score = calculate_popularity_score(
        naver_rating, naver_review_count,
        google_rating, google_review_count
    )
    
    tier = get_popularity_tier(score)
    
    return {
        'score': score,
        'tier': tier,
        'label_ko': get_tier_label(tier, 'ko'),
        'label_en': get_tier_label(tier, 'en'),
        'color': get_tier_color(tier),
        'stars': get_star_display(score),
    }


# 사용 예시
if __name__ == '__main__':
    # 예시 1: 구글만 있는 경우
    info = get_popularity_info(
        google_rating=4.5,
        google_review_count=500
    )
    print(f"점수: {info['score']} {info['stars']}")
    print(f"등급: {info['label_ko']} ({info['tier']})")
    print(f"색상: {info['color']}")
    
    # 예시 2: 네이버 + 구글
    info = get_popularity_info(
        naver_rating=4.8,
        naver_review_count=1234,
        google_rating=4.2,
        google_review_count=5678
    )
    print(f"\n점수: {info['score']} {info['stars']}")
    print(f"등급: {info['label_ko']} ({info['tier']})")
```

---

## ✅ Step 2: 기존 데이터 재계산

### `data-hub/src/scripts/recalculate_popularity.py` 생성

```python
"""
기존 레스토랑 데이터의 인기지수를 5점 척도로 재계산
"""

import sys
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from src.database import get_db
from src.models import ProcessedRestaurant
from src.utils.popularity_calculator import calculate_popularity_score
from loguru import logger


def recalculate_all_scores():
    """모든 레스토랑의 인기지수를 5점 척도로 재계산"""
    
    logger.info("🔄 인기지수 재계산 시작 (5점 척도)...")
    
    with get_db() as db:
        restaurants = db.query(ProcessedRestaurant).all()
        
        updated = 0
        skipped = 0
        changes = []
        
        for restaurant in restaurants:
            try:
                old_score = restaurant.popularity_score or 0.0
                
                new_score = calculate_popularity_score(
                    naver_rating=restaurant.naver_rating,
                    naver_review_count=restaurant.naver_review_count,
                    google_rating=restaurant.google_rating,
                    google_review_count=restaurant.google_review_count
                )
                
                restaurant.popularity_score = new_score
                
                changes.append({
                    'name': restaurant.name,
                    'old': old_score,
                    'new': new_score
                })
                
                arrow = '↓' if new_score < old_score else '↑' if new_score > old_score else '→'
                logger.info(f"{arrow} {restaurant.name}: {old_score:.2f} → {new_score:.2f}")
                
                updated += 1
                
            except Exception as e:
                logger.error(f"❌ {restaurant.name} 업데이트 실패: {e}")
                skipped += 1
        
        # 커밋
        db.commit()
        
        logger.info("\n" + "=" * 60)
        logger.info("📊 재계산 완료\n")
        logger.info(f"  총 레스토랑: {len(restaurants)}개")
        logger.info(f"  ✅ 성공: {updated}개")
        logger.info(f"  ❌ 실패: {skipped}개")
        
        # 통계 계산
        scores = [r.popularity_score for r in restaurants if r.popularity_score and r.popularity_score > 0]
        
        if scores:
            avg_score = sum(scores) / len(scores)
            max_score = max(scores)
            min_score = min(scores)
            
            logger.info(f"\n📈 새로운 통계 (5점 척도):")
            logger.info(f"  평균: {avg_score:.2f}점")
            logger.info(f"  최고: {max_score:.2f}점")
            logger.info(f"  최저: {min_score:.2f}점")
            
            # 등급별 분포
            distribution = {
                'legendary': len([s for s in scores if s >= 4.5]),
                'highly_popular': len([s for s in scores if 4.0 <= s < 4.5]),
                'popular': len([s for s in scores if 3.5 <= s < 4.0]),
                'moderate': len([s for s in scores if 3.0 <= s < 3.5]),
                'average': len([s for s in scores if 2.0 <= s < 3.0]),
                'low': len([s for s in scores if s < 2.0]),
            }
            
            logger.info(f"\n🏆 등급별 분포:")
            logger.info(f"  전설의 맛집 (4.5+): {distribution['legendary']}개")
            logger.info(f"  대박 맛집 (4.0-4.4): {distribution['highly_popular']}개")
            logger.info(f"  인기 맛집 (3.5-3.9): {distribution['popular']}개")
            logger.info(f"  괜찮은 곳 (3.0-3.4): {distribution['moderate']}개")
            logger.info(f"  평범한 곳 (2.0-2.9): {distribution['average']}개")
            logger.info(f"  신규/데이터 부족 (<2.0): {distribution['low']}개")
        
        # Top 10
        top_10 = sorted(
            [r for r in restaurants if r.popularity_score and r.popularity_score > 0],
            key=lambda x: x.popularity_score or 0,
            reverse=True
        )[:10]
        
        if top_10:
            logger.info(f"\n🌟 Top 10 인기 맛집:")
            for idx, r in enumerate(top_10, 1):
                score = r.popularity_score or 0
                stars = '★' * int(score) + '☆' * (1 if score % 1 >= 0.5 else 0)
                logger.info(f"  {idx}. {r.name}: {score:.2f} {stars}")
    
    logger.success("\n✅ 재계산 완료!")


if __name__ == '__main__':
    recalculate_all_scores()
```

### 실행 방법
```bash
cd data-hub
python src/scripts/recalculate_popularity.py
```

---

## ✅ Step 3: Gemini 프로세서 업데이트

### `data-hub/src/processors/gemini.py` 수정

기존 코드에서 인기지수 계산 부분을 찾아 새로운 함수 사용:

```python
from src.utils.popularity_calculator import calculate_popularity_score

# Before (기존 코드)
# popularity_score = calculate_old_score(...)

# After (새로운 코드)
popularity_score = calculate_popularity_score(
    naver_rating=naver_rating,
    naver_review_count=naver_review_count,
    google_rating=google_rating,
    google_review_count=google_review_count
)
```

---

## ✅ Step 4: 동기화 클라이언트 업데이트

### `data-hub/src/clients/main_system_sync.py` 확인

이미 `popularity_score` 필드를 동기화하고 있으므로 추가 변경 불필요.
5점 척도로 계산된 점수가 자동으로 메인 시스템에 전송됨.

```python
# 이미 구현되어 있음 - 변경 불필요
def format_restaurant_for_sync(self, processed: Any) -> Dict[str, Any]:
    return {
        # ... 다른 필드들 ...
        "popularity_score": processed.popularity_score,  # 5점 척도 자동 전송
    }
```

---

## 📊 예상 결과

### 변환 예시

| 레스토랑 | 네이버 평점 | 네이버 리뷰 | 구글 평점 | 구글 리뷰 | 기존 (0-100) | 신규 (0-5) |
|---------|-------------|------------|----------|----------|-------------|-----------|
| 광장시장 마약김밥 | - | - | 4.2 | 43,596 | 46.0 | **2.30** ★★ |
| 깃뜰 | - | - | 5.0 | 3,815 | 50.0 | **2.50** ★★☆ |
| 테스트 식당 | 4.8 | 1,234 | 4.5 | 500 | 94.0 | **4.72** ★★★★☆ |

---

## 🚀 실행 순서

### 1. 유틸리티 생성
```bash
# 파일 생성
touch data-hub/src/utils/popularity_calculator.py

# 위 코드 복사/붙여넣기
```

### 2. 재계산 스크립트 실행
```bash
cd data-hub
python src/scripts/recalculate_popularity.py
```

**예상 출력**:
```
🔄 인기지수 재계산 시작 (5점 척도)...
↓ 레스토랑 A: 42.00 → 2.10
↓ 레스토랑 B: 50.00 → 2.50
...

📊 재계산 완료
  총 레스토랑: 163개
  ✅ 성공: 163개
  ❌ 실패: 0개

📈 새로운 통계 (5점 척도):
  평균: 2.13점
  최고: 2.50점
  최저: 0.65점
```

### 3. Gemini 프로세서 업데이트
```bash
# src/processors/gemini.py 수정
# calculate_popularity_score 함수 import 및 사용
```

### 4. 메인 시스템 동기화
```bash
python -m src.cli sync-to-main --limit=163
```

---

## ✅ 검증

### 테스트 케이스

```python
# test_popularity_calculator.py
from src.utils.popularity_calculator import calculate_popularity_score

# 테스트 1: 구글만
score = calculate_popularity_score(
    google_rating=4.5,
    google_review_count=500
)
assert score == 2.38  # (4.5/5 * 1.25) + (min(500/100, 1) * 1.25)

# 테스트 2: 네이버 + 구글
score = calculate_popularity_score(
    naver_rating=4.8,
    naver_review_count=1234,
    google_rating=4.2,
    google_review_count=5678
)
# 네이버: (4.8/5 * 1.25) + (1.0 * 1.25) = 1.2 + 1.25 = 2.45
# 구글: (4.2/5 * 1.25) + (1.0 * 1.25) = 1.05 + 1.25 = 2.30
# 합계: 2.45 + 2.30 = 4.75
assert score == 4.75

print("✅ All tests passed!")
```

---

## 📝 주의사항

1. **기존 데이터 백업**: 재계산 전 DB 백업 권장
2. **메인 시스템 일관성**: 메인 시스템이 먼저 5점 척도로 변경된 후 작업
3. **동기화 순서**: 재계산 완료 → 동기화 실행
4. **Phase 3 웹파싱**: 새로 수집하는 데이터부터 5점 척도 적용

---

## ✅ 완료 체크리스트

- [ ] `src/utils/popularity_calculator.py` 생성
- [ ] `src/scripts/recalculate_popularity.py` 생성
- [ ] 재계산 스크립트 실행 (기존 데이터)
- [ ] 결과 확인 (평균 2.1점, 최고 2.5점)
- [ ] `src/processors/gemini.py` 업데이트
- [ ] Phase 3 웹파싱 시 5점 척도 적용 확인
- [ ] 메인 시스템 동기화 테스트
- [ ] 동기화 결과 검증

---

## 🎯 다음 단계

5점 척도 적용 완료 후:

1. **Phase 3 웹파싱 계속**: 네이버 PlaceID/평점 수집
2. **자동 동기화**: 새 데이터는 5점 척도로 자동 계산
3. **품질 모니터링**: 평균 인기지수 2.1점 → 4.0점+ 목표

---

**준비 완료! 5점 척도 시스템을 적용하세요!** 🚀

**메인 시스템과 Data Hub 모두 동일한 척도를 사용하여 완벽한 일관성을 유지합니다.**
