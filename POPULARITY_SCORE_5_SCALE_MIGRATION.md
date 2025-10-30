# 🎯 인기지수 5점 척도 마이그레이션 가이드

## 📋 개요

**목적**: 인기지수를 0-100점 → **0-5점 척도**로 변경하여 직관적인 이해 향상

**이유**:
- 현재 0-100점은 수치가 너무 커서 감이 안 잡힘
- 5점 척도는 평점과 같은 스케일로 이해하기 쉬움
- 일반적인 별점 시스템과 동일한 직관성

**예상 효과**:
- 42.6점 → **2.1점** (평균)
- 50점 → **2.5점** (최고점)
- 사용자가 "4.5점 인기도" 같은 식으로 쉽게 이해 가능

---

## 🔢 새로운 공식

### 기존 (0-100점)
```
평점 가중치 = (rating / 5.0) × 50
리뷰수 가중치 = min(review_count / 100, 1.0) × 50
인기지수 = 평점 가중치 + 리뷰수 가중치  // 0-100점
```

### 신규 (0-5점)
```
평점 가중치 = (rating / 5.0) × 2.5
리뷰수 가중치 = min(review_count / 100, 1.0) × 2.5
인기지수 = 평점 가중치 + 리뷰수 가중치  // 0-5점
```

### 변환 예시

| 구글 평점 | 리뷰수 | 기존 점수 (0-100) | 신규 점수 (0-5) |
|-----------|--------|-------------------|-----------------|
| 5.0 | 3,815 | 50.0 | **2.5** |
| 4.9 | 1,756 | 49.5 | **2.48** |
| 4.5 | 500 | 47.5 | **2.38** |
| 4.2 | 43,596 | 46.0 | **2.3** |
| 4.0 | 50 | 41.25 | **2.06** |
| 3.5 | 10 | 35.25 | **1.76** |

---

## ✅ Step 1: 인기지수 계산 로직 수정

### `server/utils/popularityCalculator.ts`

```typescript
/**
 * 인기지수 계산 (0-5점 척도)
 * 
 * 공식:
 * - 평점 가중치 (0-2.5): (rating / 5.0) × 2.5
 * - 리뷰수 가중치 (0-2.5): min(review_count / 100, 1.0) × 2.5
 * - 총점: 0-5점
 * 
 * 예시:
 * - 5.0점, 3,815개 리뷰 → 2.5 + 2.5 = 5.0점
 * - 4.5점, 500개 리뷰 → 2.25 + 2.5 = 4.75점
 * - 4.0점, 50개 리뷰 → 2.0 + 1.25 = 3.25점
 */

interface RatingData {
  naverRating?: number | null;
  naverReviewCount?: number | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
}

export function calculatePopularityScore(data: RatingData): number {
  let totalScore = 0;
  let sourceCount = 0;

  // Naver 평점 계산 (0-2.5점)
  if (data.naverRating && data.naverReviewCount) {
    const ratingScore = (data.naverRating / 5.0) * 2.5;
    const reviewScore = Math.min(data.naverReviewCount / 100, 1.0) * 2.5;
    totalScore += ratingScore + reviewScore;
    sourceCount++;
  }

  // Google 평점 계산 (0-2.5점)
  if (data.googleRating && data.googleReviewCount) {
    const ratingScore = (data.googleRating / 5.0) * 2.5;
    const reviewScore = Math.min(data.googleReviewCount / 100, 1.0) * 2.5;
    totalScore += ratingScore + reviewScore;
    sourceCount++;
  }

  // 평균 계산 (소스가 없으면 0점)
  if (sourceCount === 0) return 0;

  // 소수점 2자리까지 반올림
  return Math.round((totalScore / sourceCount) * 100) / 100;
}

/**
 * 인기지수 등급 분류 (5점 척도)
 */
export function getPopularityLevel(score: number): {
  level: string;
  label: string;
  color: string;
} {
  if (score >= 4.5) {
    return { level: 'legendary', label: '전설의 맛집', color: '#FFD700' };
  } else if (score >= 4.0) {
    return { level: 'highly_popular', label: '대박 맛집', color: '#FF6B6B' };
  } else if (score >= 3.5) {
    return { level: 'popular', label: '인기 맛집', color: '#FF9F43' };
  } else if (score >= 3.0) {
    return { level: 'moderate', label: '괜찮은 곳', color: '#48C774' };
  } else if (score >= 2.0) {
    return { level: 'average', label: '평범한 곳', color: '#3B82F6' };
  } else {
    return { level: 'low', label: '신규/데이터 부족', color: '#94A3B8' };
  }
}

/**
 * 기존 100점 척도 → 5점 척도 변환
 */
export function convertOldScoreToNew(oldScore: number): number {
  // 0-100 → 0-5
  return Math.round((oldScore / 100) * 5 * 100) / 100;
}
```

