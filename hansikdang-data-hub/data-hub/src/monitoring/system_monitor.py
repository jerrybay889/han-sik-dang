"""
System Monitor - 실시간 시스템 모니터링
"""
import uuid
import psutil
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone, timedelta
from loguru import logger
from sqlalchemy.orm import Session

from ..database.models import SystemHealth, RawRestaurantData, ProcessedRestaurant


class SystemMonitor:
    """
    시스템 건강 상태 모니터링
    CPU, 메모리, 성능 지표를 추적합니다.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def monitor_component(
        self,
        component: str,
        total_operations: int = 0,
        successful_operations: int = 0,
        failed_operations: int = 0,
        response_time_ms: Optional[int] = None
    ) -> SystemHealth:
        """
        시스템 구성 요소를 모니터링합니다.
        
        Args:
            component: 구성 요소 이름 (scraper, processor, sync, api, database)
            total_operations: 총 작업 수
            successful_operations: 성공한 작업 수
            failed_operations: 실패한 작업 수
            response_time_ms: 응답 시간 (밀리초)
            
        Returns:
            SystemHealth: 건강 상태 레코드
        """
        cpu_usage = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        error_rate = 0.0
        success_rate = 100.0
        
        if total_operations > 0:
            error_rate = (failed_operations / total_operations) * 100
            success_rate = (successful_operations / total_operations) * 100
        
        status = self._determine_status(
            error_rate=error_rate,
            response_time_ms=response_time_ms,
            cpu_usage=cpu_usage
        )
        
        alerts = self._check_alerts(
            component=component,
            error_rate=error_rate,
            response_time_ms=response_time_ms,
            cpu_usage=cpu_usage,
            memory_usage=memory.percent
        )
        
        health = SystemHealth(
            id=str(uuid.uuid4()),
            component=component,
            component_status=status,
            response_time_ms=response_time_ms,
            throughput=total_operations,
            error_rate=error_rate,
            success_rate=success_rate,
            cpu_usage=cpu_usage,
            memory_usage=memory.percent,
            disk_usage=disk.percent,
            total_operations=total_operations,
            successful_operations=successful_operations,
            failed_operations=failed_operations,
            alerts=alerts,
            last_alert_at=datetime.now(timezone.utc) if alerts else None,
            details={
                'memory_available_mb': round(memory.available / 1024 / 1024, 2),
                'disk_free_gb': round(disk.free / 1024 / 1024 / 1024, 2)
            }
        )
        
        self.db.add(health)
        self.db.commit()
        
        if status != 'healthy':
            logger.warning(f"⚠️  {component} 상태: {status} (오류율: {error_rate:.1f}%)")
        else:
            logger.debug(f"✅ {component} 정상 (성공률: {success_rate:.1f}%)")
        
        return health
    
    def _determine_status(
        self,
        error_rate: float,
        response_time_ms: Optional[int],
        cpu_usage: float
    ) -> str:
        """시스템 상태 판단"""
        if error_rate > 50:
            return 'down'
        elif error_rate > 20 or (response_time_ms and response_time_ms > 5000) or cpu_usage > 90:
            return 'degraded'
        else:
            return 'healthy'
    
    def _check_alerts(
        self,
        component: str,
        error_rate: float,
        response_time_ms: Optional[int],
        cpu_usage: float,
        memory_usage: float
    ) -> List[Dict[str, str]]:
        """알림 확인"""
        alerts = []
        
        if error_rate > 30:
            alerts.append({
                'severity': 'high',
                'type': 'error_rate',
                'message': f'{component} 오류율 높음: {error_rate:.1f}%'
            })
        
        if response_time_ms and response_time_ms > 5000:
            alerts.append({
                'severity': 'medium',
                'type': 'response_time',
                'message': f'{component} 응답 시간 느림: {response_time_ms}ms'
            })
        
        if cpu_usage > 85:
            alerts.append({
                'severity': 'medium',
                'type': 'cpu',
                'message': f'CPU 사용률 높음: {cpu_usage:.1f}%'
            })
        
        if memory_usage > 85:
            alerts.append({
                'severity': 'medium',
                'type': 'memory',
                'message': f'메모리 사용률 높음: {memory_usage:.1f}%'
            })
        
        return alerts
    
    def get_system_overview(self) -> Dict[str, Any]:
        """시스템 전체 개요를 조회합니다."""
        components = ['scraper', 'processor', 'sync', 'api', 'database']
        overview = {}
        
        for component in components:
            latest = self.db.query(SystemHealth)\
                .filter(SystemHealth.component == component)\
                .order_by(SystemHealth.measured_at.desc())\
                .first()
            
            if latest:
                overview[component] = {
                    'status': latest.component_status,
                    'success_rate': latest.success_rate,
                    'error_rate': latest.error_rate,
                    'response_time_ms': latest.response_time_ms,
                    'last_checked': latest.measured_at.isoformat() if latest.measured_at else None
                }
            else:
                overview[component] = {
                    'status': 'unknown',
                    'success_rate': 0,
                    'error_rate': 0
                }
        
        cpu_usage = psutil.cpu_percent(interval=0.5)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        overview['system_resources'] = {
            'cpu_usage': cpu_usage,
            'memory_usage': memory.percent,
            'disk_usage': disk.percent
        }
        
        return overview
    
    def get_performance_trends(
        self,
        component: str,
        hours: int = 24
    ) -> Dict[str, Any]:
        """성능 트렌드를 조회합니다."""
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
        
        records = self.db.query(SystemHealth)\
            .filter(
                SystemHealth.component == component,
                SystemHealth.measured_at >= cutoff_time
            )\
            .order_by(SystemHealth.measured_at.asc())\
            .all()
        
        if not records:
            return {
                'component': component,
                'data_points': 0,
                'avg_success_rate': 0,
                'avg_response_time': 0
            }
        
        success_rates = [r.success_rate for r in records if r.success_rate is not None]
        response_times = [r.response_time_ms for r in records if r.response_time_ms]
        
        return {
            'component': component,
            'data_points': len(records),
            'avg_success_rate': round(sum(success_rates) / len(success_rates), 2) if success_rates else 0,
            'avg_response_time': round(sum(response_times) / len(response_times), 2) if response_times else 0,
            'min_response_time': min(response_times) if response_times else 0,
            'max_response_time': max(response_times) if response_times else 0,
            'current_status': records[-1].component_status if records else 'unknown'
        }
