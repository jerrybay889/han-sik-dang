"""
Dashboard API Routes - 운영 대시보드용 통합 API
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, text
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List

from ..database.connection import get_db
from ..database.models import (
    ProcessedRestaurant, RawRestaurantData, BackupHistory,
    SystemHealth, QualityMetrics, MergeHistory
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    대시보드 전체 통계 조회 (단일 API로 모든 데이터 제공)
    
    Returns:
        - system_health: 시스템 헬스 체크 (DB, API, Scheduler, Drive)
        - yesterday_stats: 어제 수집 통계
        - backup_status: 백업 상태
        - recent_alerts: 최근 알림 3건
        - weekly_trend: 7일 추이 데이터
    """
    now = datetime.now(timezone.utc)
    yesterday_start = now - timedelta(days=1)
    yesterday_start = yesterday_start.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_end = yesterday_start + timedelta(days=1)
    
    # 1. 시스템 헬스 체크
    system_health = get_system_health(db)
    
    # 2. 어제 수집 통계
    yesterday_stats = get_yesterday_stats(db, yesterday_start, yesterday_end)
    
    # 3. 백업 상태
    backup_status = get_latest_backup_status(db)
    
    # 4. 최근 알림 3건
    recent_alerts = get_recent_alerts(db, limit=3)
    
    # 5. 7일 추이 데이터
    weekly_trend = get_weekly_trend(db, days=7)
    
    return {
        "status": "success",
        "timestamp": now.isoformat(),
        "system_health": system_health,
        "yesterday_stats": yesterday_stats,
        "backup_status": backup_status,
        "recent_alerts": recent_alerts,
        "weekly_trend": weekly_trend
    }


def get_system_health(db: Session) -> Dict[str, Any]:
    """시스템 헬스 체크"""
    # 최근 1시간 이내 헬스 메트릭
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    
    latest_health = db.query(SystemHealth).filter(
        SystemHealth.measured_at >= one_hour_ago
    ).order_by(SystemHealth.measured_at.desc()).first()
    
    # DB 상태
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
        db_message = "Database responding"
    except Exception as e:
        db_status = "unhealthy"
        db_message = str(e)
    
    # API 상태 (현재 응답 중이므로 healthy)
    api_status = "healthy"
    api_message = "API responding"
    
    # Scheduler 상태 (최근 1시간 내 데이터 존재 여부)
    recent_data = db.query(RawRestaurantData).filter(
        RawRestaurantData.scraped_at >= one_hour_ago
    ).count()
    
    scheduler_status = "healthy" if recent_data > 0 or latest_health else "idle"
    scheduler_message = f"Last activity: {recent_data} records in 1h" if recent_data > 0 else "No recent activity"
    
    # Drive 백업 상태 (최근 24시간 내 백업 존재)
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    recent_backup = db.query(BackupHistory).filter(
        BackupHistory.completed_at >= yesterday
    ).order_by(BackupHistory.completed_at.desc()).first()
    
    drive_status = "healthy" if recent_backup and recent_backup.status == "success" else "warning"
    drive_message = f"Last backup: {recent_backup.completed_at.strftime('%Y-%m-%d %H:%M')}" if recent_backup else "No recent backup"
    
    return {
        "database": {
            "status": db_status,
            "message": db_message
        },
        "api": {
            "status": api_status,
            "message": api_message
        },
        "scheduler": {
            "status": scheduler_status,
            "message": scheduler_message
        },
        "drive_backup": {
            "status": drive_status,
            "message": drive_message
        },
        "overall_status": "healthy" if all([
            db_status == "healthy",
            api_status == "healthy",
            scheduler_status in ["healthy", "idle"]
        ]) else "warning"
    }


