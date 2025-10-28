"""
FastAPI Server for Restaurant Data Hub
"""
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import uuid
from datetime import datetime

from src.database.connection import get_db, init_db
from src.database.models import (
    RawRestaurantData, ProcessedRestaurant, ScrapingTarget,
    ScrapingLog, SyncLog
)
from src.workflows.scraping import ScrapingWorkflow
from config import settings

app = FastAPI(
    title="Restaurant Data Hub API",
    description="데이터 수집 및 관리 시스템",
    version="0.1.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 제한 필요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """서버 시작 시 DB 초기화"""
    init_db()


@app.get("/")
async def root():
    """Health check"""
    return {
        "service": "Restaurant Data Hub",
        "status": "running",
        "version": "0.1.0"
    }


@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    """전체 통계"""
    total_raw = db.query(RawRestaurantData).count()
    total_processed = db.query(ProcessedRestaurant).count()
    total_synced = db.query(ProcessedRestaurant).filter(
        ProcessedRestaurant.synced_to_hansikdang == True
    ).count()
    
    pending_raw = db.query(RawRestaurantData).filter(
        RawRestaurantData.status == 'pending'
    ).count()
    
    return {
        "total_raw": total_raw,
        "total_processed": total_processed,
        "total_synced": total_synced,
        "pending_processing": pending_raw,
        "daily_target": settings.daily_target,
    }


@app.get("/api/targets")
async def get_targets(db: Session = Depends(get_db)):
    """스크래핑 타겟 목록"""
    targets = db.query(ScrapingTarget).order_by(
        ScrapingTarget.priority.desc()
    ).limit(100).all()
    
    return [
        {
            "id": t.id,
            "keyword": t.keyword,
            "region": t.region,
            "priority": t.priority,
            "status": t.status,
            "total_found": t.total_found,
            "last_scraped": t.last_scraped.isoformat() if t.last_scraped else None,
        }
        for t in targets
    ]


@app.post("/api/targets")
async def create_target(
    keyword: str,
    region: str = None,
    priority: int = 5,
    db: Session = Depends(get_db)
):
    """새 스크래핑 타겟 추가"""
    target = ScrapingTarget(
        id=str(uuid.uuid4()),
        keyword=keyword,
        region=region,
        priority=priority,
        status='active',
        created_by='manual'
    )
    db.add(target)
    db.commit()
    
    return {"id": target.id, "keyword": keyword}


@app.post("/api/scrape/start")
async def start_scraping(db: Session = Depends(get_db)):
    """스크래핑 수동 시작"""
    workflow = ScrapingWorkflow()
    
    # 백그라운드에서 실행 (실제로는 Celery 등 사용 권장)
    import asyncio
    asyncio.create_task(workflow.run_daily_scraping())
    
    return {"status": "started"}


@app.get("/api/logs/scraping")
async def get_scraping_logs(limit: int = 50, db: Session = Depends(get_db)):
    """스크래핑 로그"""
    logs = db.query(ScrapingLog).order_by(
        ScrapingLog.started_at.desc()
    ).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "started_at": log.started_at.isoformat(),
            "completed_at": log.completed_at.isoformat() if log.completed_at else None,
            "status": log.status,
            "total_scraped": log.total_scraped,
            "success_count": log.success_count,
        }
        for log in logs
    ]


@app.get("/api/restaurants/raw")
async def get_raw_restaurants(
    limit: int = 50,
    status: str = None,
    db: Session = Depends(get_db)
):
    """원본 레스토랑 데이터"""
    query = db.query(RawRestaurantData)
    
    if status:
        query = query.filter(RawRestaurantData.status == status)
    
    items = query.order_by(
        RawRestaurantData.scraped_at.desc()
    ).limit(limit).all()
    
    return [
        {
            "id": item.id,
            "source": item.source,
            "source_id": item.source_id,
            "status": item.status,
            "scraped_at": item.scraped_at.isoformat(),
        }
        for item in items
    ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
