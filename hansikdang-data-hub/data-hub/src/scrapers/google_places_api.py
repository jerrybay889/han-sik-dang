"""
Google Places API 스크래퍼 - 평점 & 리뷰수 수집
비용: 월 $200 무료 쿼터 (Basic Data 필드)
"""
import os
import asyncio
import httpx
from typing import Optional, Dict, List
from loguru import logger

from config import settings
from src.utils.rate_limiter import RateLimiter


class GooglePlacesAPI:
    """
    Google Places API를 사용한 레스토랑 평점/리뷰수 수집
    
    API 비용:
    - Find Place: $17/1000 requests (무료 쿼터: $200/월)
    - 필드: place_id, name, rating, user_ratings_total (Basic Data)
    """
    
    def __init__(self):
        # Google Places API Key 사용 (GOOGLE_PLACES_API_KEY 또는 GEMINI_API_KEY)
        self.api_key = os.getenv("GOOGLE_PLACES_API_KEY") or settings.gemini_api_key
        if not self.api_key:
            raise ValueError("GOOGLE_PLACES_API_KEY or GEMINI_API_KEY not set")
        
        self.base_url = "https://maps.googleapis.com/maps/api/place"
        # Rate Limit: 10 requests/second (안전하게 5 req/s)
        self.rate_limiter = RateLimiter(max_requests=5, per_seconds=1)
        self.logger = logger.bind(scraper="google_places")
    
    async def search_place(
        self, 
        name: str, 
        address: str
    ) -> Optional[Dict]:
        """
        레스토랑 이름 + 주소로 검색
        
        Args:
            name: 레스토랑 이름
            address: 주소
        
        Returns:
            {
                "place_id": str,
                "name": str,
                "rating": float,
                "user_ratings_total": int
            } 또는 None
        """
        try:
            await self.rate_limiter.acquire()
            
            query = f"{name} {address}"
            params = {
                "input": query,
                "inputtype": "textquery",
                "fields": "place_id,name,rating,user_ratings_total,photos",
                "key": self.api_key,
                "language": "ko"
            }
            
            self.logger.debug(f"Searching: {name}")
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/findplacefromtext/json",
                    params=params,
                    timeout=10
                )
                
                if response.status_code != 200:
                    self.logger.error(
                        f"HTTP {response.status_code}: {response.text[:200]}"
                    )
                    return None
                
                data = response.json()
                
                if data.get("status") != "OK":
                    self.logger.warning(
                        f"API status {data.get('status')} for {name}"
                    )
                    return None
                
                candidates = data.get("candidates", [])
                if not candidates:
                    self.logger.warning(f"No candidates for {name}")
                    return None
                
                result = candidates[0]
                
                # ✅ 이미지 URL 추출 (최대 10개)
                image_urls = []
                if 'photos' in result and len(result['photos']) > 0:
                    for photo in result['photos'][:10]:
                        photo_reference = photo.get('photo_reference')
                        if photo_reference:
                            image_url = (
                                f"https://maps.googleapis.com/maps/api/place/photo"
                                f"?maxwidth=800&photo_reference={photo_reference}&key={self.api_key}"
                            )
                            image_urls.append(image_url)
                
                result['image_urls'] = image_urls
                result['image_url'] = image_urls[0] if image_urls else "https://via.placeholder.com/400x300?text=Restaurant"
                
                self.logger.info(
                    f"Found: {result.get('name')} "
                    f"(rating: {result.get('rating')}, "
                    f"reviews: {result.get('user_ratings_total')}, "
                    f"images: {len(image_urls)})"
                )
                return result
        
        except httpx.HTTPError as e:
            self.logger.error(f"HTTP error for {name}: {e}")
            return None
        except Exception as e:
            self.logger.error(f"Failed to search {name}: {e}")
            return None
    
    async def batch_search(
        self, 
        restaurants: List[Dict]
    ) -> List[Dict]:
        """
        배치 처리 - 병렬로 처리하되 Rate Limit 준수
        
        Args:
            restaurants: [{"id": str, "name": str, "address": str}, ...]
        
        Returns:
            [{"restaurant_id": str, "google_data": dict}, ...]
        """
        self.logger.info(f"Batch search: {len(restaurants)} restaurants")
        
        tasks = [
            self.search_place(r["name"], r["address"]) 
            for r in restaurants
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        successful = [
            {
                "restaurant_id": restaurants[i]["id"],
                "google_data": result
            }
            for i, result in enumerate(results)
            if result and not isinstance(result, Exception)
        ]
        
        self.logger.info(
            f"Batch complete: {len(successful)}/{len(restaurants)} successful"
        )
        return successful
