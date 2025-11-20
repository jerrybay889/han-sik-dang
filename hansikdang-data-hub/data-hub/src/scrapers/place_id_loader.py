"""
Google Place ID Loader
기존 183개 Place ID를 우선적으로 수집
"""
from typing import List, Set
from pathlib import Path
from loguru import logger


class PlaceIDLoader:
    """Google Place ID 우선 리스트 관리"""
    
    def __init__(self, file_path: str = "data/google_place_ids_priority.txt"):
        self.file_path = Path(file_path)
        self.place_ids: Set[str] = set()
        self._load()
    
    def _load(self):
        """파일에서 Place ID 로드"""
        if not self.file_path.exists():
            logger.warning(f"Place ID file not found: {self.file_path}")
            return
        
        with open(self.file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                # 주석과 빈 줄 건너뛰기
                if line and not line.startswith('#'):
                    self.place_ids.add(line)
        
        logger.info(f"Loaded {len(self.place_ids)} priority Place IDs")
    
    def get_priority_list(self) -> List[str]:
        """우선 수집 Place ID 리스트 반환"""
        return list(self.place_ids)
    
    def is_priority(self, place_id: str) -> bool:
        """해당 Place ID가 우선 수집 대상인지 확인"""
        return place_id in self.place_ids
    
    def remove_collected(self, place_id: str):
        """수집 완료된 Place ID 제거"""
        if place_id in self.place_ids:
            self.place_ids.remove(place_id)
    
    def remaining_count(self) -> int:
        """남은 우선 수집 대상 수"""
        return len(self.place_ids)
