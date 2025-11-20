"""
Naver Maps API Scraper
네이버 지역 검색 API를 사용한 레스토랑 데이터 수집

Phase 1 업그레이드:
- PlaceID 추출
- 카테고리 상세 파싱
- 기본 정보 강화
"""
import httpx
import uuid
import re
from typing import List, Dict, Any, Optional
from loguru import logger

from config import settings
from src.database.connection import db_session
from src.database.models import RawRestaurantData


class NaverMapsScraper:
    """네이버 Maps API 스크래퍼"""
    
    def __init__(self):
        if not settings.naver_client_id or not settings.naver_client_secret:
            raise ValueError("NAVER_CLIENT_ID and NAVER_CLIENT_SECRET must be set")
        
        self.client_id = settings.naver_client_id
        self.client_secret = settings.naver_client_secret
        # 네이버 검색 API (Local) 사용
        self.base_url = "https://openapi.naver.com/v1/search/local.json"
        self.logger = logger.bind(scraper="naver_maps")
    
    def extract_place_id(self, link: str) -> Optional[str]:
        """
        네이버 플레이스 링크에서 PlaceID 추출
        
        Args:
            link: 네이버 플레이스 URL (예: https://pcmap.place.naver.com/restaurant/1234567890)
        
        Returns:
            PlaceID (예: 1234567890) 또는 None
        """
        if not link:
            return None
        
        # URL 패턴: https://pcmap.place.naver.com/{type}/{place_id}
        match = re.search(r'/(\d+)$', link)
        if match:
            return match.group(1)
        
        return None
    
    def parse_category(self, category: str) -> Dict[str, Any]:
        """
        네이버 카테고리 문자열 파싱
        
        Args:
            category: "음식점>한식>육류,고기요리" 형식
        
        Returns:
            {
                "main": "음식점",
                "sub": "한식",
                "detail": "육류,고기요리",
                "cuisines": ["육류", "고기요리"]
            }
        """
        if not category:
            return {}
        
        parts = category.split('>')
        result = {
            "main": parts[0] if len(parts) > 0 else None,
            "sub": parts[1] if len(parts) > 1 else None,
            "detail": parts[2] if len(parts) > 2 else None,
            "cuisines": parts[2].split(',') if len(parts) > 2 else []
        }
        
        return result
    
    async def search_restaurants(
        self,
        query: str = "홍대 한식",
        coordinate: str = "126.9214,37.5563",  # 홍대입구역 좌표 (사용 안함)
        display: int = 100
    ) -> List[Dict[str, Any]]:
        """
        네이버 검색 API (Local) 호출
        
        Args:
            query: 검색 쿼리 (기본: "홍대 한식")
            coordinate: 중심 좌표 (사용 안함)
            display: 반환 개수 (최대 100)
        
        Returns:
            레스토랑 데이터 리스트
        """
        try:
            headers = {
                "X-Naver-Client-Id": self.client_id,
                "X-Naver-Client-Secret": self.client_secret
            }
            
            params = {
                "query": query,
                "display": min(display, 100),  # 최대 100개 제한
                "start": 1,
                "sort": "random"
            }
            
            self.logger.info(f"Searching: {query} (display={display})")
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.base_url,
                    headers=headers,
                    params=params,
                    timeout=30.0
                )
                response.raise_for_status()
                
                data = response.json()
                places = data.get("items", [])
                
                self.logger.info(f"Found {len(places)} places")
                return places
        
        except httpx.HTTPStatusError as e:
            self.logger.error(f"HTTP error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            self.logger.error(f"Failed to search: {e}")
            raise
    
    def save_to_database(self, places: List[Dict[str, Any]]) -> int:
        """
        네이버 API 결과를 raw_restaurants 테이블에 저장 (Phase 1 업그레이드)
        
        Args:
            places: 네이버 API 응답 데이터
        
        Returns:
            저장된 레스토랑 수
        """
        saved_count = 0
        
        with db_session() as db:
            for place in places:
                try:
                    # 네이버 Local API 응답에서 title에 HTML 태그 제거
                    title = place.get("title", "").replace("<b>", "").replace("</b>", "")
                    
                    # ✅ PlaceID 추출 (Phase 1)
                    link = place.get("link", "")
                    place_id = self.extract_place_id(link)
                    
                    # 중복 체크 (PlaceID 또는 link 기준)
                    source_id = place_id if place_id else link if link else title
                    existing = db.query(RawRestaurantData).filter(
                        RawRestaurantData.source == "naver",
                        RawRestaurantData.source_id == source_id
                    ).first()
                    
                    if existing:
                        self.logger.debug(f"Skipping duplicate: {title}")
                        continue
                    
                    # 좌표 추출 (mapx, mapy를 경도/위도로 변환)
                    # 네이버는 카텍 좌표계를 사용 (mapx, mapy)
                    # mapx = 경도 * 10^7, mapy = 위도 * 10^7
                    mapx = float(place.get("mapx", 0)) if place.get("mapx") else None
                    mapy = float(place.get("mapy", 0)) if place.get("mapy") else None
                    
                    lng = mapx / 10000000.0 if mapx else None
                    lat = mapy / 10000000.0 if mapy else None
                    
                    # ✅ 카테고리 파싱 (Phase 1)
                    category = place.get("category", "")
                    parsed_category = self.parse_category(category)
                    
                    # ✅ 강화된 raw_data (Phase 1)
                    raw_data = {
                        **place,
                        "name": title,
                        "lat": lat,
                        "lng": lng,
                        "latitude": lat,
                        "longitude": lng,
                        "naver_place_id": place_id,  # ✅ PlaceID 추가
                        "parsed_category": parsed_category,  # ✅ 파싱된 카테고리
                        "phone": place.get("telephone", ""),  # ✅ 전화번호 명시
                        "description": place.get("description", ""),  # ✅ 설명
                    }
                    
                    # DB에 저장
                    raw = RawRestaurantData(
                        id=str(uuid.uuid4()),
                        source="naver",
                        source_id=source_id,
                        place_id=place_id,  # ✅ PlaceID 컬럼에 저장
                        raw_data=raw_data,
                        status="pending"
                    )
                    db.add(raw)
                    saved_count += 1
                    
                    self.logger.debug(f"Saved: {title} (PlaceID: {place_id})")
                
                except Exception as e:
                    self.logger.error(f"Failed to save place: {e}")
                    continue
            
            db.commit()
        
        self.logger.info(f"Saved {saved_count}/{len(places)} restaurants to database")
        return saved_count
    
    async def scrape(
        self,
        query: str = "홍대 한식",
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        전체 스크래핑 프로세스 실행
        
        Args:
            query: 검색 쿼리
            limit: 수집할 최대 개수
        
        Returns:
            스크래핑 결과 통계
        """
        self.logger.info(f"Starting scrape: {query} (limit={limit})")
        
        # API 호출
        places = await self.search_restaurants(query=query, display=limit)
        
        # DB 저장
        saved_count = self.save_to_database(places)
        
        result = {
            "query": query,
            "total_found": len(places),
            "saved_count": saved_count,
            "duplicate_count": len(places) - saved_count
        }
        
        self.logger.info(f"Scrape completed: {result}")
        return result
