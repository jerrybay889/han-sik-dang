"""
Sync API Routes
한식당 플랫폼과의 동기화 관련 API
"""
import asyncio
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from src.database.connection import get_db
from src.database.models import SyncLog, ProcessedRestaurant
from src.workflows.sync import SyncWorkflow

router = APIRouter(prefix="/api/sync", tags=["Sync"])


@router.post("/start")
async def start_sync(db: Session = Depends(get_db)):
    """수동으로 동기화를 시작합니다."""
    try:
        pending_count = db.query(ProcessedRestaurant).filter(
            ProcessedRestaurant.sync_status == 'pending'
        ).count()
        
        if pending_count == 0:
            return {
                "status": "success",
                "message": "동기화할 레스토랑이 없습니다",
                "pending_count": 0
            }
        
        workflow = SyncWorkflow()
        await workflow.sync_to_hansikdang()
        
        latest_log = db.query(SyncLog).order_by(
            SyncLog.started_at.desc()
        ).first()
        
        return {
            "status": "success",
            "message": "동기화가 완료되었습니다",
            "log": {
                "id": latest_log.id,
                "total_sent": latest_log.total_sent,
                "success_count": latest_log.success_count,
                "error_count": latest_log.error_count,
                "status": latest_log.status
            } if latest_log else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"동기화 실패: {str(e)}")


@router.get("/logs")
def get_sync_logs(
    limit: int = 10,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """동기화 로그를 조회합니다."""
    query = db.query(SyncLog).order_by(SyncLog.started_at.desc())
    
    if status:
        query = query.filter(SyncLog.status == status)
    
    logs = query.limit(limit).all()
    
    return {
        "status": "success",
        "total": len(logs),
        "logs": [
            {
                "id": log.id,
                "status": log.status,
                "total_sent": log.total_sent,
                "success_count": log.success_count,
                "error_count": log.error_count,
                "started_at": log.started_at.isoformat() if log.started_at else None,
                "completed_at": log.completed_at.isoformat() if log.completed_at else None,
                "error_details": log.error_details
            }
            for log in logs
        ]
    }


@router.get("/stats")
def get_sync_stats(db: Session = Depends(get_db)):
    """동기화 통계를 조회합니다."""
    total_restaurants = db.query(ProcessedRestaurant).count()
    synced = db.query(ProcessedRestaurant).filter(
        ProcessedRestaurant.sync_status == 'synced'
    ).count()
    pending = db.query(ProcessedRestaurant).filter(
        ProcessedRestaurant.sync_status == 'pending'
    ).count()
    
    last_24h = datetime.now() - timedelta(hours=24)
    recent_logs = db.query(SyncLog).filter(
        SyncLog.started_at >= last_24h
    ).all()
    
    total_synced_24h = sum(log.success_count or 0 for log in recent_logs)
    total_failed_24h = sum(log.error_count or 0 for log in recent_logs)
    
    latest_log = db.query(SyncLog).order_by(
        SyncLog.started_at.desc()
    ).first()
    
    return {
        "status": "success",
        "overview": {
            "total_restaurants": total_restaurants,
            "synced": synced,
            "pending": pending,
            "sync_rate": round((synced / total_restaurants * 100) if total_restaurants > 0 else 0, 2)
        },
        "last_24h": {
            "total_synced": total_synced_24h,
            "total_failed": total_failed_24h,
            "sync_runs": len(recent_logs)
        },
        "latest_sync": {
            "id": latest_log.id,
            "status": latest_log.status,
            "total_sent": latest_log.total_sent,
            "success_count": latest_log.success_count,
            "error_count": latest_log.error_count,
            "started_at": latest_log.started_at.isoformat() if latest_log.started_at else None,
            "completed_at": latest_log.completed_at.isoformat() if latest_log.completed_at else None
        } if latest_log else None
    }


@router.get("/pending")
def get_pending_restaurants(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """동기화 대기 중인 레스토랑 목록을 조회합니다."""
    restaurants = db.query(ProcessedRestaurant).filter(
        ProcessedRestaurant.sync_status == 'pending'
    ).limit(limit).all()
    
    return {
        "status": "success",
        "total": db.query(ProcessedRestaurant).filter(
            ProcessedRestaurant.sync_status == 'pending'
        ).count(),
        "showing": len(restaurants),
        "restaurants": [
            {
                "id": r.id,
                "name": r.name,
                "district": r.district,
                "quality_score": r.quality_score,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in restaurants
        ]
    }
