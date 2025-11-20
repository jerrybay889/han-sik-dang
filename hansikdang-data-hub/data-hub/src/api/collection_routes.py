"""
수집 설정 관리 API - Stage A MVP
Collection Configuration Management
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
import logging

from src.database.connection import get_db
from src.database.models import CollectionConfig

router = APIRouter(prefix="/api/data-management/collection-configs", tags=["collection-management"])
logger = logging.getLogger(__name__)


class RegionSchema(BaseModel):
    """지역 스키마"""
    sido: str
    gugun: Optional[str] = None
    dong: Optional[str] = None


class CollectionConfigCreate(BaseModel):
    """수집 설정 생성 스키마"""
    name: str
    regions: List[Dict[str, str]]  # [{"sido": "서울", "gugun": "강남구"}]
    keywords: List[str]  # ["갈비", "한우"]
    source: str = "both"  # google/naver/both
    status: str = "active"  # active/paused
    is_active: bool = True


class CollectionConfigUpdate(BaseModel):
    """수집 설정 수정 스키마"""
    name: Optional[str] = None
    regions: Optional[List[Dict[str, str]]] = None
    keywords: Optional[List[str]] = None
    source: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None


class CollectionConfigResponse(BaseModel):
    """수집 설정 응답 스키마"""
    id: int
    name: str
    regions: List[Dict[str, str]]
    keywords: List[str]
    source: str
    status: str
    monthly_cost: float
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


def calculate_monthly_cost(config: CollectionConfigCreate) -> float:
    """
    월간 예상 비용 계산
    - 키워드 수 × 지역 수 × 소스별 단가
    - Naver: $10/키워드/지역
    - Google: $15/키워드/지역
    """
    keyword_count = len(config.keywords)
    region_count = len(config.regions)
    
    naver_cost = 10.0
    google_cost = 15.0
    
    if config.source == 'naver':
        return keyword_count * region_count * naver_cost
    elif config.source == 'google':
        return keyword_count * region_count * google_cost
    elif config.source == 'both':
        return keyword_count * region_count * (naver_cost + google_cost)
    
    return 0.0


@router.post("", response_model=CollectionConfigResponse)
async def create_collection_config(
    config: CollectionConfigCreate,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    새 수집 설정 추가
    """
    try:
        monthly_cost = calculate_monthly_cost(config)
        
        new_config = CollectionConfig(
            name=config.name,
            regions=config.regions,
            keywords=config.keywords,
            source=config.source,
            status=config.status,
            monthly_cost=monthly_cost,
            is_active=config.is_active
        )
        
        db.add(new_config)
        db.commit()
        db.refresh(new_config)
        
        logger.info(f"Created collection config: {new_config.id} - {new_config.name}")
        
        return new_config
    
    except Exception as e:
        logger.error(f"Failed to create collection config: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"생성 실패: {str(e)}")


@router.get("", response_model=List[CollectionConfigResponse])
async def get_collection_configs(
    status: Optional[str] = None,
    is_active: Optional[bool] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[CollectionConfig]:
    """
    수집 설정 목록 조회
    """
    try:
        query = db.query(CollectionConfig)
        
        if status:
            query = query.filter(CollectionConfig.status == status)
        
        if is_active is not None:
            query = query.filter(CollectionConfig.is_active == is_active)
        
        configs = query.order_by(
            CollectionConfig.created_at.desc()
        ).limit(limit).all()
        
        return configs
    
    except Exception as e:
        logger.error(f"Failed to get collection configs: {e}")
        raise HTTPException(status_code=500, detail=f"조회 실패: {str(e)}")


@router.get("/{config_id}", response_model=CollectionConfigResponse)
async def get_collection_config(
    config_id: int,
    db: Session = Depends(get_db)
) -> CollectionConfig:
    """
    특정 수집 설정 조회
    """
    try:
        config = db.query(CollectionConfig).filter(
            CollectionConfig.id == config_id
        ).first()
        
        if not config:
            raise HTTPException(status_code=404, detail="설정을 찾을 수 없습니다")
        
        return config
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get collection config {config_id}: {e}")
        raise HTTPException(status_code=500, detail=f"조회 실패: {str(e)}")


@router.put("/{config_id}", response_model=CollectionConfigResponse)
async def update_collection_config(
    config_id: int,
    config_update: CollectionConfigUpdate,
    db: Session = Depends(get_db)
) -> CollectionConfig:
    """
    수집 설정 수정
    """
    try:
        config = db.query(CollectionConfig).filter(
            CollectionConfig.id == config_id
        ).first()
        
        if not config:
            raise HTTPException(status_code=404, detail="설정을 찾을 수 없습니다")
        
        update_data = config_update.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(config, field, value)
        
        if config_update.keywords or config_update.regions or config_update.source:
            temp_create = CollectionConfigCreate(
                name=config.name,
                regions=config.regions,
                keywords=config.keywords,
                source=config.source
            )
            config.monthly_cost = calculate_monthly_cost(temp_create)
        
        config.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(config)
        
        logger.info(f"Updated collection config: {config_id}")
        
        return config
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update collection config {config_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"수정 실패: {str(e)}")


@router.delete("/{config_id}")
async def delete_collection_config(
    config_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    수집 설정 삭제
    """
    try:
        config = db.query(CollectionConfig).filter(
            CollectionConfig.id == config_id
        ).first()
        
        if not config:
            raise HTTPException(status_code=404, detail="설정을 찾을 수 없습니다")
        
        db.delete(config)
        db.commit()
        
        logger.info(f"Deleted collection config: {config_id}")
        
        return {
            "status": "success",
            "message": f"설정 {config_id}가 삭제되었습니다"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete collection config {config_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"삭제 실패: {str(e)}")


@router.get("/{config_id}/cost-summary")
async def get_cost_summary(
    config_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    특정 설정의 비용 요약
    """
    try:
        config = db.query(CollectionConfig).filter(
            CollectionConfig.id == config_id
        ).first()
        
        if not config:
            raise HTTPException(status_code=404, detail="설정을 찾을 수 없습니다")
        
        keyword_count = len(config.keywords) if config.keywords else 0
        region_count = len(config.regions) if config.regions else 0
        
        return {
            "config_id": config_id,
            "config_name": config.name,
            "monthly_cost": config.monthly_cost,
            "keyword_count": keyword_count,
            "region_count": region_count,
            "source": config.source,
            "cost_per_keyword": config.monthly_cost / keyword_count if keyword_count > 0 else 0,
            "is_active": config.is_active
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get cost summary for {config_id}: {e}")
        raise HTTPException(status_code=500, detail=f"비용 조회 실패: {str(e)}")
