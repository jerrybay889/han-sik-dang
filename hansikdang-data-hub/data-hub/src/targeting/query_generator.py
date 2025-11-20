"""
동적 쿼리 생성기
외국인 인기도 기반으로 매일 33개의 검색 쿼리를 동적 생성
"""

from typing import List, Dict
from loguru import logger
import random


class QueryGenerator:
    """지역별 인기도 기반 동적 검색 쿼리 생성"""
    
    FOOD_CATEGORIES = [
        "한식", "냉면", "삼겹살", "불고기", "비빔밥", "갈비",
        "찌개", "김치찌개", "된장찌개", "순두부찌개",
        "한정식", "보쌈", "족발", "곱창", "삼계탕",
        "설렁탕", "칼국수", "김밥", "떡볶이", "순대"
    ]
    
    GENERAL_KEYWORDS = [
        "맛집", "한식당", "전통음식", "로컬맛집", "인기맛집"
    ]
    
    def __init__(self):
        """초기화"""
        self.logger = logger
    
    async def generate_daily_queries(
        self,
        top_regions: List[tuple],
        target_count: int = 33
    ) -> List[str]:
        """
        상위 지역 기반 33개 동적 쿼리 생성
        
        Args:
            top_regions: [(지역명, 점수), ...] 형식의 상위 지역 리스트
            target_count: 목표 쿼리 개수 (기본: 33)
            
        Returns:
            검색 쿼리 리스트
        """
        try:
            self.logger.info(f"🎯 동적 쿼리 생성 시작 (목표: {target_count}개)")
            
            queries = []
            regions = [region for region, score in top_regions]
            
            # 지역당 쿼리 개수 계산
            queries_per_region = target_count // len(regions)
            remainder = target_count % len(regions)
            
            for i, (region, score) in enumerate(top_regions):
                # 상위 지역일수록 +1개 더 생성
                count = queries_per_region + (1 if i < remainder else 0)
                
                region_queries = self._generate_region_queries(region, count)
                queries.extend(region_queries)
                
                self.logger.debug(f"  ✓ {region}: {len(region_queries)}개 생성")
            
            # 목표 개수 정확히 맞추기
            if len(queries) > target_count:
                queries = queries[:target_count]
            elif len(queries) < target_count:
                # 부족하면 랜덤 추가
                additional = self._generate_random_queries(target_count - len(queries))
                queries.extend(additional)
            
            # 중복 제거
            queries = list(dict.fromkeys(queries))
            
            # 다시 부족하면 채우기
            while len(queries) < target_count:
                additional = self._generate_random_queries(1)
                if additional[0] not in queries:
                    queries.extend(additional)
            
            self.logger.info(f"✅ 동적 쿼리 생성 완료: {len(queries)}개")
            return queries[:target_count]
            
        except Exception as e:
            self.logger.error(f"❌ 쿼리 생성 실패: {e}")
            return self._get_default_queries(target_count)
    
    def _generate_region_queries(
        self,
        region: str,
        count: int
    ) -> List[str]:
        """
        특정 지역의 다양한 쿼리 생성
        
        Args:
            region: 지역명 (예: "강남구")
            count: 생성할 쿼리 개수
            
        Returns:
            쿼리 리스트
        """
        queries = []
        region_short = region.replace("구", "")  # "강남구" -> "강남"
        
        # 1. 음식 카테고리 쿼리 (60%)
        food_count = int(count * 0.6)
        selected_foods = random.sample(self.FOOD_CATEGORIES, min(food_count, len(self.FOOD_CATEGORIES)))
        for food in selected_foods:
            queries.append(f"{region_short} {food}")
        
        # 2. 일반 키워드 쿼리 (40%)
        general_count = count - food_count
        selected_general = random.sample(self.GENERAL_KEYWORDS, min(general_count, len(self.GENERAL_KEYWORDS)))
        for keyword in selected_general:
            queries.append(f"{region_short} {keyword}")
        
        # 부족하면 조합으로 채우기
        while len(queries) < count:
            food = random.choice(self.FOOD_CATEGORIES)
            queries.append(f"{region_short} {food}")
        
        return queries[:count]
    
    def _generate_random_queries(self, count: int) -> List[str]:
        """
        랜덤 쿼리 생성 (Fallback)
        
        Args:
            count: 생성할 쿼리 개수
            
        Returns:
            쿼리 리스트
        """
        queries = []
        regions = ["홍대", "강남", "명동", "이태원", "여의도", "잠실", "종로"]
        
        for _ in range(count):
            region = random.choice(regions)
            category = random.choice(self.FOOD_CATEGORIES + self.GENERAL_KEYWORDS)
            queries.append(f"{region} {category}")
        
        return queries
    
    def _get_default_queries(self, count: int = 33) -> List[str]:
        """
        기본 쿼리 리스트 (완전 Fallback)
        
        Args:
            count: 쿼리 개수
            
        Returns:
            기본 쿼리 리스트
        """
        default = [
            "홍대 한식", "강남 한식당", "명동 한식", "여의도 맛집",
            "이태원 한식", "서울 삼계탕", "서울 불고기", "서울 비빔밥",
            "서울 갈비", "서울 냉면", "서울 찌개", "강남 냉면",
            "홍대 삼겹살", "명동 한정식", "이태원 불고기", "여의도 한식",
            "잠실 맛집", "종로 한식", "강남 족발", "홍대 보쌈",
            "명동 갈비", "이태원 찌개", "여의도 냉면", "잠실 한식",
            "종로 삼계탕", "강남 곱창", "홍대 김치찌개", "명동 순두부",
            "이태원 설렁탕", "여의도 칼국수", "잠실 비빔밥", "종로 불고기",
            "강남 보쌈"
        ]
        
        return default[:count]
    
    def get_query_diversity_score(self, queries: List[str]) -> Dict[str, any]:
        """
        쿼리 다양성 점수 계산
        
        Args:
            queries: 쿼리 리스트
            
        Returns:
            다양성 통계
        """
        regions = set()
        categories = set()
        
        for query in queries:
            parts = query.split()
            if len(parts) >= 2:
                regions.add(parts[0])
                categories.add(parts[1])
        
        return {
            "total_queries": len(queries),
            "unique_regions": len(regions),
            "unique_categories": len(categories),
            "diversity_score": round((len(regions) * len(categories)) / len(queries) * 100, 2)
        }
