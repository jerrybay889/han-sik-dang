"""
Naver Place Scraper using Apify
"""
from typing import List, Optional, Dict, Any
import uuid
from apify_client import ApifyClient
from loguru import logger

from src.scrapers.base import BaseScraper, ScrapedRestaurant
from config import settings


class NaverPlaceScraper(BaseScraper):
    """네이버플레이스 스크래퍼 (Apify 사용)"""
    
    def __init__(self):
        super().__init__(api_key=settings.apify_api_token)
        if not self.api_key:
            raise ValueError("APIFY_API_TOKEN not set")
        
        self.client = ApifyClient(self.api_key)
        
        # Apify Actor ID (네이버 플레이스 스크래퍼)
        # 실제 사용 시 Apify Store에서 적합한 Actor 선택 필요
        self.actor_id = "compass/naver-map-scraper"  # 예시
    
    async def search(
        self,
        keyword: str,
        region: Optional[str] = None,
        limit: int = 50
    ) -> List[ScrapedRestaurant]:
        """네이버 플레이스 검색"""
        try:
            search_query = f"{region} {keyword}" if region else keyword
            
            self.logger.info(f"Searching Naver: {search_query}")
            
            # Apify Actor 실행
            run_input = {
                "queries": [search_query],
                "maxItems": limit,
                "language": "ko",
                "includeReviews": True,
                "includeImages": True,
            }
            
            run = self.client.actor(self.actor_id).call(run_input=run_input)
            
            # 결과 가져오기
            results = []
            for item in self.client.dataset(run["defaultDatasetId"]).iterate_items():
                restaurant = self._parse_naver_item(item)
                if restaurant:
                    results.append(restaurant)
            
            self.logger.info(f"Found {len(results)} restaurants from Naver")
            return results
            
        except Exception as e:
            self.logger.error(f"Naver search failed: {e}")
            return []
    
    async def get_details(self, source_id: str) -> ScrapedRestaurant:
        """네이버 플레이스 상세 정보"""
        try:
            # Naver Place ID로 상세 정보 가져오기
            run_input = {
                "placeIds": [source_id],
                "includeReviews": True,
                "maxReviews": 20,
                "includeImages": True,
            }
            
            run = self.client.actor(self.actor_id).call(run_input=run_input)
            
            for item in self.client.dataset(run["defaultDatasetId"]).iterate_items():
                return self._parse_naver_item(item)
            
            raise ValueError(f"No details found for {source_id}")
            
        except Exception as e:
            self.logger.error(f"Failed to get Naver details: {e}")
            raise
    
    def _parse_naver_item(self, item: Dict[str, Any]) -> ScrapedRestaurant:
        """Apify 응답을 ScrapedRestaurant로 변환"""
        try:
            source_id = item.get("id") or item.get("placeId") or str(uuid.uuid4())
            
            return ScrapedRestaurant(
                source="naver",
                source_id=source_id,
                source_url=item.get("url", ""),
                raw_data=item,
                name=item.get("title") or item.get("name"),
                address=item.get("address"),
                phone=item.get("phone") or item.get("tel"),
                rating=float(item.get("rating", 0)) if item.get("rating") else None,
                review_count=int(item.get("reviewCount", 0)) if item.get("reviewCount") else None,
                latitude=float(item.get("lat")) if item.get("lat") else None,
                longitude=float(item.get("lng")) if item.get("lng") else None,
            )
        except Exception as e:
            self.logger.error(f"Failed to parse Naver item: {e}")
            return None


# 수동 스크래핑 백업 (Apify 없이)
class NaverPlaceManualScraper(BaseScraper):
    """수동 네이버 플레이스 스크래퍼 (Playwright 사용)"""
    
    async def search(self, keyword: str, region: Optional[str] = None, limit: int = 50) -> List[ScrapedRestaurant]:
        """
        TODO: Playwright로 직접 스크래핑
        - Apify가 비싸거나 차단될 경우 대비
        - playwright로 네이버 지도 검색 자동화
        """
        self.logger.warning("Manual scraping not implemented yet")
        return []
    
    async def get_details(self, source_id: str) -> ScrapedRestaurant:
        """TODO: 구현 필요"""
        raise NotImplementedError()
