from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

from src.database.connection import get_db
from src.database.models import ProcessedRestaurant, RawRestaurantData
from pydantic import BaseModel

router = APIRouter(prefix="/api/restaurants", tags=["restaurants"])


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    menu_summary: Optional[str] = None
    open_hours: Optional[str] = None
    price_range: Optional[int] = None
    google_rating: Optional[float] = None
    google_review_count: Optional[int] = None
    image_urls: Optional[List[str]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    quality_score: Optional[float] = None


@router.get("")
def get_restaurants(
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(10, ge=1, le=100, description="페이지당 항목 수"),
    search: Optional[str] = Query(None, description="검색어 (이름, 주소)"),
    district: Optional[str] = Query(None, description="지역 필터"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="최소 평점"),
    status: Optional[str] = Query(None, description="상태 필터 (synced, pending)"),
    sort_by: str = Query("created_at", description="정렬 기준 (created_at, name, rating, quality_score)"),
    sort_order: str = Query("desc", description="정렬 순서 (asc, desc)"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    레스토랑 리스트 조회 (검색, 필터, 정렬, 페이지네이션)
    """
    query = db.query(ProcessedRestaurant)
    
    # 검색 필터
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                ProcessedRestaurant.name.ilike(search_pattern),
                ProcessedRestaurant.address.ilike(search_pattern),
                ProcessedRestaurant.district.ilike(search_pattern)
            )
        )
    
    # 지역 필터
    if district:
        query = query.filter(ProcessedRestaurant.district == district)
    
    # 평점 필터
    if min_rating is not None:
        query = query.filter(ProcessedRestaurant.google_rating >= min_rating)
    
    # 상태 필터
    if status:
        if status == "synced":
            query = query.filter(ProcessedRestaurant.synced_to_hansikdang == True)
        elif status == "pending":
            query = query.filter(ProcessedRestaurant.synced_to_hansikdang == False)
    
    # 정렬
    sort_column = {
        "created_at": ProcessedRestaurant.created_at,
        "name": ProcessedRestaurant.name,
        "rating": ProcessedRestaurant.google_rating,
        "quality_score": ProcessedRestaurant.quality_score
    }.get(sort_by, ProcessedRestaurant.created_at)
    
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # 전체 개수
    total_count = query.count()
    
    # 페이지네이션
    offset = (page - 1) * limit
    restaurants = query.offset(offset).limit(limit).all()
    
    # 응답 데이터
    items = []
    for r in restaurants:
        items.append({
            "id": r.id,
            "name": r.name,
            "name_en": r.name_en,
            "category": r.category,
            "address": r.address,
            "district": r.district,
            "phone": r.phone,
            "google_rating": r.google_rating,
            "google_review_count": r.google_review_count,
            "quality_score": r.quality_score,
            "sync_status": "synced" if r.synced_to_hansikdang else "pending",
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "image_url": r.image_urls[0] if r.image_urls and len(r.image_urls) > 0 else None
        })
    
    return {
        "status": "success",
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit,
        "items": items
    }


@router.get("/{restaurant_id}")
def get_restaurant(
    restaurant_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    레스토랑 상세 조회
    """
    restaurant = db.query(ProcessedRestaurant).filter(
        ProcessedRestaurant.id == restaurant_id
    ).first()
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="레스토랑을 찾을 수 없습니다")
    
    return {
        "status": "success",
        "data": {
            "id": restaurant.id,
            "name": restaurant.name,
            "name_en": restaurant.name_en,
            "category": restaurant.category,
            "address": restaurant.address,
            "district": restaurant.district,
            "phone": restaurant.phone,
            "description": restaurant.description,
            "description_en": restaurant.description_en,
            "menu_summary": restaurant.menu_summary,
            "open_hours": restaurant.open_hours,
            "price_range": restaurant.price_range,
            "google_rating": restaurant.google_rating,
            "google_review_count": restaurant.google_review_count,
            "google_place_id": restaurant.google_place_id,
            "image_urls": restaurant.image_urls or [],
            "latitude": restaurant.latitude,
            "longitude": restaurant.longitude,
            "naver_place_id": restaurant.naver_place_id,
            "website": restaurant.website,
            "quality_score": restaurant.quality_score,
            "popularity_score": restaurant.popularity_score,
            "popularity_tier": restaurant.popularity_tier,
            "sync_status": "synced" if restaurant.synced_to_hansikdang else "pending",
            "synced_to_hansikdang": restaurant.synced_to_hansikdang,
            "created_at": restaurant.created_at.isoformat() if restaurant.created_at else None,
            "updated_at": restaurant.updated_at.isoformat() if restaurant.updated_at else None
        }
    }


@router.put("/{restaurant_id}")
def update_restaurant(
    restaurant_id: str,
    update_data: RestaurantUpdate,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    레스토랑 정보 수정
    """
    restaurant = db.query(ProcessedRestaurant).filter(
        ProcessedRestaurant.id == restaurant_id
    ).first()
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="레스토랑을 찾을 수 없습니다")
    
    # 업데이트할 필드만 적용
    update_dict = update_data.dict(exclude_unset=True)
    
    for field, value in update_dict.items():
        setattr(restaurant, field, value)
    
    restaurant.updated_at = datetime.now(timezone.utc)
    
    try:
        db.commit()
        db.refresh(restaurant)
        
        return {
            "status": "success",
            "message": "레스토랑 정보가 업데이트되었습니다",
            "data": {
                "id": restaurant.id,
                "name": restaurant.name,
                "updated_at": restaurant.updated_at.isoformat()
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"업데이트 실패: {str(e)}")


@router.delete("/{restaurant_id}")
def delete_restaurant(
    restaurant_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    레스토랑 삭제
    """
    restaurant = db.query(ProcessedRestaurant).filter(
        ProcessedRestaurant.id == restaurant_id
    ).first()
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="레스토랑을 찾을 수 없습니다")
    
    restaurant_name = restaurant.name
    
    try:
        db.delete(restaurant)
        db.commit()
        
        return {
            "status": "success",
            "message": f"'{restaurant_name}' 레스토랑이 삭제되었습니다",
            "deleted_id": restaurant_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"삭제 실패: {str(e)}")


@router.get("/districts/list")
def get_districts(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    사용 가능한 지역 목록 조회
    """
    districts = db.query(ProcessedRestaurant.district).distinct().filter(
        ProcessedRestaurant.district.isnot(None)
    ).all()
    
    district_list = [d[0] for d in districts if d[0]]
    district_list.sort()
    
    return {
        "status": "success",
        "districts": district_list
    }
