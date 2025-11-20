"""
Cron Schedule for Restaurant Data Hub
매일 자동 실행 스케줄
"""
import schedule
import time
import asyncio
from loguru import logger

from src.workflows.scraping import ScrapingWorkflow
from src.workflows.sync import SyncWorkflow


async def daily_scraping_job():
    """매일 오후 2시: 스크래핑"""
    logger.info("Running daily scraping job")
    workflow = ScrapingWorkflow()
    await workflow.run_daily_scraping()
    logger.info("Daily scraping job completed")


async def daily_processing_job():
    """매일 오후 4시: 데이터 처리"""
    logger.info("Running daily processing job")
    workflow = ScrapingWorkflow()
    await workflow.process_raw_data(batch_size=500)
    logger.info("Daily processing job completed")


async def daily_sync_job():
    """매일 새벽 3시: 한식당 동기화"""
    logger.info("Running daily sync job")
    workflow = SyncWorkflow()
    await workflow.sync_to_hansikdang()
    logger.info("Daily sync job completed")


def run_async_job(coro):
    """비동기 작업 실행 wrapper"""
    asyncio.run(coro)


# 스케줄 설정
schedule.every().day.at("14:00").do(lambda: run_async_job(daily_scraping_job()))
schedule.every().day.at("16:00").do(lambda: run_async_job(daily_processing_job()))
schedule.every().day.at("03:00").do(lambda: run_async_job(daily_sync_job()))


if __name__ == "__main__":
    logger.info("Starting cron scheduler...")
    logger.info("Schedules:")
    logger.info("  - 14:00: Daily scraping")
    logger.info("  - 16:00: Data processing")
    logger.info("  - 03:00: Sync to 한식당")
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # 1분마다 체크
