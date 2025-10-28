"""
Google Maps Scraper using Outscraper
"""
from typing import List, Optional, Dict, Any
import uuid
import httpx
from loguru import logger

from src.scrapers.base import BaseScraper, ScrapedRestaurant
from config import settings


class GoogleMapsScraper(BaseScraper):
    """구글맵스 스크래퍼 (Outscraper API 사용)"""
    
    BASE_URL = "https://api.outscraper.com"
    
    def __init__(self):
        super().__init__(api_key=settings.outscraper_api_key)
        if not self.api_key:
            raise ValueError("OUTSCRAPER_API_KEY not set")
        
        self.headers = {"X-API-KEY": self.api_key}
    
    async def search(
        self,
        keyword: str,
        region: Optional[str] = None,
        limit: int = 50
    ) -> List[ScrapedRestaurant]:
        """구글맵스 검색"""
        try:
            search_query = f"{keyword} {region}" if region else keyword
            
            # 한국 지역 지정
            if "korea" not in search_query.lower() and "한국" not in search_query:
                search_query += " South Korea"
            
            self.logger.info(f"Searching Google Maps: {search_query}")
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.BASE_URL}/maps/search-v3",
                    headers=self.headers,
                    params={
                        "query": search_query,
                        "limit": limit,
                        "language": "ko",
                        "region": "KR",
                    },
                    timeout=60.0,
                )
                response.raise_for_status()
                data = response.json()
            
            results = []
            for item in data.get("data", []):
                restaurant = self._parse_google_item(item)
                if restaurant:
                    results.append(restaurant)
            
            self.logger.info(f"Found {len(results)} restaurants from Google Maps")
            return results
            
        except Exception as e:
            self.logger.error(f"Google Maps search failed: {e}")
            return []
    
    async def get_details(self, source_id: str) -> ScrapedRestaurant:
        """구글 플레이스 상세 정보"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.BASE_URL}/maps/place-info",
                    headers=self.headers,
                    params={"place_id": source_id},
                    timeout=30.0,
                )
                response.raise_for_status()
                data = response.json()
            
            if data.get("data"):
                return self._parse_google_item(data["data"][0])
            
            raise ValueError(f"No details found for {source_id}")
            
        except Exception as e:
            self.logger.error(f"Failed to get Google details: {e}")
            raise
    
    def _parse_google_item(self, item: Dict[str, Any]) -> ScrapedRestaurant:
        """Outscraper 응답을 ScrapedRestaurant로 변환"""
        try:
            place_id = item.get("place_id") or item.get("google_id") or str(uuid.uuid4())
            
            # GPS 좌표 파싱
            lat = None
            lng = None
            if "latitude" in item and "longitude" in item:
                lat = float(item["latitude"])
                lng = float(item["longitude"])
            elif "location" in item:
                lat = float(item["location"].get("lat", 0))
                lng = float(item["location"].get("lng", 0))
            
            return ScrapedRestaurant(
                source="google",
                source_id=place_id,
                source_url=item.get("url", ""),
                raw_data=item,
                name=item.get("name"),
                address=item.get("address") or item.get("full_address"),
                phone=item.get("phone"),
                rating=float(item.get("rating", 0)) if item.get("rating") else None,
                review_count=int(item.get("reviews", 0)) if item.get("reviews") else None,
                latitude=lat,
                longitude=lng,
            )
        except Exception as e:
            self.logger.error(f"Failed to parse Google item: {e}")
            return None
