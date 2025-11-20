from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from loguru import logger

from src.database.connection import get_db
from src.deduplication.service import DeduplicationService

router = APIRouter(prefix="/api/duplicates", tags=["duplicates"])


@router.post("/detect")
async def detect_duplicates(
    auto_merge: bool = Query(False, description="자동 병합 여부"),
    name_threshold: float = Query(90.0, ge=0, le=100, description="이름 유사도 임계값"),
    address_threshold: float = Query(85.0, ge=0, le=100, description="주소 유사도 임계값"),
    distance_threshold: float = Query(100.0, ge=0, description="거리 임계값 (미터)"),
    db: Session = Depends(get_db)
):
    """
    레스토랑 중복 탐지 및 자동 병합
    
    - **auto_merge**: True시 중복 자동 병합 (기본값: False)
    - **name_threshold**: 이름 유사도 임계값 (0-100, 기본값: 90)
    - **address_threshold**: 주소 유사도 임계값 (0-100, 기본값: 85)
    - **distance_threshold**: GPS 거리 임계값 (미터, 기본값: 100)
    """
    try:
        logger.info(f"🔍 중복 탐지 요청: auto_merge={auto_merge}")
        
        service = DeduplicationService(
            db=db,
            name_threshold=name_threshold,
            address_threshold=address_threshold,
            distance_threshold_meters=distance_threshold
        )
        
        result = service.detect_and_merge_duplicates(
            auto_merge=auto_merge,
            merge_type='auto' if auto_merge else 'manual'
        )
        
        return {
            "status": "success",
            "data": result,
            "message": f"중복 탐지 완료: {result['duplicate_groups_found']}개 그룹 발견"
        }
        
    except Exception as e:
        logger.error(f"❌ 중복 탐지 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/groups")
async def get_duplicate_groups(
    status: Optional[str] = Query(None, description="상태 필터 (detected, merged, ignored)"),
    limit: int = Query(100, ge=1, le=1000, description="조회 개수"),
    db: Session = Depends(get_db)
):
    """
    중복 그룹 목록 조회
    
    - **status**: 상태 필터 (detected: 탐지됨, merged: 병합됨, ignored: 무시됨)
    - **limit**: 조회 개수 (기본값: 100)
    """
    try:
        service = DeduplicationService(db=db)
        groups = service.get_duplicate_groups(status=status, limit=limit)
        
        result = []
        for group in groups:
            result.append({
                "id": group.id,
                "master_id": group.master_id,
                "duplicate_ids": group.duplicate_ids,
                "total_duplicates": len(group.duplicate_ids) if group.duplicate_ids else 0,
                "similarity_scores": group.similarity_scores,
                "detection_method": group.detection_method,
                "status": group.status,
                "created_at": group.created_at.isoformat() if group.created_at else None,
                "merged_at": group.merged_at.isoformat() if group.merged_at else None
            })
        
        return {
            "status": "success",
            "data": {
                "total": len(result),
                "groups": result
            }
        }
        
    except Exception as e:
        logger.error(f"❌ 중복 그룹 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_merge_history(
    limit: int = Query(100, ge=1, le=1000, description="조회 개수"),
    merge_type: Optional[str] = Query(None, description="병합 타입 (auto, manual)"),
    db: Session = Depends(get_db)
):
    """
    레스토랑 병합 이력 조회
    
    - **limit**: 조회 개수 (기본값: 100)
    - **merge_type**: 병합 타입 (auto: 자동, manual: 수동)
    """
    try:
        service = DeduplicationService(db=db)
        history = service.get_merge_history(limit=limit, merge_type=merge_type)
        
        result = []
        for record in history:
            result.append({
                "id": record.id,
                "duplicate_group_id": record.duplicate_group_id,
                "master_id": record.master_id,
                "merged_ids": record.merged_ids,
                "total_merged": len(record.merged_ids) if record.merged_ids else 0,
                "merge_reason": record.merge_reason,
                "similarity_details": record.similarity_details,
                "merge_type": record.merge_type,
                "merged_by": record.merged_by,
                "merged_at": record.merged_at.isoformat() if record.merged_at else None
            })
        
        return {
            "status": "success",
            "data": {
                "total": len(result),
                "history": result
            }
        }
        
    except Exception as e:
        logger.error(f"❌ 병합 이력 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_deduplication_stats(db: Session = Depends(get_db)):
    """
    중복 제거 통계 조회
    
    전체 중복 그룹, 병합 이력, 처리된 레스토랑 수 등
    """
    try:
        service = DeduplicationService(db=db)
        stats = service.get_deduplication_stats()
        
        return {
            "status": "success",
            "data": stats
        }
        
    except Exception as e:
        logger.error(f"❌ 통계 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))
