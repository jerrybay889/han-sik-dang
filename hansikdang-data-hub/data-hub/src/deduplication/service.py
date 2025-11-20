from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from loguru import logger

from src.database.models import (
    ProcessedRestaurant,
    DuplicateGroup,
    MergeHistory
)
from src.deduplication.detector import DuplicateDetector
from src.deduplication.merger import MergeManager


class DeduplicationService:
    def __init__(
        self,
        db: Session,
        name_threshold: float = 90.0,
        address_threshold: float = 85.0,
        distance_threshold_meters: float = 100.0
    ):
        self.db = db
        self.detector = DuplicateDetector(
            name_threshold=name_threshold,
            address_threshold=address_threshold,
            distance_threshold_meters=distance_threshold_meters
        )
        self.merger = MergeManager(db)
    
    def detect_and_merge_duplicates(
        self,
        auto_merge: bool = False,
        merge_type: str = 'auto'
    ) -> Dict:
        logger.info("=" * 70)
        logger.info("🔍 중복 탐지 및 병합 프로세스 시작")
        logger.info("=" * 70)
        
        restaurants = self.db.query(ProcessedRestaurant).filter(
            ProcessedRestaurant.name.isnot(None)
        ).all()
        
        if not restaurants:
            logger.warning("⚠️  레스토랑 데이터가 없습니다")
            return {
                'total_restaurants': 0,
                'duplicate_groups_found': 0,
                'merged_groups': 0,
                'total_merged_restaurants': 0
            }
        
        logger.info(f"📊 대상 레스토랑: {len(restaurants)}개")
        
        duplicate_groups = self.detector.detect_duplicates(restaurants)
        
        logger.info(f"🔍 발견된 중복 그룹: {len(duplicate_groups)}개")
        
        merged_count = 0
        total_merged_restaurants = 0
        
        if auto_merge and duplicate_groups:
            logger.info("🔀 자동 병합 시작...")
            
            for group in duplicate_groups:
                group_id = self.merger.merge_duplicates(
                    group,
                    merge_type=merge_type,
                    merged_by='system'
                )
                
                if group_id:
                    merged_count += 1
                    total_merged_restaurants += len(group['duplicates'])
            
            logger.info(f"✅ 자동 병합 완료: {merged_count}개 그룹, {total_merged_restaurants}개 레스토랑")
        else:
            logger.info("ℹ️  자동 병합 비활성화 - 탐지만 수행")
        
        result = {
            'total_restaurants': len(restaurants),
            'duplicate_groups_found': len(duplicate_groups),
            'merged_groups': merged_count,
            'total_merged_restaurants': total_merged_restaurants,
            'duplicate_groups': duplicate_groups if not auto_merge else []
        }
        
        logger.info("=" * 70)
        logger.info("✅ 중복 탐지 및 병합 프로세스 완료")
        logger.info(f"   총 레스토랑: {result['total_restaurants']}개")
        logger.info(f"   중복 그룹: {result['duplicate_groups_found']}개")
        logger.info(f"   병합된 그룹: {result['merged_groups']}개")
        logger.info(f"   병합된 레스토랑: {result['total_merged_restaurants']}개")
        logger.info("=" * 70)
        
        return result
    
    def get_duplicate_groups(
        self,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[DuplicateGroup]:
        query = self.db.query(DuplicateGroup)
        
        if status:
            query = query.filter(DuplicateGroup.status == status)
        
        return query.order_by(DuplicateGroup.created_at.desc()).limit(limit).all()
    
    def get_merge_history(
        self,
        limit: int = 100,
        merge_type: Optional[str] = None
    ) -> List[MergeHistory]:
        query = self.db.query(MergeHistory)
        
        if merge_type:
            query = query.filter(MergeHistory.merge_type == merge_type)
        
        return query.order_by(MergeHistory.merged_at.desc()).limit(limit).all()
    
    def get_deduplication_stats(self) -> Dict:
        total_groups = self.db.query(DuplicateGroup).count()
        merged_groups = self.db.query(DuplicateGroup).filter(
            DuplicateGroup.status == 'merged'
        ).count()
        pending_groups = self.db.query(DuplicateGroup).filter(
            DuplicateGroup.status == 'detected'
        ).count()
        
        total_merges = self.db.query(MergeHistory).count()
        auto_merges = self.db.query(MergeHistory).filter(
            MergeHistory.merge_type == 'auto'
        ).count()
        manual_merges = self.db.query(MergeHistory).filter(
            MergeHistory.merge_type == 'manual'
        ).count()
        
        total_merged_restaurants = 0
        merge_histories = self.db.query(MergeHistory).all()
        for history in merge_histories:
            if history.merged_ids:
                total_merged_restaurants += len(history.merged_ids)
        
        return {
            'duplicate_groups': {
                'total': total_groups,
                'merged': merged_groups,
                'pending': pending_groups
            },
            'merge_history': {
                'total_merges': total_merges,
                'auto_merges': auto_merges,
                'manual_merges': manual_merges,
                'total_merged_restaurants': total_merged_restaurants
            }
        }
