from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime, timezone
import asyncio

from src.database.connection import get_db
from src.workflows.scraping import ScrapingWorkflow
from src.workflows.sync import SyncWorkflow
from src.api.governance_routes import BackupRequest
import logging

router = APIRouter(prefix="/api/jobs", tags=["jobs"])
logger = logging.getLogger(__name__)


@router.post("/targeting/run")
async def run_targeting(background_tasks: BackgroundTasks, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Smart Targeting 실행 (Google Trends 분석 + 동적 쿼리 생성)
    """
    try:
        from src.workflows.smart_targeting import SmartTargetingWorkflow
        
        workflow = SmartTargetingWorkflow()
        
        # 백그라운드에서 실행
        background_tasks.add_task(workflow.run_smart_targeting)
        
        return {
            "status": "success",
            "message": "Smart Targeting이 백그라운드에서 실행 중입니다",
            "started_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Smart Targeting 실행 실패: {e}")
        raise HTTPException(status_code=500, detail=f"실행 실패: {str(e)}")


@router.post("/scraping/run")
async def run_scraping(background_tasks: BackgroundTasks, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Naver Maps 스크래핑 실행 (33개 스마트 쿼리)
    """
    try:
        workflow = ScrapingWorkflow()
        
        # 백그라운드에서 실행
        background_tasks.add_task(workflow.run_daily_scraping)
        
        return {
            "status": "success",
            "message": "Naver 스크래핑이 백그라운드에서 실행 중입니다",
            "started_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"스크래핑 실행 실패: {e}")
        raise HTTPException(status_code=500, detail=f"실행 실패: {str(e)}")


@router.post("/deduplication/run")
async def run_deduplication(background_tasks: BackgroundTasks, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    중복 탐지 & 병합 실행
    """
    try:
        from src.workflows.deduplication import DeduplicationWorkflow
        
        workflow = DeduplicationWorkflow()
        
        # 백그라운드에서 실행
        background_tasks.add_task(workflow.detect_and_merge_duplicates)
        
        return {
            "status": "success",
            "message": "중복 탐지가 백그라운드에서 실행 중입니다",
            "started_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"중복 탐지 실행 실패: {e}")
        raise HTTPException(status_code=500, detail=f"실행 실패: {str(e)}")


@router.post("/gemini/run")
async def run_gemini_processing(background_tasks: BackgroundTasks, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Gemini AI 데이터 정제 실행
    """
    try:
        from src.processors.gemini import GeminiProcessor
        from src.database.models import RawRestaurantData, ProcessedRestaurant
        
        async def process_with_gemini():
            """Gemini 처리 백그라운드 작업"""
            gemini = GeminiProcessor()
            
            with db as session:
                # pending 상태 데이터 가져오기
                raw_data = session.query(RawRestaurantData).filter(
                    RawRestaurantData.status == 'pending'
                ).limit(100).all()
                
                logger.info(f"Found {len(raw_data)} pending records for Gemini processing")
                
                processed_count = 0
                for raw in raw_data:
                    try:
                        refined = await gemini.refine_restaurant_data(raw.raw_data)
                        quality = await gemini.calculate_quality_score(raw.raw_data)
                        
                        # ProcessedRestaurant 생성
                        processed = ProcessedRestaurant(
                            id=raw.id,
                            name=refined.get('name'),
                            description=refined.get('description'),
                            quality_score=quality,
                            **refined
                        )
                        
                        session.add(processed)
                        raw.status = 'processed'
                        processed_count += 1
                        
                    except Exception as e:
                        logger.error(f"Failed to process {raw.id}: {e}")
                        continue
                
                session.commit()
                logger.info(f"Gemini processing completed: {processed_count} restaurants")
        
        # 백그라운드에서 실행
        background_tasks.add_task(process_with_gemini)
        
        return {
            "status": "success",
            "message": "Gemini AI 정제가 백그라운드에서 실행 중입니다",
            "started_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Gemini 처리 실행 실패: {e}")
        raise HTTPException(status_code=500, detail=f"실행 실패: {str(e)}")


@router.post("/places/run")
async def run_places_enrichment(background_tasks: BackgroundTasks, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Google Places API 데이터 보강 실행 (평점, 리뷰, 이미지)
    """
    try:
        from src.workflows.google_places import GooglePlacesWorkflow
        
        workflow = GooglePlacesWorkflow()
        
        # 백그라운드에서 실행
        background_tasks.add_task(workflow.enrich_restaurants)
        
        return {
            "status": "success",
            "message": "Google Places 보강이 백그라운드에서 실행 중입니다",
            "started_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Google Places 실행 실패: {e}")
        raise HTTPException(status_code=500, detail=f"실행 실패: {str(e)}")


@router.post("/sync/run")
async def run_sync(background_tasks: BackgroundTasks, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    메인 플랫폼 동기화 실행 (한식당 앱)
    """
    try:
        workflow = SyncWorkflow()
        
        # 백그라운드에서 실행
        background_tasks.add_task(workflow.sync_to_hansikdang)
        
        return {
            "status": "success",
            "message": "메인 플랫폼 동기화가 백그라운드에서 실행 중입니다",
            "started_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"동기화 실행 실패: {e}")
        raise HTTPException(status_code=500, detail=f"실행 실패: {str(e)}")


@router.post("/backup/run")
async def run_backup(background_tasks: BackgroundTasks, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Google Drive 백업 실행
    """
    try:
        from src.governance.drive_backup import DriveBackupManager
        
        backup_manager = DriveBackupManager(db)
        
        # 백그라운드에서 실행 (manual backup)
        background_tasks.add_task(backup_manager.backup_daily, None, 'manual')
        
        return {
            "status": "success",
            "message": "Google Drive 백업이 백그라운드에서 실행 중입니다",
            "started_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"백업 실행 실패: {e}")
        raise HTTPException(status_code=500, detail=f"실행 실패: {str(e)}")


@router.get("/status")
async def get_jobs_status(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    모든 작업의 마지막 실행 상태 조회
    """
    try:
        from src.database.models import (
            ScrapingTarget, ScrapingLog, DuplicateGroup, MergeHistory,
            SyncLog, BackupHistory
        )
        
        # 각 작업의 마지막 실행 정보
        latest_targeting = db.query(ScrapingTarget).filter(
            ScrapingTarget.created_by == 'auto'
        ).order_by(
            ScrapingTarget.created_at.desc()
        ).first()
        
        latest_scraping = db.query(ScrapingLog).order_by(
            ScrapingLog.started_at.desc()
        ).first()
        
        latest_dedup = db.query(DuplicateGroup).order_by(
            DuplicateGroup.created_at.desc()
        ).first()
        
        latest_merge = db.query(MergeHistory).order_by(
            MergeHistory.merged_at.desc()
        ).first()
        
        latest_sync = db.query(SyncLog).order_by(
            SyncLog.started_at.desc()
        ).first()
        
        latest_backup = db.query(BackupHistory).order_by(
            BackupHistory.started_at.desc()
        ).first()
        
        return {
            "status": "success",
            "jobs": {
                "targeting": {
                    "last_run": latest_targeting.created_at.isoformat() if latest_targeting else None,
                    "status": "completed" if latest_targeting else "never_run",
                    "result": f"Query: {latest_targeting.keyword}" if latest_targeting else None
                },
                "scraping": {
                    "last_run": latest_scraping.started_at.isoformat() if latest_scraping else None,
                    "status": latest_scraping.status if latest_scraping else "never_run",
                    "result": f"{latest_scraping.success_count} scraped" if latest_scraping else None
                },
                "deduplication": {
                    "last_run": latest_dedup.created_at.isoformat() if latest_dedup else None,
                    "status": latest_dedup.status if latest_dedup else "never_run",
                    "result": f"{len(latest_dedup.duplicate_ids) if latest_dedup and latest_dedup.duplicate_ids else 0} duplicates detected, {latest_merge.merged_ids if latest_merge else 0} merged" if latest_dedup else None
                },
                "gemini": {
                    "last_run": None,
                    "status": "not_tracked",
                    "result": "Check processed_restaurants count"
                },
                "places": {
                    "last_run": None,
                    "status": "not_tracked",
                    "result": "Check google_rating fields"
                },
                "sync": {
                    "last_run": latest_sync.started_at.isoformat() if latest_sync else None,
                    "status": latest_sync.status if latest_sync else "never_run",
                    "result": f"{latest_sync.success_count} synced" if latest_sync else None
                },
                "backup": {
                    "last_run": latest_backup.started_at.isoformat() if latest_backup else None,
                    "status": latest_backup.status if latest_backup else "never_run",
                    "result": f"{latest_backup.total_records} records" if latest_backup else None
                }
            }
        }
    except Exception as e:
        logger.error(f"작업 상태 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"조회 실패: {str(e)}")


@router.post("/scheduler/pause")
async def pause_scheduler() -> Dict[str, Any]:
    """
    스케줄러 일시정지 (주의: 실제 구현 필요)
    """
    return {
        "status": "info",
        "message": "스케줄러 일시정지 기능은 scheduler.py에서 구현 필요",
        "note": "현재는 scheduler 프로세스를 수동으로 중지해야 합니다"
    }


@router.post("/scheduler/resume")
async def resume_scheduler() -> Dict[str, Any]:
    """
    스케줄러 재개 (주의: 실제 구현 필요)
    """
    return {
        "status": "info",
        "message": "스케줄러 재개 기능은 scheduler.py에서 구현 필요",
        "note": "현재는 scheduler 프로세스를 수동으로 시작해야 합니다"
    }


@router.post("/scheduler/restart")
async def restart_scheduler() -> Dict[str, Any]:
    """
    스케줄러 재시작 (주의: 실제 구현 필요)
    """
    return {
        "status": "info",
        "message": "스케줄러 재시작 기능은 scheduler.py에서 구현 필요",
        "note": "현재는 Replit workflow를 수동으로 재시작해야 합니다"
    }