---

## ✅ Step 2: 기존 데이터 재계산 스크립트

### `server/scripts/recalculatePopularityScores.ts`

```typescript
import { storage } from '../storage';
import { calculatePopularityScore } from '../utils/popularityCalculator';

async function recalculateAllScores() {
  console.log('🔄 Starting popularity score recalculation (5-point scale)...\n');

  const restaurants = await storage.getAllRestaurants();
  
  let updated = 0;
  let skipped = 0;

  for (const restaurant of restaurants) {
    try {
      const newScore = calculatePopularityScore({
        naverRating: restaurant.naverRating,
        naverReviewCount: restaurant.naverReviewCount,
        googleRating: restaurant.googleRating,
        googleReviewCount: restaurant.googleReviewCount,
      });

      await storage.updateRestaurantRatings(restaurant.id, {
        popularityScore: newScore,
      });

      console.log(`✅ ${restaurant.name}: ${restaurant.popularityScore?.toFixed(2) || '0.00'} → ${newScore.toFixed(2)}`);
      updated++;
    } catch (error) {
      console.error(`❌ Failed to update ${restaurant.name}:`, error);
      skipped++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  Total: ${restaurants.length}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  
  // 통계 계산
  const updatedRestaurants = await storage.getAllRestaurants();
  const scores = updatedRestaurants
    .map(r => r.popularityScore)
    .filter(s => s !== null && s > 0) as number[];
  
  if (scores.length > 0) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    
    console.log(`\n📈 New Statistics (5-point scale):`);
    console.log(`  Average: ${avg.toFixed(2)}`);
    console.log(`  Max: ${max.toFixed(2)}`);
    console.log(`  Min: ${min.toFixed(2)}`);
  }

  console.log('\n✅ Recalculation complete!');
}

recalculateAllScores()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
```

### 실행 명령어
```bash
npx tsx server/scripts/recalculatePopularityScores.ts
```

---

## ✅ Step 3: Data Hub 동기화 지시

### Data Hub에서도 동일하게 5점 척도 적용

#### `data-hub/src/utils/popularity_calculator.py`

```python
def calculate_popularity_score(
    naver_rating: float = None,
    naver_review_count: int = None,
    google_rating: float = None,
    google_review_count: int = None
) -> float:
    """
    인기지수 계산 (0-5점 척도)
    
    공식:
    - 평점 가중치 (0-2.5): (rating / 5.0) × 2.5
    - 리뷰수 가중치 (0-2.5): min(review_count / 100, 1.0) × 2.5
    - 총점: 0-5점
    
    Args:
        naver_rating: 네이버 평점 (0-5)
        naver_review_count: 네이버 리뷰 개수
        google_rating: 구글 평점 (0-5)
        google_review_count: 구글 리뷰 개수
    
    Returns:
        인기지수 (0-5점)
    """
    total_score = 0.0
    source_count = 0
    
    # Naver 점수 계산
    if naver_rating and naver_review_count:
        rating_score = (naver_rating / 5.0) * 2.5
        review_score = min(naver_review_count / 100, 1.0) * 2.5
        total_score += rating_score + review_score
        source_count += 1
    
    # Google 점수 계산
    if google_rating and google_review_count:
        rating_score = (google_rating / 5.0) * 2.5
        review_score = min(google_review_count / 100, 1.0) * 2.5
        total_score += rating_score + review_score
        source_count += 1
    
    # 평균 계산
    if source_count == 0:
        return 0.0
    
    # 소수점 2자리까지
    return round(total_score / source_count, 2)


def get_popularity_level(score: float) -> dict:
    """
    인기지수 등급 분류 (5점 척도)
    
    Returns:
        {'level': str, 'label_ko': str, 'label_en': str, 'color': str}
    """
    if score >= 4.5:
        return {
            'level': 'legendary',
            'label_ko': '전설의 맛집',
            'label_en': 'Legendary',
            'color': '#FFD700'
        }
    elif score >= 4.0:
        return {
            'level': 'highly_popular',
            'label_ko': '대박 맛집',
            'label_en': 'Highly Popular',
            'color': '#FF6B6B'
        }
    elif score >= 3.5:
        return {
            'level': 'popular',
            'label_ko': '인기 맛집',
            'label_en': 'Popular',
            'color': '#FF9F43'
        }
    elif score >= 3.0:
        return {
            'level': 'moderate',
            'label_ko': '괜찮은 곳',
            'label_en': 'Good',
            'color': '#48C774'
        }
    elif score >= 2.0:
        return {
            'level': 'average',
            'label_ko': '평범한 곳',
            'label_en': 'Average',
            'color': '#3B82F6'
        }
    else:
        return {
            'level': 'low',
            'label_ko': '신규/데이터 부족',
            'label_en': 'New/Limited Data',
            'color': '#94A3B8'
        }
```

