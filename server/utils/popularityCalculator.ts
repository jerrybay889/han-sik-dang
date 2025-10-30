/**
 * 인기지수 계산 유틸리티
 * 네이버/구글 평점과 리뷰수를 기반으로 종합 인기지수(0-5) 계산
 * 
 * 변경 이력:
 * - 2025-10-30: 0-100점 → 0-5점 척도로 변경 (직관성 개선)
 */

export interface PopularityData {
  naverRating?: number | null;
  naverReviewCount?: number | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
}

export interface PopularityResult {
  score: number;
  tier: 'legendary' | 'highly_popular' | 'popular' | 'moderate' | 'average' | 'low';
  tierLabel: {
    ko: string;
    en: string;
  };
  color: string;
}

/**
 * 인기지수 계산 (0-5점 척도)
 * 
 * 공식:
 * 1. 평점 점수 (2.5점 만점)
 *    - 네이버 평점: (naver_rating / 5.0) × 1.25점
 *    - 구글 평점: (google_rating / 5.0) × 1.25점
 * 
 * 2. 리뷰수 점수 (2.5점 만점)
 *    - 네이버 리뷰수: min(naver_review_count / 100, 1.0) × 1.25점
 *    - 구글 리뷰수: min(google_review_count / 100, 1.0) × 1.25점
 * 
 * 3. 최종 점수 = 평점 점수 + 리뷰수 점수 (0-5)
 * 
 * 예시:
 * - 5.0점, 3,815개 리뷰 → 1.25 + 1.25 = 2.5점 (한 소스 기준)
 * - 4.5점, 500개 리뷰 → 1.125 + 1.25 = 2.375점
 * - 4.0점, 50개 리뷰 → 1.0 + 0.625 = 1.625점
 */
export function calculatePopularityScore(data: PopularityData): number {
  const {
    naverRating = 0,
    naverReviewCount = 0,
    googleRating = 0,
    googleReviewCount = 0,
  } = data;

  // 평점 점수 (최대 2.5점)
  let ratingScore = 0;
  if (naverRating && naverRating > 0) {
    ratingScore += (naverRating / 5.0) * 1.25;
  }
  if (googleRating && googleRating > 0) {
    ratingScore += (googleRating / 5.0) * 1.25;
  }

  // 리뷰수 점수 (최대 2.5점)
  // 리뷰 100개를 기준점으로 설정 (100개 이상은 만점)
  let reviewScore = 0;
  if (naverReviewCount && naverReviewCount > 0) {
    reviewScore += Math.min(naverReviewCount / 100, 1.0) * 1.25;
  }
  if (googleReviewCount && googleReviewCount > 0) {
    reviewScore += Math.min(googleReviewCount / 100, 1.0) * 1.25;
  }

  // 최종 점수 (0-5, 소수점 2자리)
  return Math.round((ratingScore + reviewScore) * 100) / 100;
}

/**
 * 인기지수 등급 분류 (5점 척도)
 */
export function getPopularityTier(score: number): PopularityResult['tier'] {
  if (score >= 4.5) return 'legendary';
  if (score >= 4.0) return 'highly_popular';
  if (score >= 3.5) return 'popular';
  if (score >= 3.0) return 'moderate';
  if (score >= 2.0) return 'average';
  return 'low';
}

/**
 * 등급 라벨 가져오기
 */
export function getTierLabel(tier: PopularityResult['tier']): PopularityResult['tierLabel'] {
  const labels = {
    legendary: { ko: '전설의 맛집', en: 'Legendary' },
    highly_popular: { ko: '대박 맛집', en: 'Highly Popular' },
    popular: { ko: '인기 맛집', en: 'Popular' },
    moderate: { ko: '괜찮은 곳', en: 'Good' },
    average: { ko: '평범한 곳', en: 'Average' },
    low: { ko: '신규/데이터 부족', en: 'New/Limited Data' },
  };
  return labels[tier];
}

/**
 * 등급 색상 가져오기
 */
export function getTierColor(tier: PopularityResult['tier']): string {
  const colors = {
    legendary: '#FFD700',      // 금색
    highly_popular: '#FF6B6B', // 빨강
    popular: '#FF9F43',        // 주황
    moderate: '#48C774',       // 녹색
    average: '#3B82F6',        // 파랑
    low: '#94A3B8',            // 회색
  };
  return colors[tier];
}

/**
 * 종합 인기지수 정보 가져오기
 */
export function getPopularityInfo(data: PopularityData): PopularityResult {
  const score = calculatePopularityScore(data);
  const tier = getPopularityTier(score);
  const tierLabel = getTierLabel(tier);
  const color = getTierColor(tier);

  return {
    score,
    tier,
    tierLabel,
    color,
  };
}

/**
 * 별점 표시 생성 (★☆)
 */
export function getStarDisplay(score: number): string {
  const fullStars = Math.floor(score);
  const halfStar = score % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  
  return '★'.repeat(fullStars) + '☆'.repeat(halfStar) + '☆'.repeat(emptyStars);
}
