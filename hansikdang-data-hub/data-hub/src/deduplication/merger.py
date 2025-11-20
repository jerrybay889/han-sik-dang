import uuid
from typing import List, Dict, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from loguru import logger

from src.database.models import (
    ProcessedRestaurant,
    DuplicateGroup,
    MergeHistory
)


class MergeManager:
    def __init__(self, db: Session):
        self.db = db
    
    def merge_duplicates(
        self,
        duplicate_group: Dict,
        merge_type: str = 'auto',
        merged_by: str = 'system'
    ) -> Optional[str]:
        try:
            master_id = duplicate_group['master']['id']
            duplicate_ids = [d['id'] for d in duplicate_group['duplicates']]
            
            master = self.db.query(ProcessedRestaurant).filter(
                ProcessedRestaurant.id == master_id
            ).first()
            
            if not master:
                logger.error(f"Master 레스토랑을 찾을 수 없음: {master_id}")
                return None
            
            duplicates = self.db.query(ProcessedRestaurant).filter(
                ProcessedRestaurant.id.in_(duplicate_ids)
            ).all()
            
            if not duplicates:
                logger.warning(f"중복 레스토랑을 찾을 수 없음: {duplicate_ids}")
                return None
            
            logger.info(f"🔀 병합 시작: {master.name} + {len(duplicates)}개")
            
            merged_master = self._merge_restaurant_data(master, duplicates)
            
            merged_data_backup = []
            for dup in duplicates:
                merged_data_backup.append({
                    'id': dup.id,
                    'name': dup.name,
                    'address': dup.address,
                    'rating': dup.rating,
                    'review_count': dup.review_count
                })
            
            group_id = str(uuid.uuid4())
            duplicate_group_record = DuplicateGroup(
                id=group_id,
                master_id=master.id,
                duplicate_ids=duplicate_ids,
                similarity_scores={
                    d['id']: d['similarity']
                    for d in duplicate_group['duplicates']
                },
                detection_method=duplicate_group['duplicates'][0]['similarity']['detection_method'],
                status='merged',
                merged_at=datetime.utcnow()
            )
            self.db.add(duplicate_group_record)
            
            merge_history = MergeHistory(
                id=str(uuid.uuid4()),
                duplicate_group_id=group_id,
                master_id=master.id,
                merged_ids=duplicate_ids,
                merge_reason=f"중복 탐지: {len(duplicates)}개 레스토랑 병합",
                similarity_details={
                    d['id']: {
                        'name': d['similarity']['name_similarity'],
                        'address': d['similarity']['address_similarity'],
                        'distance': d['similarity']['distance_meters']
                    }
                    for d in duplicate_group['duplicates']
                },
                merged_data=merged_data_backup,
                merge_type=merge_type,
                merged_by=merged_by,
                merged_at=datetime.utcnow()
            )
            self.db.add(merge_history)
            
            for dup in duplicates:
                self.db.delete(dup)
            
            self.db.commit()
            
            logger.info(f"✅ 병합 완료: {master.name} (그룹 ID: {group_id})")
            return group_id
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"❌ 병합 실패: {e}")
            return None
    
    def _merge_restaurant_data(
        self,
        master: ProcessedRestaurant,
        duplicates: List[ProcessedRestaurant]
    ) -> ProcessedRestaurant:
        all_restaurants = [master] + duplicates
        
        master.rating = self._choose_best_value(
            [r.rating for r in all_restaurants],
            prefer='max'
        ) or master.rating
        
        master.review_count = sum(
            r.review_count for r in all_restaurants if r.review_count
        ) or master.review_count
        
        master.naver_rating = self._choose_best_value(
            [r.naver_rating for r in all_restaurants],
            prefer='max'
        ) or master.naver_rating
        
        master.naver_review_count = sum(
            r.naver_review_count for r in all_restaurants if r.naver_review_count
        ) or master.naver_review_count
        
        master.google_rating = self._choose_best_value(
            [r.google_rating for r in all_restaurants],
            prefer='max'
        ) or master.google_rating
        
        master.google_review_count = sum(
            r.google_review_count for r in all_restaurants if r.google_review_count
        ) or master.google_review_count
        
        if not master.phone:
            master.phone = self._choose_best_value(
                [r.phone for r in all_restaurants],
                prefer='first'
            )
        
        if not master.website:
            master.website = self._choose_best_value(
                [r.website for r in all_restaurants],
                prefer='first'
            )
        
        if not master.description or len(master.description or '') < 50:
            master.description = self._choose_best_value(
                [r.description for r in all_restaurants],
                prefer='longest'
            )
        
        if not master.description_en or len(master.description_en or '') < 50:
            master.description_en = self._choose_best_value(
                [r.description_en for r in all_restaurants],
                prefer='longest'
            )
        
        all_image_urls = []
        for r in all_restaurants:
            if r.image_url:
                all_image_urls.append(r.image_url)
            if r.image_urls:
                all_image_urls.extend(r.image_urls)
        
        unique_images = list(set(all_image_urls))[:10]
        if unique_images:
            master.image_url = unique_images[0]
            master.image_urls = unique_images[1:] if len(unique_images) > 1 else []
        
        if not master.menu_summary:
            all_menus = []
            for r in all_restaurants:
                if r.menu_summary:
                    all_menus.extend(r.menu_summary)
            if all_menus:
                seen = set()
                unique_menus = []
                for menu in all_menus:
                    menu_key = menu.get('name', '').lower()
                    if menu_key and menu_key not in seen:
                        seen.add(menu_key)
                        unique_menus.append(menu)
                master.menu_summary = unique_menus[:10]
        
        master.updated_at = datetime.utcnow()
        
        return master
    
    def _choose_best_value(
        self,
        values: List,
        prefer: str = 'first'
    ):
        valid_values = [v for v in values if v is not None]
        
        if not valid_values:
            return None
        
        if prefer == 'max':
            return max(valid_values)
        elif prefer == 'longest':
            return max(valid_values, key=lambda x: len(str(x)))
        else:
            return valid_values[0]
