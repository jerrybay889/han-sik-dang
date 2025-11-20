"""
FastAPI Server for Restaurant Data Hub
"""
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse, Response
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
import os

from src.database.connection import get_db, init_db
from src.database.models import (
    RawRestaurantData, ProcessedRestaurant, ScrapingTarget,
    ScrapingLog, SyncLog, CollectionConfig, DuplicateGroup, QualityScore
)
from src.workflows.scraping import ScrapingWorkflow
from src.api.targeting_routes import router as targeting_router
from src.api.deduplication_routes import router as deduplication_router
from src.api.governance_routes import router as governance_router
from src.api.monitoring_routes import router as monitoring_router
from src.api.dashboard_routes import router as dashboard_router
from src.api.sync_routes import router as sync_router
from src.api.restaurant_routes import router as restaurant_router
from src.api.jobs_routes import router as jobs_router
from src.api.collection_routes import router as collection_router
from src.api.duplicate_routes import router as duplicate_router
from src.api.batch_sync_routes import router as batch_sync_router
from src.api.collection_request_routes import router as collection_request_router
from src.api.collection_result_routes import router as collection_result_router
from src.api.manual_input_routes import router as manual_input_router
from src.api.unified_editor_routes import router as unified_editor_router
from src.api.deployment_routes import router as deployment_router
from config import settings

app = FastAPI(
    title="Restaurant Data Hub API",
    description="데이터 수집 및 관리 시스템",
    version="0.1.0"
)

app.include_router(targeting_router)
app.include_router(deduplication_router)
app.include_router(governance_router)
app.include_router(monitoring_router)
app.include_router(dashboard_router)
app.include_router(sync_router)
app.include_router(restaurant_router)
app.include_router(jobs_router)
app.include_router(collection_router)
app.include_router(duplicate_router)
app.include_router(batch_sync_router)
app.include_router(collection_request_router)
app.include_router(collection_result_router)
app.include_router(manual_input_router)
app.include_router(unified_editor_router)
app.include_router(deployment_router)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 제한 필요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache-Control 미들웨어 (브라우저 캐싱 방지)
@app.middleware("http")
async def add_cache_control_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# Static files
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.on_event("startup")
async def startup_event():
    """서버 시작 시 DB 초기화"""
    init_db()


@app.get("/")
async def root():
    """메인 페이지 - 대시보드로 리다이렉트"""
    return RedirectResponse(url="/dashboard")