---

## ✅ Step 4: UI 표시 업데이트 (선택)

### 프론트엔드에서 표시할 때

```typescript
// Before: "인기지수: 42.6점 / 100"
// After:  "인기지수: 2.1 ★ (평균)"

function formatPopularityScore(score: number): string {
  const stars = '★'.repeat(Math.floor(score));
  const halfStar = score % 1 >= 0.5 ? '☆' : '';
  return `${score.toFixed(1)} ${stars}${halfStar}`;
}

// 예시:
// 2.1 → "2.1 ★★"
// 4.5 → "4.5 ★★★★☆"
// 5.0 → "5.0 ★★★★★"
```

---

## 📊 마이그레이션 예상 결과

### 현재 데이터 기준

| 항목 | 기존 (0-100) | 신규 (0-5) |
|------|-------------|-----------|
| 평균 인기지수 | 42.6점 | **2.13점** |
| 최고 인기지수 | 50.0점 | **2.5점** |
| 최저 인기지수 | 12.3점 | **0.62점** |

### Top 10 레스토랑 변화

| 레스토랑 | 구글 평점 | 리뷰수 | 기존 점수 | 신규 점수 |
|---------|-----------|--------|----------|----------|
| 깃뜰 | 5.0 | 3,815 | 50.0 | **2.5** ★★☆ |
| 태초갈비 | 5.0 | 2,636 | 50.0 | **2.5** ★★☆ |
| 무한리필몽블리 | 5.0 | 924 | 50.0 | **2.5** ★★☆ |
| 돼지래스토랑 둘째 | 4.9 | 1,756 | 49.5 | **2.48** ★★ |
| 광장시장 마약김밥 | 4.2 | 43,596 | 46.0 | **2.3** ★★ |

---

## 🚀 실행 순서

### 1. 로컬 테스트
```bash
# 1. popularityCalculator.ts 수정
# 2. 재계산 스크립트 실행
npx tsx server/scripts/recalculatePopularityScores.ts

# 3. 결과 확인
# 평균: 42.6 → 2.13
# 최고: 50.0 → 2.5
```

### 2. Data Hub 업데이트
```bash
# data-hub/src/utils/popularity_calculator.py 생성
# 5점 척도 공식 적용
```

### 3. 동기화
```bash
# Data Hub → 메인 시스템 동기화
python -m src.cli sync-to-main --limit=200
```

---

## ✅ 장점

### 직관성
- **5점 = 최고** (별 5개 ★★★★★)
- **4점 = 우수** (별 4개 ★★★★)
- **3점 = 보통** (별 3개 ★★★)
- **2점 = 평범** (별 2개 ★★)

### 비교 용이성
- 평점(4.5점)과 인기지수(4.2점)를 같은 스케일로 비교 가능
- "평점 4.5, 인기지수 4.2" → 한눈에 이해

### UX 개선
- 진행 바(Progress Bar) 표시 시 0-100%보다 0-5 별점이 더 직관적
- 모바일에서 별 아이콘으로 표시하기 적합

---

## 📝 주의사항

1. **기존 데이터 백업**: 마이그레이션 전 DB 백업 권장
2. **프론트엔드 동기화**: UI에서도 0-100 → 0-5 표시 변경 필요
3. **API 문서 업데이트**: Swagger/문서에 새로운 척도 반영
4. **Data Hub 일관성**: 메인 시스템과 동일한 공식 사용

---

## ✅ 완료 체크리스트

- [ ] `server/utils/popularityCalculator.ts` 수정 (0-5 척도)
- [ ] `server/scripts/recalculatePopularityScores.ts` 생성
- [ ] 재계산 스크립트 실행 (190개 레스토랑)
- [ ] 결과 확인 (평균 2.1점, 최고 2.5점)
- [ ] Data Hub `popularity_calculator.py` 생성
- [ ] Phase 3 웹파싱 시 5점 척도 적용
- [ ] 동기화 API 테스트
- [ ] UI 표시 변경 (선택)

---

**준비 완료! 5점 척도로 변경하시겠습니까?** 🚀
