"""
Popularity Score Calculator
네이버/구글 평점 및 리뷰수를 기반으로 종합 인기지수(0-100) 계산
"""
from typing import Optional, Tuple
from loguru import logger


class PopularityCalculator:
    """
    네이버/구글 평점과 리뷰수를 기반으로 종합 인기지수(0-100) 계산
    
    계산 공식:
    1. 평점 점수 (50점 만점)
       - 네이버 평점: (naver_rating / 5.0) * 25점
       - 구글 평점: (google_rating / 5.0) * 25점
    
    2. 리뷰수 점수 (50점 만점)
       - 네이버 리뷰수: min(naver_review_count / 100, 1.0) * 25점
       - 구글 리뷰수: min(google_review_count / 100, 1.0) * 25점
    
    3. 최종 점수 = 평점 점수 + 리뷰수 점수 (0-100)
    """
    
    # 리뷰수 기준점 (100개 이상은 만점 처리)
    REVIEW_THRESHOLD = 100
    
    @staticmethod
    def calculate_popularity_score(
        naver_rating: Optional[float] = None,
        naver_review_count: Optional[int] = None,
        google_rating: Optional[float] = None,
        google_review_count: Optional[int] = None
    ) -> float:
        """
        인기지수 계산
        
        Args:
            naver_rating: 네이버 평점 (0.0-5.0)
            naver_review_count: 네이버 리뷰 개수
            google_rating: 구글 평점 (0.0-5.0)
            google_review_count: 구글 리뷰 개수
        
        Returns:
            인기지수 (0.0-100.0)
        
        Examples:
            >>> # 높은 인기 레스토랑
            >>> calculate_popularity_score(4.5, 1200, 4.3, 856)
            94.0
            
            >>> # 신규 레스토랑
            >>> calculate_popularity_score(4.0, 5, None, None)
            21.3
            
            >>> # 데이터 없음
            >>> calculate_popularity_score(None, None, None, None)
            0.0
        """
        # None 값 처리
        naver_rating = naver_rating or 0.0
        naver_review_count = naver_review_count or 0
        google_rating = google_rating or 0.0
        google_review_count = google_review_count or 0
        
        # 평점 점수 계산 (최대 50점)
        rating_score = 0.0
        if naver_rating > 0:
            rating_score += (naver_rating / 5.0) * 25
        if google_rating > 0:
            rating_score += (google_rating / 5.0) * 25
        
        # 리뷰수 점수 계산 (최대 50점)
        # 리뷰 100개를 기준점으로 설정 (100개 이상은 만점)
        review_score = 0.0
        if naver_review_count > 0:
            review_score += min(naver_review_count / PopularityCalculator.REVIEW_THRESHOLD, 1.0) * 25
        if google_review_count > 0:
            review_score += min(google_review_count / PopularityCalculator.REVIEW_THRESHOLD, 1.0) * 25
        
        # 최종 점수 (0-100)
        final_score = round(rating_score + review_score, 1)
        
        logger.debug(
            f"Popularity calculation: "
            f"Naver({naver_rating:.1f}/{naver_review_count}) "
            f"Google({google_rating:.1f}/{google_review_count}) "
            f"→ Rating:{rating_score:.1f} + Review:{review_score:.1f} = {final_score}"
        )
        
        return final_score
    
    @staticmethod
    def get_popularity_tier(score: float) -> str:
        """
        인기지수 등급 분류
        
        Args:
            score: 인기지수 (0-100)
        
        Returns:
            등급 문자열
            - top_rated: 90-100 (최고 인기)
            - highly_popular: 70-89 (높은 인기)
            - popular: 50-69 (인기)
            - average: 30-49 (보통)
            - new_or_limited: 0-29 (신규/정보 부족)
        
        Examples:
            >>> get_popularity_tier(95.0)
            'top_rated'
            
            >>> get_popularity_tier(75.0)
            'highly_popular'
            
            >>> get_popularity_tier(55.0)
            'popular'
            
            >>> get_popularity_tier(40.0)
            'average'
            
            >>> get_popularity_tier(10.0)
            'new_or_limited'
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
    
    @staticmethod
    def calculate_with_tier(
        naver_rating: Optional[float] = None,
        naver_review_count: Optional[int] = None,
        google_rating: Optional[float] = None,
        google_review_count: Optional[int] = None
    ) -> Tuple[float, str]:
        """
        인기지수와 등급을 함께 계산
        
        Returns:
            (인기지수, 등급) 튜플
        
        Examples:
            >>> calculate_with_tier(4.5, 1200, 4.3, 856)
            (94.0, 'top_rated')
        """
        score = PopularityCalculator.calculate_popularity_score(
            naver_rating, naver_review_count,
            google_rating, google_review_count
        )
        tier = PopularityCalculator.get_popularity_tier(score)
        
        return score, tier
    
    @staticmethod
    def get_tier_display_name(tier: str, lang: str = "ko") -> str:
        """
        등급의 표시 이름 반환
        
        Args:
            tier: 등급 코드
            lang: 언어 ('ko' 또는 'en')
        
        Returns:
            표시 이름
        """
        tier_names = {
            "top_rated": {"ko": "최고 인기", "en": "Top Rated"},
            "highly_popular": {"ko": "높은 인기", "en": "Highly Popular"},
            "popular": {"ko": "인기", "en": "Popular"},
            "average": {"ko": "보통", "en": "Average"},
            "new_or_limited": {"ko": "신규/정보 부족", "en": "New/Limited Data"}
        }
        
        return tier_names.get(tier, {}).get(lang, tier)