@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """시스템 헬스 체크"""
    try:
        total_records = db.query(RawRestaurantData).count()
        return {
            "status": "healthy",
            "database": "connected",
            "total_records": total_records,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
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
    region: Optional[str] = None,
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
    status: Optional[str] = None,
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


@app.get("/dashboard")
async def dashboard():
    """운영 대시보드 (Vue.js + Chart.js)"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "static")
    dashboard_path = os.path.join(static_dir, "dashboard.html")
    
    if os.path.exists(dashboard_path):
        return FileResponse(dashboard_path)
    else:
        raise HTTPException(status_code=404, detail="Dashboard not found")


@app.get("/dashboard/data")
async def data_management():
    """데이터 관리 페이지"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "static")
    data_mgmt_path = os.path.join(static_dir, "data-management.html")
    
    if os.path.exists(data_mgmt_path):
        return FileResponse(data_mgmt_path)
    else:
        raise HTTPException(status_code=404, detail="Data management page not found")


@app.get("/dashboard/collection-settings")
async def collection_settings():
    """수집 설정 관리 페이지 - Stage A MVP"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "static")
    settings_path = os.path.join(static_dir, "collection-settings.html")
    
    if os.path.exists(settings_path):
        return FileResponse(settings_path)
    else:
        raise HTTPException(status_code=404, detail="Collection settings page not found")


@app.get("/dashboard/quality-check")
async def quality_check():
    """중복 검사 & 품질 관리 페이지 - Stage A MVP"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "static")
    quality_path = os.path.join(static_dir, "quality-check.html")
    
    if os.path.exists(quality_path):
        return FileResponse(quality_path)
    else:
        raise HTTPException(status_code=404, detail="Quality check page not found")


@app.get("/dashboard/sync-management")
async def sync_management():
    """배치 동기화 관리 페이지 - Stage B Priority 1 (B-4)"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "static")
    sync_path = os.path.join(static_dir, "sync-management.html")
    
    if os.path.exists(sync_path):
        return FileResponse(sync_path)
    else:
        raise HTTPException(status_code=404, detail="Sync management page not found")


@app.get("/dashboard/data-management")
async def data_management_page():
    """데이터 관리 페이지 (탭 구조)"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "static")
    data_mgmt_path = os.path.join(static_dir, "data-management.html")
    
    if os.path.exists(data_mgmt_path):
        return FileResponse(data_mgmt_path)
    else:
        raise HTTPException(status_code=404, detail="Data management page not found")


@app.get("/dashboard/jobs")
async def jobs_management():
    """작업 관리 페이지 (작업 실행, 모니터링, 이력, 통계)"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "static")
    jobs_path = os.path.join(static_dir, "jobs.html")
    
    if os.path.exists(jobs_path):
        return FileResponse(jobs_path)
    else:
        raise HTTPException(status_code=404, detail="Jobs management page not found")


@app.get("/dashboard/sync")
async def sync_page():
    """동기화 관리 페이지 (배포 현황, 이력, 통계)"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "static")
    sync_path = os.path.join(static_dir, "sync.html")
    
    if os.path.exists(sync_path):
        return FileResponse(sync_path)
    else:
        raise HTTPException(status_code=404, detail="Sync page not found")


@app.get("/dashboard/analytics")
async def analytics():
    """분석 페이지"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "static")
    analytics_path = os.path.join(static_dir, "analytics.html")
    
    if os.path.exists(analytics_path):
        return FileResponse(analytics_path)
    else:
        raise HTTPException(status_code=404, detail="Analytics page not found")


@app.get("/dashboard/settings")
async def settings():
    """설정 페이지"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "static")
    settings_path = os.path.join(static_dir, "settings.html")
    
    if os.path.exists(settings_path):
        return FileResponse(settings_path)
    else:
        raise HTTPException(status_code=404, detail="Settings page not found")


@app.get("/dashboard/collection-request")
async def collection_request():
    """수집 요청 관리 페이지 - Stage C Phase C-1"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "static")
    request_path = os.path.join(static_dir, "collection-request.html")
    
    if os.path.exists(request_path):
        return FileResponse(request_path)
    else:
        raise HTTPException(status_code=404, detail="Collection request page not found")


@app.get("/dashboard/collection-results")
async def collection_results():
    """수집 결과 관리 페이지 - Stage C Phase C-2"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "static")
    results_path = os.path.join(static_dir, "collection-results.html")
    
    if os.path.exists(results_path):
        return FileResponse(results_path, headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
    else:
        raise HTTPException(status_code=404, detail="Collection results page not found")


@app.get("/dashboard/manual-input")
async def manual_input():
    """수동 입력 페이지 - Stage C Phase C-3"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "static")
    manual_path = os.path.join(static_dir, "manual-input.html")
    
    if os.path.exists(manual_path):
        return FileResponse(manual_path)
    else:
        raise HTTPException(status_code=404, detail="Manual input page not found")


@app.get("/dashboard/unified-editor")
async def unified_editor():
    """통합 편집 & 병합 페이지 - Stage C Phase C-4"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "static")
    unified_path = os.path.join(static_dir, "unified-editor.html")
    
    if os.path.exists(unified_path):
        return FileResponse(unified_path)
    else:
        raise HTTPException(status_code=404, detail="Unified editor page not found")


@app.get("/dashboard/deployment")
async def deployment():
    """선택적 배포 관리 페이지 - Stage C Phase C-5"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "static")
    deployment_path = os.path.join(static_dir, "deployment.html")
    
    if os.path.exists(deployment_path):
        return FileResponse(deployment_path)
    else:
        raise HTTPException(status_code=404, detail="Deployment page not found")


@app.get("/dashboard/restaurant/{restaurant_id}")
async def restaurant_detail(restaurant_id: str):
    """레스토랑 상세보기 페이지 - Phase 2"""
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "static")
    detail_path = os.path.join(static_dir, "restaurant-detail.html")
    
    if os.path.exists(detail_path):
        return FileResponse(detail_path, headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
    else:
        raise HTTPException(status_code=404, detail="Restaurant detail page not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