def get_yesterday_stats(db: Session, start: datetime, end: datetime) -> Dict[str, Any]:
    """어제 수집 통계"""
    # 신규 수집 (raw 데이터)
    new_collected = db.query(RawRestaurantData).filter(
        and_(
            RawRestaurantData.scraped_at >= start,
            RawRestaurantData.scraped_at < end
        )
    ).count()
    
    # 중복 제거된 수
    duplicates_removed = db.query(MergeHistory).filter(
        and_(
            MergeHistory.merged_at >= start,
            MergeHistory.merged_at < end
        )
    ).count()
    
    # 최종 처리된 수
    final_processed = db.query(ProcessedRestaurant).filter(
        and_(
            ProcessedRestaurant.created_at >= start,
            ProcessedRestaurant.created_at < end
        )
    ).count()
    
    # 데이터 완전성 (전화번호, 메뉴, 영업시간 모두 있는 비율)
    complete_count = db.query(ProcessedRestaurant).filter(
        and_(
            ProcessedRestaurant.created_at >= start,
            ProcessedRestaurant.created_at < end,
            ProcessedRestaurant.phone.isnot(None),
            ProcessedRestaurant.menu_summary.isnot(None),
            ProcessedRestaurant.open_hours.isnot(None)
        )
    ).count()
    
    completeness_rate = (complete_count / final_processed * 100) if final_processed > 0 else 0
    
    # 평균 품질 점수
    avg_quality = db.query(func.avg(QualityMetrics.overall_quality_score)).filter(
        and_(
            QualityMetrics.measured_at >= start,
            QualityMetrics.measured_at < end
        )
    ).scalar() or 0
    
    return {
        "new_collected": new_collected,
        "duplicates_removed": duplicates_removed,
        "final_processed": final_processed,
        "completeness_rate": round(completeness_rate, 1),
        "average_quality_score": round(avg_quality, 1),
        "date": start.strftime('%Y-%m-%d')
    }


def get_latest_backup_status(db: Session) -> Dict[str, Any]:
    """최근 백업 상태"""
    latest = db.query(BackupHistory).order_by(
        BackupHistory.completed_at.desc()
    ).first()
    
    if not latest:
        return {
            "status": "no_backup",
            "message": "백업 이력 없음"
        }
    
    return {
        "status": latest.status,
        "backup_date": latest.backup_date,
        "file_name": latest.file_name,
        "file_size_mb": round(latest.file_size_bytes / 1024 / 1024, 2) if latest.file_size_bytes else 0,
        "total_records": latest.total_records,
        "completed_at": latest.completed_at.strftime('%Y-%m-%d %H:%M:%S') if latest.completed_at else None,
        "execution_time_seconds": latest.execution_time_seconds
    }


def get_recent_alerts(db: Session, limit: int = 3) -> List[Dict[str, Any]]:
    """최근 알림 조회 (에러 3건) - 시스템 헬스 기반"""
    # SystemHealth 테이블에서 최근 이슈 조회
    one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    
    health_issues = db.query(SystemHealth).filter(
        and_(
            SystemHealth.measured_at >= one_week_ago,
            SystemHealth.component_status.in_(['degraded', 'down', 'warning'])
        )
    ).order_by(SystemHealth.measured_at.desc()).limit(limit).all()
    
    alerts = []
    for health in health_issues:
        severity = 'high' if health.component_status == 'down' else 'medium'
        message = f"{health.component} status: {health.component_status}"
        if health.error_rate and health.error_rate > 10:
            message += f" (error rate: {health.error_rate:.1f}%)"
        
        alerts.append({
            "id": health.id,
            "severity": severity,
            "component": health.component,
            "message": message,
            "triggered_at": health.measured_at.strftime('%Y-%m-%d %H:%M:%S') if health.measured_at else None,
            "status": health.component_status
        })
    
    return alerts


def get_weekly_trend(db: Session, days: int = 7) -> Dict[str, List]:
    """7일 추이 데이터"""
    now = datetime.now(timezone.utc)
    
    dates = []
    new_collected = []
    final_processed = []
    quality_scores = []
    
    for i in range(days - 1, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        # 날짜
        dates.append(day_start.strftime('%m/%d'))
        
        # 신규 수집
        new_count = db.query(RawRestaurantData).filter(
            and_(
                RawRestaurantData.scraped_at >= day_start,
                RawRestaurantData.scraped_at < day_end
            )
        ).count()
        new_collected.append(new_count)
        
        # 최종 처리
        processed_count = db.query(ProcessedRestaurant).filter(
            and_(
                ProcessedRestaurant.created_at >= day_start,
                ProcessedRestaurant.created_at < day_end
            )
        ).count()
        final_processed.append(processed_count)
        
        # 평균 품질
        avg_quality = db.query(func.avg(QualityMetrics.overall_quality_score)).filter(
            and_(
                QualityMetrics.measured_at >= day_start,
                QualityMetrics.measured_at < day_end
            )
        ).scalar() or 0
        quality_scores.append(round(avg_quality, 1))
    
    return {
        "dates": dates,
        "new_collected": new_collected,
        "final_processed": final_processed,
        "quality_scores": quality_scores
    }
