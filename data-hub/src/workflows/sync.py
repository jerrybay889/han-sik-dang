"""
Sync workflow to 한식당
정제된 데이터를 한식당 External API로 전송
"""
import asyncio
import httpx
import uuid
from datetime import datetime
from typing import List, Dict, Any
from loguru import logger

from src.database.connection import db_session
from src.database.models import ProcessedRestaurant, SyncLog
from config import settings


class SyncWorkflow:
    """한식당 동기화 워크플로우"""
    
    def __init__(self):
        self.api_url = settings.hansikdang_api_url
        self.api_key = settings.data_collection_api_key
        self.batch_size = settings.batch_size
        self.logger = logger.bind(workflow="sync")
    
    async def sync_to_hansikdang(self):
        """한식당으로 데이터 동기화"""
        self.logger.info("Starting sync to 한식당")
        
        with db_session() as db:
            # 동기화 대기 중인 레스토랑 (품질 점수 70 이상)
            restaurants = db.query(ProcessedRestaurant).filter(
                ProcessedRestaurant.sync_status == 'pending',
                ProcessedRestaurant.quality_score >= settings.quality_threshold
            ).limit(self.batch_size).all()
            
            if not restaurants:
                self.logger.info("No restaurants to sync")
                return
            
            # 동기화 로그 생성
            log_id = str(uuid.uuid4())
            log = SyncLog(
                id=log_id,
                status='running',
                total_sent=len(restaurants)
            )
            db.add(log)
            db.commit()
            
            try:
                # 한식당 External API로 전송
                payload = [
                    self._format_for_hansikdang(r)
                    for r in restaurants
                ]
                
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{self.api_url}/api/external/restaurants",
                        json={"restaurants": payload},
                        headers={
                            "x-api-key": self.api_key,
                            "Content-Type": "application/json"
                        },
                        timeout=60.0
                    )
                    response.raise_for_status()
                    result = response.json()
                
                # 성공한 레스토랑 업데이트
                success_count = result.get("success_count", 0)
                
                for restaurant in restaurants:
                    restaurant.sync_status = 'synced'
                    restaurant.synced_to_hansikdang = True
                    restaurant.synced_at = datetime.now()
                
                # 로그 업데이트
                log.completed_at = datetime.now()
                log.status = 'completed'
                log.success_count = success_count
                log.error_count = len(restaurants) - success_count
                
                db.commit()
                
                self.logger.info(f"Synced {success_count}/{len(restaurants)} restaurants")
                
            except Exception as e:
                self.logger.error(f"Sync failed: {e}")
                log.status = 'failed'
                log.error_details = {"error": str(e)}
                db.commit()
    
    def _format_for_hansikdang(self, restaurant: ProcessedRestaurant) -> Dict[str, Any]:
        """한식당 External API 형식으로 변환"""
        return {
            "name": restaurant.name,
            "nameEn": restaurant.name_en,
            "category": restaurant.category,
            "cuisine": restaurant.cuisine,
            "district": restaurant.district,
            "address": restaurant.address,
            "addressEn": restaurant.address_en,
            "latitude": restaurant.latitude,
            "longitude": restaurant.longitude,
            "description": restaurant.description,
            "descriptionEn": restaurant.description_en,
            "priceRange": restaurant.price_range,
            "phone": restaurant.phone,
            "website": restaurant.website,
            "openHours": restaurant.open_hours,
            "parking": restaurant.parking,
            "imageUrl": restaurant.image_url,
            "rating": restaurant.rating,
            "reviewCount": restaurant.review_count,
        }


async def main():
    """동기화 실행"""
    workflow = SyncWorkflow()
    await workflow.sync_to_hansikdang()


if __name__ == "__main__":
    asyncio.run(main())
