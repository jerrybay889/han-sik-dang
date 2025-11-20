from typing import List, Dict, Tuple, Optional
from fuzzywuzzy import fuzz
from geopy.distance import geodesic
from loguru import logger

from src.database.models import ProcessedRestaurant


class DuplicateDetector:
    def __init__(
        self,
        name_threshold: float = 90.0,
        address_threshold: float = 85.0,
        distance_threshold_meters: float = 100.0
    ):
        self.name_threshold = name_threshold
        self.address_threshold = address_threshold
        self.distance_threshold_meters = distance_threshold_meters
    
    def detect_duplicates(
        self,
        restaurants: List[ProcessedRestaurant]
    ) -> List[Dict]:
        logger.info(f"🔍 중복 탐지 시작: {len(restaurants)}개 레스토랑")
        
        duplicate_groups = []
        processed_ids = set()
        
        for i, restaurant in enumerate(restaurants):
            if restaurant.id in processed_ids:
                continue
            
            duplicates = []
            
            for j, candidate in enumerate(restaurants):
                if i >= j or candidate.id in processed_ids:
                    continue
                
                similarity = self._calculate_similarity(restaurant, candidate)
                
                if similarity['is_duplicate']:
                    duplicates.append({
                        'id': candidate.id,
                        'name': candidate.name,
                        'similarity': similarity
                    })
                    processed_ids.add(candidate.id)
            
            if duplicates:
                duplicate_groups.append({
                    'master': {
                        'id': restaurant.id,
                        'name': restaurant.name,
                        'address': restaurant.address
                    },
                    'duplicates': duplicates,
                    'total_duplicates': len(duplicates)
                })
                processed_ids.add(restaurant.id)
        
        logger.info(f"✅ 중복 탐지 완료: {len(duplicate_groups)}개 그룹 발견")
        return duplicate_groups
    
    def _calculate_similarity(
        self,
        restaurant1: ProcessedRestaurant,
        restaurant2: ProcessedRestaurant
    ) -> Dict:
        name_similarity = self._fuzzy_match_name(
            restaurant1.name or '',
            restaurant2.name or ''
        )
        
        address_similarity = self._fuzzy_match_address(
            restaurant1.address or '',
            restaurant2.address or ''
        )
        
        distance_meters = self._calculate_distance(
            restaurant1.latitude,
            restaurant1.longitude,
            restaurant2.latitude,
            restaurant2.longitude
        )
        
        is_duplicate = self._is_duplicate(
            name_similarity,
            address_similarity,
            distance_meters
        )
        
        return {
            'is_duplicate': is_duplicate,
            'name_similarity': name_similarity,
            'address_similarity': address_similarity,
            'distance_meters': distance_meters,
            'detection_method': self._get_detection_method(
                name_similarity,
                address_similarity,
                distance_meters
            )
        }
    
    def _fuzzy_match_name(self, name1: str, name2: str) -> float:
        if not name1 or not name2:
            return 0.0
        
        name1 = name1.strip().lower()
        name2 = name2.strip().lower()
        
        ratio = fuzz.ratio(name1, name2)
        partial_ratio = fuzz.partial_ratio(name1, name2)
        token_sort_ratio = fuzz.token_sort_ratio(name1, name2)
        
        return max(ratio, partial_ratio, token_sort_ratio)
    
    def _fuzzy_match_address(self, addr1: str, addr2: str) -> float:
        if not addr1 or not addr2:
            return 0.0
        
        addr1 = addr1.strip().lower()
        addr2 = addr2.strip().lower()
        
        return fuzz.token_sort_ratio(addr1, addr2)
    
    def _calculate_distance(
        self,
        lat1: Optional[float],
        lon1: Optional[float],
        lat2: Optional[float],
        lon2: Optional[float]
    ) -> Optional[float]:
        if not all([lat1, lon1, lat2, lon2]):
            return None
        
        try:
            distance = geodesic((lat1, lon1), (lat2, lon2)).meters
            return round(distance, 2)
        except Exception as e:
            logger.warning(f"거리 계산 실패: {e}")
            return None
    
    def _is_duplicate(
        self,
        name_similarity: float,
        address_similarity: float,
        distance_meters: Optional[float]
    ) -> bool:
        if name_similarity >= self.name_threshold:
            if address_similarity >= self.address_threshold:
                return True
            
            if distance_meters is not None and distance_meters <= self.distance_threshold_meters:
                return True
        
        if (name_similarity >= 80.0 and 
            distance_meters is not None and 
            distance_meters <= 50.0):
            return True
        
        return False
    
    def _get_detection_method(
        self,
        name_similarity: float,
        address_similarity: float,
        distance_meters: Optional[float]
    ) -> str:
        methods = []
        
        if name_similarity >= self.name_threshold:
            methods.append('name')
        
        if address_similarity >= self.address_threshold:
            methods.append('address')
        
        if distance_meters is not None and distance_meters <= self.distance_threshold_meters:
            methods.append('distance')
        
        return '+'.join(methods) if methods else 'none'
