/**
 * 인기지수 계산 유틸리티
 * 네이버/구글 평점과 리뷰수를 기반으로 종합 인기지수(0-100) 계산
 */

export interface PopularityData {
  naverRating?: number | null;
  naverReviewCount?: number | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
}

export interface PopularityResult {
  score: number;
  tier: 'top_rated' | 'highly_popular' | 'popular' | 'average' | 'new_or_limited';
  tierLabel: {
    ko: string;
    en: string;
  };
}

/**
 * 인기지수 계산
 * 
 * 공식:
 * 1. 평점 점수 (50점 만점)
 *    - 네이버 평점: (naver_rating / 5.0) * 25점
 *    - 구글 평점: (google_rating / 5.0) * 25점
 * 
 * 2. 리뷰수 점수 (50점 만점)
 *    - 네이버 리뷰수: min(naver_review_count / 100, 1.0) * 25점
 *    - 구글 리뷰수: min(google_review_count / 100, 1.0) * 25점
 * 
 * 3. 최종 점수 = 평점 점수 + 리뷰수 점수 (0-100)
 */
export function calculatePopularityScore(data: PopularityData): number {
  const {
    naverRating = 0,
    naverReviewCount = 0,
    googleRating = 0,
    googleReviewCount = 0,
  } = data;

  // 평점 점수 (최대 50점)
  let ratingScore = 0;
  if (naverRating && naverRating > 0) {
    ratingScore += (naverRating / 5.0) * 25;
  }
  if (googleRating && googleRating > 0) {
    ratingScore += (googleRating / 5.0) * 25;
  }

  // 리뷰수 점수 (최대 50점)
  // 리뷰 100개를 기준점으로 설정 (100개 이상은 만점)
  let reviewScore = 0;
  if (naverReviewCount && naverReviewCount > 0) {
    reviewScore += Math.min(naverReviewCount / 100, 1.0) * 25;
  }
  if (googleReviewCount && googleReviewCount > 0) {
    reviewScore += Math.min(googleReviewCount / 100, 1.0) * 25;
  }

  // 최종 점수 (0-100, 소수점 1자리)
  return Math.round((ratingScore + reviewScore) * 10) / 10;
}

/**
 * 인기지수 등급 분류
 */
export function getPopularityTier(score: number): PopularityResult['tier'] {
  if (score >= 90) return 'top_rated';
  if (score >= 70) return 'highly_popular';
  if (score >= 50) return 'popular';
  if (score >= 30) return 'average';
  return 'new_or_limited';
}

/**
 * 등급 라벨 가져오기
 */
export function getTierLabel(tier: PopularityResult['tier']): PopularityResult['tierLabel'] {
  const labels = {
    top_rated: { ko: '최고 인기', en: 'Top Rated' },
    highly_popular: { ko: '높은 인기', en: 'Highly Popular' },
    popular: { ko: '인기', en: 'Popular' },
    average: { ko: '보통', en: 'Average' },
    new_or_limited: { ko: '신규/정보 부족', en: 'New/Limited Data' },
  };
  return labels[tier];
}

/**
 * 종합 인기지수 정보 가져오기
 */
export function getPopularityInfo(data: PopularityData): PopularityResult {
  const score = calculatePopularityScore(data);
  const tier = getPopularityTier(score);
  const tierLabel = getTierLabel(tier);

  return {
    score,
    tier,
    tierLabel,
  };
}
