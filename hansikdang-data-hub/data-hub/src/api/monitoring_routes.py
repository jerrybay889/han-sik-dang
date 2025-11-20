"""
Monitoring API Routes - 시스템 모니터링 엔드포인트
"""
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..monitoring.system_monitor import SystemMonitor
from ..monitoring.alert_manager import AlertManager


router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])


@router.get("/health")
def get_system_health(db: Session = Depends(get_db)):
    """시스템 건강 상태를 조회합니다."""
    monitor = SystemMonitor(db)
    overview = monitor.get_system_overview()
    
    return {
        "status": "success",
        "overview": overview
    }


@router.get("/health/{component}")
def get_component_health(
    component: str,
    hours: int = 24,
    db: Session = Depends(get_db)
):
    """특정 구성 요소의 건강 상태를 조회합니다."""
    monitor = SystemMonitor(db)
    trends = monitor.get_performance_trends(component=component, hours=hours)
    
    return {
        "status": "success",
        "component": component,
        "trends": trends
    }


@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    """현재 활성 알림을 조회합니다."""
    alert_manager = AlertManager(db)
    alerts = alert_manager.check_all_alerts()
    
    return {
        "status": "success",
        "alerts": alerts
    }


@router.get("/alerts/history")
def get_alert_history(
    hours: int = 24,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """알림 이력을 조회합니다."""
    alert_manager = AlertManager(db)
    history = alert_manager.get_alert_history(hours=hours, severity=severity)
    
    return {
        "status": "success",
        "history": history
    }


@router.get("/dashboard")
def get_dashboard_data(db: Session = Depends(get_db)):
    """대시보드용 종합 데이터를 제공합니다."""
    monitor = SystemMonitor(db)
    alert_manager = AlertManager(db)
    
    system_overview = monitor.get_system_overview()
    alerts = alert_manager.check_all_alerts()
    
    from ..database.models import RawRestaurantData, ProcessedRestaurant, QualityMetrics
    
    total_raw = db.query(RawRestaurantData).count()
    total_processed = db.query(ProcessedRestaurant).count()
    
    recent_metrics = db.query(QualityMetrics).order_by(
        QualityMetrics.measured_at.desc()
    ).limit(100).all()
    
    avg_quality = 0
    if recent_metrics:
        avg_quality = sum(m.overall_quality_score for m in recent_metrics) / len(recent_metrics)
    
    return {
        "status": "success",
        "dashboard": {
            "system": system_overview,
            "alerts": {
                "status": alerts['status'],
                "total": alerts['total_alerts'],
                "critical": alerts['critical'],
                "high": alerts['high']
            },
            "data": {
                "total_raw": total_raw,
                "total_processed": total_processed,
                "processing_rate": round((total_processed / total_raw * 100) if total_raw > 0 else 0, 2),
                "average_quality": round(avg_quality, 2)
            }
        }
    }
