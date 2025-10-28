"""
Base scraper interface
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from loguru import logger


@dataclass
class ScrapedRestaurant:
    """스크래핑된 레스토랑 데이터"""
    source: str  # 'naver' or 'google'
    source_id: str
    source_url: str
    raw_data: Dict[str, Any]
    
    # 기본 정보 (파싱된)
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class BaseScraper(ABC):
    """스크래퍼 베이스 클래스"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.logger = logger.bind(scraper=self.__class__.__name__)
    
    @abstractmethod
    async def search(
        self,
        keyword: str,
        region: Optional[str] = None,
        limit: int = 50
    ) -> List[ScrapedRestaurant]:
        """키워드로 레스토랑 검색"""
        pass
    
    @abstractmethod
    async def get_details(self, source_id: str) -> ScrapedRestaurant:
        """레스토랑 상세 정보 가져오기"""
        pass
    
    def _sanitize_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """데이터 정제 (공통)"""
        return {k: v for k, v in data.items() if v is not None}
