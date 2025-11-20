"""
Governance API Routes - 데이터 거버넌스 엔드포인트
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database.connection import get_db
from ..database.models import QualityMetrics, DataLineage, ProcessedRestaurant
from ..governance.quality_validator import QualityValidator
from ..governance.lineage_tracker import DataLineageTracker
from ..governance.drive_backup import DriveBackupManager


router = APIRouter(prefix="/api/governance", tags=["governance"])


class QualityValidationRequest(BaseModel):
    restaurant_id: Optional[str] = None
    batch_size: Optional[int] = 100


@router.post("/quality/validate")
def validate_quality(
    request: QualityValidationRequest,
    db: Session = Depends(get_db)
):
    """
    데이터 품질을 검증합니다.
    
    - restaurant_id가 있으면 해당 레스토랑만 검증
    - 없으면 일괄 검증 (batch_size 개수만큼)
    """
    validator = QualityValidator(db)
    
    if request.restaurant_id:
        restaurant = db.query(ProcessedRestaurant).filter(
            ProcessedRestaurant.id == request.restaurant_id
        ).first()
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="레스토랑을 찾을 수 없습니다")
        
        metrics = validator.validate_restaurant(restaurant)
        
        return {
            "status": "success",
            "restaurant_id": request.restaurant_id,
            "quality_score": metrics.overall_quality_score,
            "quality_grade": metrics.quality_grade,
            "metrics": {
                "completeness": metrics.completeness_score,
                "accuracy": metrics.accuracy_score,
                "consistency": metrics.consistency_score,
                "timeliness": metrics.timeliness_score,
                "validity": metrics.validity_score,
                "uniqueness": metrics.uniqueness_score,
                "relevance": metrics.relevance_score
            },
            "issues": metrics.issues,
            "recommendations": metrics.recommendations
        }
    else:
        stats = validator.validate_batch(batch_size=request.batch_size)
        
        return {
            "status": "success",
            "type": "batch",
            "statistics": stats
        }


@router.get("/quality/metrics")
def get_quality_metrics(
    restaurant_id: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """품질 메트릭을 조회합니다."""
    query = db.query(QualityMetrics)
    
    if restaurant_id:
        query = query.filter(QualityMetrics.restaurant_id == restaurant_id)
    
    metrics = query.order_by(QualityMetrics.measured_at.desc()).limit(limit).all()
    
    return {
        "status": "success",
        "total": len(metrics),
        "metrics": [
            {
                "id": m.id,
                "restaurant_id": m.restaurant_id,
                "overall_score": m.overall_quality_score,
                "grade": m.quality_grade,
                "measured_at": m.measured_at.isoformat() if m.measured_at else None
            }
            for m in metrics
        ]
    }


@router.get("/quality/stats")
def get_quality_stats(db: Session = Depends(get_db)):
    """품질 통계를 조회합니다."""
    metrics = db.query(QualityMetrics).all()
    
    if not metrics:
        return {
            "status": "success",
            "total_validated": 0,
            "average_score": 0,
            "grade_distribution": {}
        }
    
    total = len(metrics)
    avg_score = sum(m.overall_quality_score for m in metrics) / total
    
    grade_dist = {}
    for grade in ['A', 'B', 'C', 'D', 'F']:
        count = sum(1 for m in metrics if m.quality_grade == grade)
        grade_dist[grade] = count
    
    return {
        "status": "success",
        "total_validated": total,
        "average_score": round(avg_score, 2),
        "grade_distribution": grade_dist,
        "a_grade_percentage": round((grade_dist.get('A', 0) / total * 100) if total > 0 else 0, 2)
    }


@router.get("/lineage/stats")
def get_lineage_stats(
    operation: Optional[str] = None,
    hours: int = 24,
    db: Session = Depends(get_db)
):
    """계보 통계를 조회합니다."""
    tracker = DataLineageTracker(db)
    stats = tracker.get_operation_stats(operation=operation, hours=hours)
    
    return {
        "status": "success",
        "statistics": stats
    }


@router.get("/lineage/{entity_id}")
def get_lineage(
    entity_id: str,
    db: Session = Depends(get_db)
):
    """데이터 계보를 조회합니다."""
    tracker = DataLineageTracker(db)
    journey = tracker.trace_entity_journey(entity_id)
    
    if journey['total_operations'] == 0:
        raise HTTPException(status_code=404, detail="계보를 찾을 수 없습니다")
    
    return {
        "status": "success",
        "lineage": journey
    }


@router.get("/backup/status")
def get_backup_status(db: Session = Depends(get_db)):
    """최근 백업 상태를 조회합니다."""
    backup_manager = DriveBackupManager(db)
    status = backup_manager.get_backup_status()
    
    return {
        "status": "success",
        "backup": status
    }


@router.get("/backup/history")
def get_backup_history(
    days: int = 7,
    db: Session = Depends(get_db)
):
    """백업 이력을 조회합니다."""
    backup_manager = DriveBackupManager(db)
    history = backup_manager.get_backup_history(days=days)
    
    return {
        "status": "success",
        "total": len(history),
        "history": history
    }


class BackupRequest(BaseModel):
    backup_date: Optional[str] = None
    backup_type: str = 'manual'


@router.post("/backup/manual")
def manual_backup(
    request: BackupRequest,
    db: Session = Depends(get_db)
):
    """수동 백업을 실행합니다 (테스트용)."""
    backup_manager = DriveBackupManager(db)
    
    try:
        backup = backup_manager.backup_daily(
            backup_date=request.backup_date,
            backup_type=request.backup_type
        )
        
        return {
            "status": "success",
            "message": "백업이 완료되었습니다",
            "backup": {
                "backup_date": backup.backup_date,
                "file_path": backup.file_path,
                "total_records": backup.total_records,
                "file_size_mb": round(backup.file_size_bytes / 1024 / 1024, 2) if backup.file_size_bytes else 0,
                "execution_time_seconds": backup.execution_time_seconds
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"백업 실패: {str(e)}")
