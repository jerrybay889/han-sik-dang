"""
배치 동기화 관리 API - Stage B (B-4)
선택한 레스토랑 배치 동기화 및 이력 관리
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel

from src.database.connection import get_db
from src.database.models import SyncLog, ProcessedRestaurant
from src.workflows.sync import SyncWorkflow


router = APIRouter(prefix="/api/data-management/sync", tags=["batch-sync"])


class BatchSyncRequest(BaseModel):
    """배치 동기화 요청"""
    restaurant_ids: List[str]
    batch_name: Optional[str] = None


class SyncHistoryFilter(BaseModel):
    """동기화 이력 필터"""
    days: int = 7
    status: Optional[str] = None
    limit: int = 50


@router.post("/batch")
async def sync_batch(
    request: BatchSyncRequest,
    db: Session = Depends(get_db)
):
    """
    선택한 레스토랑 배치 동기화
    
    - restaurant_ids: 동기화할 레스토랑 ID 목록
    - batch_name: 배치 이름 (선택)
    """
    try:
        if not request.restaurant_ids:
            raise HTTPException(status_code=400, detail="레스토랑 ID가 없습니다")
        
        # 레스토랑 조회
        restaurants = db.query(ProcessedRestaurant).filter(
            ProcessedRestaurant.id.in_(request.restaurant_ids)
        ).all()
        
        if not restaurants:
            return {
                "status": "error",
                "message": "선택한 레스토랑을 찾을 수 없습니다",
                "synced_count": 0
            }
        
        # 동기화 가능한 레스토랑만 필터 (pending 상태)
        pending_restaurants = [r for r in restaurants if r.sync_status == 'pending']
        
        if not pending_restaurants:
            return {
                "status": "warning",
                "message": "동기화할 레스토랑이 없습니다 (이미 동기화됨)",
                "total_selected": len(restaurants),
                "already_synced": len(restaurants)
            }
        
        # 동기화 실행
        workflow = SyncWorkflow()
        
        # 배치 이름이 있으면 로그에 기록 (향후 확장 가능)
        batch_info = {
            "batch_name": request.batch_name or f"Manual Batch {datetime.now().strftime('%Y%m%d_%H%M')}",
            "restaurant_count": len(pending_restaurants)
        }
        
        # 한식당 플랫폼으로 동기화
        await workflow.sync_to_hansikdang()
        
        # 최신 동기화 로그 조회
        latest_log = db.query(SyncLog).order_by(
            SyncLog.started_at.desc()
        ).first()
        
        # 동기화된 레스토랑 수 카운트
        synced_count = db.query(ProcessedRestaurant).filter(
            ProcessedRestaurant.id.in_(request.restaurant_ids),
            ProcessedRestaurant.sync_status == 'synced'
        ).count()
        
        return {
            "status": "success",
            "message": f"{synced_count}개 레스토랑 동기화 완료",
            "batch_info": batch_info,
            "total_selected": len(request.restaurant_ids),
            "pending_count": len(pending_restaurants),
            "synced_count": synced_count,
            "log": {
                "id": latest_log.id,
                "status": latest_log.status,
                "total_sent": latest_log.total_sent,
                "success_count": latest_log.success_count,
                "error_count": latest_log.error_count,
                "started_at": latest_log.started_at.isoformat() if latest_log.started_at else None,
                "completed_at": latest_log.completed_at.isoformat() if latest_log.completed_at else None
            } if latest_log else None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"배치 동기화 실패: {str(e)}")


@router.get("/history")
async def get_sync_history(
    days: int = 7,
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    동기화 이력 조회
    
    - days: 조회 기간 (기본 7일)
    - status: 상태 필터 (running, completed, failed)
    - limit: 최대 개수
    """
    try:
        # 날짜 범위 계산
        start_date = datetime.now() - timedelta(days=days)
        
        # 쿼리 구성
        query = db.query(SyncLog).filter(
            SyncLog.started_at >= start_date
        )
        
        if status:
            query = query.filter(SyncLog.status == status)
        
        # 최신순 정렬
        logs = query.order_by(desc(SyncLog.started_at)).limit(limit).all()
        
        # 통계 계산
        total_synced = sum(log.success_count or 0 for log in logs)
        total_failed = sum(log.error_count or 0 for log in logs)
        
        return {
            "status": "success",
            "period": {
                "days": days,
                "start_date": start_date.isoformat(),
                "end_date": datetime.now().isoformat()
            },
            "summary": {
                "total_runs": len(logs),
                "total_synced": total_synced,
                "total_failed": total_failed,
                "success_rate": round((total_synced / (total_synced + total_failed) * 100) if (total_synced + total_failed) > 0 else 0, 2)
            },
            "history": [
                {
                    "id": log.id,
                    "status": log.status,
                    "total_sent": log.total_sent,
                    "success_count": log.success_count,
                    "error_count": log.error_count,
                    "started_at": log.started_at.isoformat() if log.started_at else None,
                    "completed_at": log.completed_at.isoformat() if log.completed_at else None,
                    "duration": (log.completed_at - log.started_at).total_seconds() if (log.completed_at and log.started_at) else None,
                    "error_details": log.error_details
                }
                for log in logs
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이력 조회 실패: {str(e)}")


@router.get("/restaurants")
async def get_syncable_restaurants(
    status: Optional[str] = 'pending',
    min_quality: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    동기화 가능한 레스토랑 목록 조회
    
    - status: 동기화 상태 (pending, synced, failed)
    - min_quality: 최소 품질 점수
    - limit: 최대 개수
    """
    try:
        query = db.query(ProcessedRestaurant)
        
        if status:
            query = query.filter(ProcessedRestaurant.sync_status == status)
        
        if min_quality > 0:
            query = query.filter(ProcessedRestaurant.quality_score >= min_quality)
        
        restaurants = query.order_by(
            desc(ProcessedRestaurant.quality_score)
        ).limit(limit).all()
        
        # 통계
        total_pending = db.query(ProcessedRestaurant).filter(
            ProcessedRestaurant.sync_status == 'pending'
        ).count()
        
        total_synced = db.query(ProcessedRestaurant).filter(
            ProcessedRestaurant.sync_status == 'synced'
        ).count()
        
        return {
            "status": "success",
            "stats": {
                "total_pending": total_pending,
                "total_synced": total_synced,
                "showing": len(restaurants),
                "filter": {
                    "status": status,
                    "min_quality": min_quality
                }
            },
            "restaurants": [
                {
                    "id": r.id,
                    "name": r.name,
                    "district": r.district,
                    "address": r.address,
                    "phone": r.phone,
                    "quality_score": r.quality_score,
                    "sync_status": r.sync_status,
                    "synced_at": r.synced_at.isoformat() if r.synced_at else None,
                    "created_at": r.created_at.isoformat() if r.created_at else None
                }
                for r in restaurants
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"목록 조회 실패: {str(e)}")


@router.get("/stats/summary")
async def get_sync_summary(db: Session = Depends(get_db)):
    """
    동기화 통계 요약
    
    - 전체 레스토랑 수
    - 동기화 상태별 개수
    - 최근 동기화 이력
    """
    try:
        # 전체 통계
        total = db.query(ProcessedRestaurant).count()
        pending = db.query(ProcessedRestaurant).filter(
            ProcessedRestaurant.sync_status == 'pending'
        ).count()
        synced = db.query(ProcessedRestaurant).filter(
            ProcessedRestaurant.sync_status == 'synced'
        ).count()
        failed = db.query(ProcessedRestaurant).filter(
            ProcessedRestaurant.sync_status == 'failed'
        ).count()
        
        # 최근 24시간 통계
        last_24h = datetime.now() - timedelta(hours=24)
        recent_logs = db.query(SyncLog).filter(
            SyncLog.started_at >= last_24h
        ).all()
        
        synced_24h = sum(log.success_count or 0 for log in recent_logs)
        failed_24h = sum(log.error_count or 0 for log in recent_logs)
        
        # 최신 동기화
        latest_log = db.query(SyncLog).order_by(
            desc(SyncLog.started_at)
        ).first()
        
        return {
            "status": "success",
            "overview": {
                "total_restaurants": total,
                "pending": pending,
                "synced": synced,
                "failed": failed,
                "sync_rate": round((synced / total * 100) if total > 0 else 0, 2)
            },
            "last_24h": {
                "synced": synced_24h,
                "failed": failed_24h,
                "runs": len(recent_logs)
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
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"통계 조회 실패: {str(e)}")
