"""
Main scraping workflow
하루 333개 레스토랑 수집 목표
"""
import asyncio
import uuid
from datetime import datetime
from typing import List
from loguru import logger

from src.database.connection import db_session
from src.database.models import (
    RawRestaurantData, ScrapingTarget, ScrapingLog
)
from src.scrapers.naver import NaverPlaceScraper
from src.scrapers.google import GoogleMapsScraper
from src.processors.gemini import GeminiProcessor
from config import settings


class ScrapingWorkflow:
    """스크래핑 워크플로우"""
    
    def __init__(self):
        self.naver_scraper = NaverPlaceScraper()
        self.google_scraper = GoogleMapsScraper()
        self.gemini = GeminiProcessor()
        self.logger = logger.bind(workflow="scraping")
    
    async def run_daily_scraping(self):
        """일일 스크래핑 실행"""
        self.logger.info(f"Starting daily scraping (target: {settings.daily_target})")
        
        with db_session() as db:
            # 활성 타겟 가져오기
            targets = db.query(ScrapingTarget).filter(
                ScrapingTarget.status == 'active'
            ).order_by(
                ScrapingTarget.priority.desc()
            ).limit(10).all()
            
            if not targets:
                self.logger.warning("No active targets found")
                return
            
            total_scraped = 0
            
            for target in targets:
                if total_scraped >= settings.daily_target:
                    break
                
                log_id = str(uuid.uuid4())
                log = ScrapingLog(
                    id=log_id,
                    target_id=target.id,
                    status='running'
                )
                db.add(log)
                db.commit()
                
                try:
                    # 네이버 스크래핑
                    naver_results = await self.naver_scraper.search(
                        keyword=target.keyword,
                        region=target.region,
                        limit=50
                    )
                    
                    # 데이터베이스에 저장
                    success_count = 0
                    for result in naver_results:
                        try:
                            raw_data = RawRestaurantData(
                                id=str(uuid.uuid4()),
                                source='naver',
                                source_id=result.source_id,
                                source_url=result.source_url,
                                raw_data=result.raw_data,
                                status='pending'
                            )
                            db.add(raw_data)
                            success_count += 1
                            total_scraped += 1
                            
                            if total_scraped >= settings.daily_target:
                                break
                                
                        except Exception as e:
                            self.logger.error(f"Failed to save: {e}")
                    
                    # 로그 업데이트
                    log.completed_at = datetime.now()
                    log.status = 'completed'
                    log.total_scraped = len(naver_results)
                    log.success_count = success_count
                    
                    # 타겟 업데이트
                    target.last_scraped = datetime.now()
                    target.total_found += success_count
                    
                    db.commit()
                    
                    self.logger.info(
                        f"Target '{target.keyword}': {success_count} restaurants"
                    )
                    
                    # Rate limiting
                    await asyncio.sleep(5)
                    
                except Exception as e:
                    self.logger.error(f"Scraping failed for '{target.keyword}': {e}")
                    log.status = 'failed'
                    log.error_details = {"error": str(e)}
                    db.commit()
            
            self.logger.info(f"Daily scraping completed: {total_scraped} restaurants")
    
    async def process_raw_data(self, batch_size: int = 50):
        """원본 데이터 처리 (Gemini AI)"""
        self.logger.info("Processing raw data with Gemini AI")
        
        with db_session() as db:
            # 미처리 데이터 가져오기
            raw_items = db.query(RawRestaurantData).filter(
                RawRestaurantData.status == 'pending'
            ).limit(batch_size).all()
            
            for item in raw_items:
                try:
                    item.status = 'processing'
                    db.commit()
                    
                    # Gemini로 데이터 정제
                    refined = await self.gemini.refine_restaurant_data(item.raw_data)
                    
                    # ProcessedRestaurant에 저장
                    # (다음 단계에서 구현)
                    
                    item.status = 'processed'
                    db.commit()
                    
                    self.logger.info(f"Processed: {refined.get('name')}")
                    
                except Exception as e:
                    self.logger.error(f"Processing failed: {e}")
                    item.status = 'failed'
                    item.error_message = str(e)
                    db.commit()


async def main():
    """워크플로우 실행"""
    workflow = ScrapingWorkflow()
    
    # 일일 스크래핑
    await workflow.run_daily_scraping()
    
    # 데이터 처리
    await workflow.process_raw_data()


if __name__ == "__main__":
    asyncio.run(main())
