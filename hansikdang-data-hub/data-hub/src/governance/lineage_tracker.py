"""
Data Lineage Tracker - 데이터 계보 추적 시스템
"""
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from loguru import logger
from sqlalchemy.orm import Session

from ..database.models import DataLineage


class DataLineageTracker:
    """
    데이터 변환 이력 추적 시스템
    스크래핑 → 정제 → 병합 → 동기화 전 과정을 기록합니다.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def track_operation(
        self,
        entity_id: str,
        operation: str,
        source_system: str,
        input_data: Optional[Dict] = None,
        output_data: Optional[Dict] = None,
        transformation_rules: Optional[Dict] = None,
        quality_before: Optional[float] = None,
        quality_after: Optional[float] = None,
        execution_time_ms: Optional[int] = None,
        status: str = 'success',
        executed_by: str = 'system'
    ) -> DataLineage:
        """
        데이터 변환 작업을 추적합니다.
        
        Args:
            entity_id: 레스토랑 ID
            operation: 작업 유형 (scraped, processed, merged, synced)
            source_system: 소스 시스템 (naver, google, gemini, system)
            input_data: 입력 데이터 (샘플)
            output_data: 출력 데이터 (샘플)
            transformation_rules: 적용된 규칙
            quality_before: 변환 전 품질 점수
            quality_after: 변환 후 품질 점수
            execution_time_ms: 실행 시간 (밀리초)
            status: 작업 상태
            executed_by: 실행 주체
            
        Returns:
            DataLineage: 계보 레코드
        """
        quality_delta = None
        if quality_before is not None and quality_after is not None:
            quality_delta = quality_after - quality_before
        
        lineage = DataLineage(
            id=str(uuid.uuid4()),
            entity_id=entity_id,
            entity_type='restaurant',
            operation=operation,
            operation_status=status,
            source_system=source_system,
            source_id=entity_id,
            input_data=self._sample_data(input_data),
            output_data=self._sample_data(output_data),
            transformation_rules=transformation_rules,
            quality_before=quality_before,
            quality_after=quality_after,
            quality_delta=quality_delta,
            executed_by=executed_by,
            execution_time_ms=execution_time_ms
        )
        
        self.db.add(lineage)
        self.db.commit()
        
        logger.debug(f"📊 계보 추적: {entity_id} - {operation} by {source_system}")
        
        return lineage
    
    def _sample_data(self, data: Optional[Dict], max_fields: int = 5) -> Optional[Dict]:
        """데이터 샘플링 (저장 공간 절약)"""
        if not data:
            return None
        
        if isinstance(data, dict):
            keys = list(data.keys())[:max_fields]
            return {k: data[k] for k in keys}
        
        return data
    
    def get_lineage(
        self,
        entity_id: str,
        limit: int = 100
    ) -> List[DataLineage]:
        """
        특정 레스토랑의 계보를 조회합니다.
        
        Args:
            entity_id: 레스토랑 ID
            limit: 최대 조회 수
            
        Returns:
            계보 레코드 목록
        """
        return self.db.query(DataLineage)\
            .filter(DataLineage.entity_id == entity_id)\
            .order_by(DataLineage.executed_at.desc())\
            .limit(limit)\
            .all()
    
    def get_operation_stats(
        self,
        operation: Optional[str] = None,
        hours: int = 24
    ) -> Dict[str, Any]:
        """
        작업 통계를 조회합니다.
        
        Args:
            operation: 작업 유형 필터
            hours: 조회 시간 범위 (시간)
            
        Returns:
            통계 정보
        """
        from datetime import timedelta
        
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
        
        query = self.db.query(DataLineage)\
            .filter(DataLineage.executed_at >= cutoff_time)
        
        if operation:
            query = query.filter(DataLineage.operation == operation)
        
        records = query.all()
        
        total = len(records)
        success = sum(1 for r in records if r.operation_status == 'success')
        failed = sum(1 for r in records if r.operation_status == 'failed')
        
        avg_exec_time = 0
        if records:
            exec_times = [r.execution_time_ms for r in records if r.execution_time_ms]
            if exec_times:
                avg_exec_time = sum(exec_times) / len(exec_times)
        
        avg_quality_delta = 0
        if records:
            deltas = [r.quality_delta for r in records if r.quality_delta is not None]
            if deltas:
                avg_quality_delta = sum(deltas) / len(deltas)
        
        return {
            'total_operations': total,
            'successful': success,
            'failed': failed,
            'success_rate': round((success / total * 100) if total > 0 else 0, 2),
            'avg_execution_time_ms': round(avg_exec_time, 2),
            'avg_quality_improvement': round(avg_quality_delta, 2)
        }
    
    def trace_entity_journey(
        self,
        entity_id: str
    ) -> Dict[str, Any]:
        """
        레스토랑의 전체 여정을 추적합니다.
        
        Args:
            entity_id: 레스토랑 ID
            
        Returns:
            여정 정보
        """
        lineage = self.get_lineage(entity_id)
        
        if not lineage:
            return {
                'entity_id': entity_id,
                'total_operations': 0,
                'journey': []
            }
        
        journey = []
        for record in reversed(lineage):
            journey.append({
                'timestamp': record.executed_at.isoformat() if record.executed_at else None,
                'operation': record.operation,
                'source': record.source_system,
                'status': record.operation_status,
                'quality_change': record.quality_delta,
                'execution_time_ms': record.execution_time_ms
            })
        
        initial_quality = lineage[-1].quality_before if lineage else None
        final_quality = lineage[0].quality_after if lineage else None
        
        return {
            'entity_id': entity_id,
            'total_operations': len(lineage),
            'initial_quality': initial_quality,
            'final_quality': final_quality,
            'total_improvement': final_quality - initial_quality if (initial_quality and final_quality) else None,
            'journey': journey
        }
