"""
Stage C-4: 통합 편집 & 병합 시스템
- 크롤링 + 수동 입력 데이터를 한 곳에서 편집/병합 관리
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Any, Optional, List, Dict
import json
from datetime import datetime

router = APIRouter(prefix="/api/data-management/unified", tags=["Unified Editor"])


class EditRequest(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    business_hours: Optional[Dict] = None
    menu_items: Optional[List[Dict]] = None
    price_range: Optional[str] = None
    youtube_mention_count: Optional[int] = None
    blog_mention_count: Optional[int] = None
    edited_by: Optional[str] = "admin"


class MergeRequest(BaseModel):
    primary_id: str
    secondary_ids: List[str]
    merge_strategy: str = "primary"


class StatusChangeRequest(BaseModel):
    status: str
    reason: Optional[str] = None
    updated_by: Optional[str] = "admin"


def get_db():
    from src.database.connection import get_db as _get_db
    db_gen = _get_db()
    db = next(db_gen)
    try:
        yield db
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass


@router.put("/edit/{restaurant_id}")
async def edit_restaurant(restaurant_id: str, request: EditRequest, db: Any = Depends(get_db)):
    """
    C-4-1: 레스토랑 정보 편집
    """
    from sqlalchemy import text
    
    try:
        update_fields = []
        update_values = {"id": restaurant_id}
        
        if request.name is not None:
            update_fields.append("name = :name")
            update_values["name"] = request.name
        
        if request.category is not None:
            update_fields.append("category = :category")
            update_values["category"] = request.category
        
        if request.address is not None:
            update_fields.append("address = :address")
            update_values["address"] = request.address
        
        if request.phone is not None:
            update_fields.append("phone = :phone")
            update_values["phone"] = request.phone
        
        if request.latitude is not None:
            update_fields.append("latitude = :latitude")
            update_values["latitude"] = request.latitude
        
        if request.longitude is not None:
            update_fields.append("longitude = :longitude")
            update_values["longitude"] = request.longitude
        
        if request.rating is not None:
            update_fields.append("rating = :rating")
            update_values["rating"] = request.rating
        
        if request.review_count is not None:
            update_fields.append("review_count = :review_count")
            update_values["review_count"] = request.review_count
        
        if request.business_hours is not None:
            update_fields.append("business_hours = :business_hours")
            update_values["business_hours"] = json.dumps(request.business_hours)
        
        if request.menu_items is not None:
            update_fields.append("menu_items = :menu_items")
            update_values["menu_items"] = json.dumps(request.menu_items)
        
        if request.price_range is not None:
            update_fields.append("price_range = :price_range")
            update_values["price_range"] = request.price_range
        
        if request.youtube_mention_count is not None:
            update_fields.append("youtube_mention_count = :youtube_mention_count")
            update_values["youtube_mention_count"] = request.youtube_mention_count
        
        if request.blog_mention_count is not None:
            update_fields.append("blog_mention_count = :blog_mention_count")
            update_values["blog_mention_count"] = request.blog_mention_count
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="수정할 필드가 없습니다")
        
        update_fields.append("edit_status = :edit_status")
        update_values["edit_status"] = "edited"
        
        update_fields.append("edited_by = :edited_by")
        update_values["edited_by"] = request.edited_by
        
        update_fields.append("edited_at = :edited_at")
        update_values["edited_at"] = datetime.utcnow()
        
        update_fields.append("updated_at = :updated_at")
        update_values["updated_at"] = datetime.utcnow()
        
        update_query = text(f"""
        UPDATE collection_results
        SET {', '.join(update_fields)}
        WHERE id = :id
        RETURNING id, name, edit_status, updated_at
        """)
        
        result = db.execute(update_query, update_values)
        row = result.fetchone()
        db.commit()
        
        if not row:
            raise HTTPException(status_code=404, detail="레스토랑을 찾을 수 없습니다")
        
        return {
            "success": True,
            "data": {
                "id": row[0],
                "name": row[1],
                "edit_status": row[2],
                "updated_at": row[3].isoformat() if row[3] else None
            },
            "message": "레스토랑 정보가 성공적으로 수정되었습니다"
        }
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"수정 실패: {str(e)}")
    finally:
        db.close()


@router.post("/merge")
async def merge_restaurants(request: MergeRequest, db: Any = Depends(get_db)):
    """
    C-4-2: 중복 레스토랑 병합
    """
    from sqlalchemy import text
    
    try:
        primary_query = text("""
        SELECT * FROM collection_results WHERE id = :id
        """)
        
        primary_result = db.execute(primary_query, {"id": request.primary_id})
        primary_row = primary_result.fetchone()
        
        if not primary_row:
            raise HTTPException(status_code=404, detail="기준 레스토랑을 찾을 수 없습니다")
        
        delete_query = text("""
        DELETE FROM collection_results WHERE id = ANY(:ids)
        """)
        
        db.execute(delete_query, {"ids": request.secondary_ids})
        
        update_query = text("""
        UPDATE collection_results
        SET edit_status = 'edited',
            is_duplicate = false,
            updated_at = :updated_at
        WHERE id = :id
        RETURNING id, name
        """)
        
        result = db.execute(update_query, {
            "id": request.primary_id,
            "updated_at": datetime.utcnow()
        })
        
        row = result.fetchone()
        db.commit()
        
        return {
            "success": True,
            "data": {
                "merged_id": row[0],
                "name": row[1],
                "removed_count": len(request.secondary_ids)
            },
            "message": f"{len(request.secondary_ids)}개 중복 항목이 병합되었습니다"
        }
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"병합 실패: {str(e)}")
    finally:
        db.close()


@router.post("/status/{restaurant_id}")
async def change_status(restaurant_id: str, request: StatusChangeRequest, db: Any = Depends(get_db)):
    """
    C-4-3: 레스토랑 상태 변경 (approved/rejected/excluded)
    """
    from sqlalchemy import text
    
    valid_statuses = ["pending", "edited", "approved", "rejected", "excluded"]
    if request.status not in valid_statuses:
        raise HTTPException(
            status_code=400, 
            detail=f"유효하지 않은 상태입니다. 가능한 값: {', '.join(valid_statuses)}"
        )
    
    try:
        update_query = text("""
        UPDATE collection_results
        SET edit_status = :status,
            edited_by = :updated_by,
            edited_at = :edited_at,
            updated_at = :updated_at
        WHERE id = :id
        RETURNING id, name, edit_status
        """)
        
        result = db.execute(update_query, {
            "id": restaurant_id,
            "status": request.status,
            "updated_by": request.updated_by,
            "edited_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
        row = result.fetchone()
        db.commit()
        
        if not row:
            raise HTTPException(status_code=404, detail="레스토랑을 찾을 수 없습니다")
        
        return {
            "success": True,
            "data": {
                "id": row[0],
                "name": row[1],
                "status": row[2]
            },
            "message": f"상태가 '{request.status}'로 변경되었습니다"
        }
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"상태 변경 실패: {str(e)}")
    finally:
        db.close()


@router.get("/list")
async def get_unified_list(
    source: Optional[str] = None,
    edit_status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Any = Depends(get_db)
):
    """
    C-4-4: 통합 데이터 목록 조회 (크롤링 + 수동 입력)
    """
    from sqlalchemy import text
    
    try:
        conditions = []
        params = {"limit": limit, "offset": offset}
        
        if source:
            conditions.append("source = :source")
            params["source"] = source
        
        if edit_status:
            conditions.append("edit_status = :edit_status")
            params["edit_status"] = edit_status
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        
        query = text(f"""
        SELECT 
            id, name, category, address, phone, rating, review_count,
            popularity_score, quality_score, source, edit_status,
            is_duplicate, created_at, updated_at
        FROM collection_results
        {where_clause}
        ORDER BY updated_at DESC
        LIMIT :limit OFFSET :offset
        """)
        
        result = db.execute(query, params)
        rows = result.fetchall()
        
        count_query = text(f"""
        SELECT COUNT(*) FROM collection_results {where_clause}
        """)
        count_result = db.execute(count_query, {k: v for k, v in params.items() if k not in ["limit", "offset"]})
        total = count_result.fetchone()[0]
        
        data = []
        for row in rows:
            data.append({
                "id": row[0],
                "name": row[1],
                "category": row[2],
                "address": row[3],
                "phone": row[4],
                "rating": float(row[5]) if row[5] else None,
                "review_count": row[6],
                "popularity_score": float(row[7]) if row[7] else None,
                "quality_score": float(row[8]) if row[8] else None,
                "source": row[9],
                "edit_status": row[10],
                "is_duplicate": row[11],
                "created_at": row[12].isoformat() if row[12] else None,
                "updated_at": row[13].isoformat() if row[13] else None
            })
        
        return {
            "success": True,
            "data": data,
            "total": total,
            "limit": limit,
            "offset": offset
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"조회 실패: {str(e)}")
    finally:
        db.close()
