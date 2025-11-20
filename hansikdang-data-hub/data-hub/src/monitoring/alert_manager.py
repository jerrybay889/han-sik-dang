"""
Alert Manager - 알림 관리 시스템
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone, timedelta
from loguru import logger
from sqlalchemy.orm import Session

from ..database.models import SystemHealth, QualityMetrics


class AlertManager:
    """
    알림 관리 시스템
    품질 저하, 시스템 오류 등을 모니터링하고 알림을 생성합니다.
    """
    
    def __init__(self, db: Session):
        self.db = db
        
        self.alert_thresholds = {
            'quality_score': 70.0,
            'error_rate': 30.0,
            'response_time_ms': 5000,
            'cpu_usage': 85.0,
            'memory_usage': 85.0,
            'disk_usage': 90.0
        }
    
    def check_quality_alerts(self) -> List[Dict[str, Any]]:
        """품질 관련 알림을 확인합니다."""
        alerts = []
        
        recent_metrics = self.db.query(QualityMetrics)\
            .filter(
                QualityMetrics.measured_at >= datetime.now(timezone.utc) - timedelta(hours=1)
            )\
            .all()
        
        if not recent_metrics:
            return alerts
        
        low_quality_count = sum(
            1 for m in recent_metrics 
            if m.overall_quality_score < self.alert_thresholds['quality_score']
        )
        
        if low_quality_count > len(recent_metrics) * 0.3:
            alerts.append({
                'type': 'quality_degradation',
                'severity': 'high',
                'message': f'품질 저하 감지: {low_quality_count}/{len(recent_metrics)} 데이터가 기준 미달',
                'threshold': self.alert_thresholds['quality_score'],
                'details': {
                    'total_checked': len(recent_metrics),
                    'below_threshold': low_quality_count,
                    'percentage': round((low_quality_count / len(recent_metrics)) * 100, 2)
                }
            })
        
        f_grade_count = sum(1 for m in recent_metrics if m.quality_grade == 'F')
        
        if f_grade_count > 0:
            alerts.append({
                'type': 'critical_quality',
                'severity': 'critical',
                'message': f'심각한 품질 문제: {f_grade_count}개 레스토랑이 F등급',
                'details': {
                    'f_grade_count': f_grade_count
                }
            })
        
        return alerts
    
    def check_system_alerts(self) -> List[Dict[str, Any]]:
        """시스템 관련 알림을 확인합니다."""
        alerts = []
        
        components = ['scraper', 'processor', 'sync', 'api', 'database']
        
        for component in components:
            latest = self.db.query(SystemHealth)\
                .filter(SystemHealth.component == component)\
                .order_by(SystemHealth.measured_at.desc())\
                .first()
            
            if not latest:
                continue
            
            if latest.component_status == 'down':
                alerts.append({
                    'type': 'component_down',
                    'severity': 'critical',
                    'message': f'{component} 구성 요소 다운',
                    'component': component,
                    'details': {
                        'error_rate': latest.error_rate,
                        'last_checked': latest.measured_at.isoformat() if latest.measured_at else None
                    }
                })
            
            elif latest.component_status == 'degraded':
                alerts.append({
                    'type': 'component_degraded',
                    'severity': 'high',
                    'message': f'{component} 성능 저하',
                    'component': component,
                    'details': {
                        'error_rate': latest.error_rate,
                        'response_time_ms': latest.response_time_ms
                    }
                })
            
            if latest.error_rate > self.alert_thresholds['error_rate']:
                alerts.append({
                    'type': 'high_error_rate',
                    'severity': 'high',
                    'message': f'{component} 오류율 높음: {latest.error_rate:.1f}%',
                    'component': component,
                    'threshold': self.alert_thresholds['error_rate'],
                    'current_value': latest.error_rate
                })
        
        return alerts
    
    def check_all_alerts(self) -> Dict[str, Any]:
        """모든 알림을 확인합니다."""
        quality_alerts = self.check_quality_alerts()
        system_alerts = self.check_system_alerts()
        
        all_alerts = quality_alerts + system_alerts
        
        critical_count = sum(1 for a in all_alerts if a.get('severity') == 'critical')
        high_count = sum(1 for a in all_alerts if a.get('severity') == 'high')
        
        status = 'healthy'
        if critical_count > 0:
            status = 'critical'
        elif high_count > 0:
            status = 'warning'
        
        for alert in all_alerts:
            logger.warning(f"🚨 알림: [{alert['severity']}] {alert['message']}")
        
        return {
            'status': status,
            'total_alerts': len(all_alerts),
            'critical': critical_count,
            'high': high_count,
            'alerts': all_alerts,
            'checked_at': datetime.now(timezone.utc).isoformat()
        }
    
    def get_alert_history(
        self,
        hours: int = 24,
        severity: Optional[str] = None
    ) -> Dict[str, Any]:
        """알림 이력을 조회합니다."""
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
        
        health_records = self.db.query(SystemHealth)\
            .filter(
                SystemHealth.measured_at >= cutoff_time,
                SystemHealth.alerts.isnot(None)
            )\
            .all()
        
        all_historical_alerts = []
        for record in health_records:
            if record.alerts:
                for alert in record.alerts:
                    if severity is None or alert.get('severity') == severity:
                        alert['component'] = record.component
                        alert['timestamp'] = record.measured_at.isoformat() if record.measured_at else None
                        all_historical_alerts.append(alert)
        
        return {
            'total_alerts': len(all_historical_alerts),
            'time_range_hours': hours,
            'severity_filter': severity,
            'alerts': all_historical_alerts
        }
