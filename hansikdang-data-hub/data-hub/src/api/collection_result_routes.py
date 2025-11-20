"""
Collection Results API Routes
수집된 레스토랑 데이터 관리 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
import json

from src.database.connection import get_db

router = APIRouter(prefix="/api/data-management/collection-results", tags=["Collection Results"])


# Pydantic Models (간소화 버전)
class CollectionResultCreate(BaseModel):
    collection_request_id: Optional[str] = None
    name: str
    category: Optional[str] = None
    region: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = 0
    menu_items: Optional[List[Dict[str, Any]]] = None
    business_hours: Optional[Dict[str, Any]] = None
    links: Optional[Dict[str, str]] = None  # 통합된 링크 필드
    source: str  # naver, google, manual


class CollectionResultUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    region: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    menu_items: Optional[List[Dict[str, Any]]] = None
    business_hours: Optional[Dict[str, Any]] = None
    links: Optional[Dict[str, str]] = None  # 통합된 링크 필드


class PopularityScoreRequest(BaseModel):
    result_id: str


# Helper Functions
def calculate_popularity_score(
    rating: Optional[float],
    review_count: Optional[int],
    youtube_mentions: Optional[int],
    blog_mentions: Optional[int],
    has_complete_info: bool = False
) -> Dict[str, Any]:
    """
    인기도 점수 계산 알고리즘
    - Rating Score (30%): 평점 기반
    - Review Score (25%): 리뷰 개수 기반
    - YouTube Score (20%): YouTube 언급 수 기반
    - Blog Score (15%): 블로그 언급 수 기반
    - Quality Score (10%): 정보 완성도 기반
    """
    
    # Rating Score (0-30점)
    rating_score = 0.0
    if rating and rating > 0:
        rating_score = (rating / 5.0) * 30.0
    
    # Review Score (0-25점)
    review_score = 0.0
    if review_count and review_count > 0:
        if review_count >= 1000:
            review_score = 25.0
        elif review_count >= 500:
            review_score = 22.0
        elif review_count >= 100:
            review_score = 18.0
        elif review_count >= 50:
            review_score = 14.0
        elif review_count >= 10:
            review_score = 10.0
        else:
            review_score = review_count * 1.0
    
    # YouTube Score (0-20점)
    youtube_score = 0.0
    if youtube_mentions and youtube_mentions > 0:
        if youtube_mentions >= 20:
            youtube_score = 20.0
        elif youtube_mentions >= 10:
            youtube_score = 16.0
        elif youtube_mentions >= 5:
            youtube_score = 12.0
        else:
            youtube_score = youtube_mentions * 2.4
    
    # Blog Score (0-15점)
    blog_score = 0.0
    if blog_mentions and blog_mentions > 0:
        if blog_mentions >= 50:
            blog_score = 15.0
        elif blog_mentions >= 20:
            blog_score = 12.0
        elif blog_mentions >= 10:
            blog_score = 9.0
        else:
            blog_score = blog_mentions * 0.9
    
    # Quality Score (0-10점)
    quality_score = 0.0
    if has_complete_info:
        quality_score = 10.0
    else:
        quality_score = 5.0
    
    # Total Score (0-100)
    total_score = rating_score + review_score + youtube_score + blog_score + quality_score
    
    # Popularity Tier
    if total_score >= 80:
        tier = "top_rated"
    elif total_score >= 60:
        tier = "popular"
    elif total_score >= 40:
        tier = "average"
    else:
        tier = "new"
    
    return {
        "popularity_score": round(total_score, 2),
        "popularity_tier": tier,
        "rating_score": round(rating_score, 2),
        "review_score": round(review_score, 2),
        "youtube_score": round(youtube_score, 2),
        "blog_score": round(blog_score, 2),
        "quality_score": round(quality_score, 2)
    }


# API Endpoints
@router.post("")
async def create_collection_result(
    result: CollectionResultCreate,
    db: Session = Depends(get_db)
):
    """수집 결과 추가"""
    try:
        result_id = str(uuid.uuid4())
        
        # Check if request exists
        check_query = text("SELECT id FROM collection_requests WHERE id = :request_id")
        check_result = db.execute(check_query, {"request_id": result.request_id})
        if not check_result.fetchone():
            raise HTTPException(status_code=404, detail="수집 요청을 찾을 수 없습니다")
        
        # Calculate popularity score
        has_complete_info = all([
            result.name,
            result.address,
            result.phone,
            result.latitude,
            result.longitude,
            result.category
        ])
        
        scores = calculate_popularity_score(
            result.rating,
            result.review_count,
            result.youtube_mention_count,
            result.blog_mention_count,
            has_complete_info
        )
        
        # Insert query
        insert_query = text("""
            INSERT INTO collection_results (
                id, request_id, name, category, address, phone, 
                latitude, longitude, region, rating, review_count,
                business_hours, menu_items, price_range,
                popularity_score, popularity_tier,
                rating_score, review_score, youtube_score, blog_score, quality_score,
                youtube_mention_count, blog_mention_count,
                images, thumbnail_url, source, source_url, source_data,
                edit_status, is_validated, created_at, created_by
            ) VALUES (
                :id, :request_id, :name, :category, :address, :phone,
                :latitude, :longitude, :region, :rating, :review_count,
                CAST(:business_hours AS jsonb), CAST(:menu_items AS jsonb), :price_range,
                :popularity_score, :popularity_tier,
                :rating_score, :review_score, :youtube_score, :blog_score, :quality_score,
                :youtube_mention_count, :blog_mention_count,
                CAST(:images AS jsonb), :thumbnail_url, :source, :source_url, CAST(:source_data AS jsonb),
                'pending', FALSE, NOW(), 'system'
            )
            RETURNING id, name, popularity_score, popularity_tier, created_at
        """)
        
        result_data = db.execute(insert_query, {
            "id": result_id,
            "request_id": result.request_id,
            "name": result.name,
            "category": result.category,
            "address": result.address,
            "phone": result.phone,
            "latitude": result.latitude,
            "longitude": result.longitude,
            "region": result.region,
            "rating": result.rating,
            "review_count": result.review_count,
            "business_hours": json.dumps(result.business_hours) if result.business_hours else None,
            "menu_items": json.dumps(result.menu_items) if result.menu_items else None,
            "price_range": result.price_range,
            "popularity_score": scores["popularity_score"],
            "popularity_tier": scores["popularity_tier"],
            "rating_score": scores["rating_score"],
            "review_score": scores["review_score"],
            "youtube_score": scores["youtube_score"],
            "blog_score": scores["blog_score"],
            "quality_score": scores["quality_score"],
            "youtube_mention_count": result.youtube_mention_count,
            "blog_mention_count": result.blog_mention_count,
            "images": json.dumps(result.images) if result.images else None,
            "thumbnail_url": result.thumbnail_url,
            "source": result.source,
            "source_url": result.source_url,
            "source_data": json.dumps(result.source_data) if result.source_data else None
        })
        
        row = result_data.fetchone()
        db.commit()
        
        # Update request results_count
        update_count_query = text("""
            UPDATE collection_requests 
            SET results_count = results_count + 1 
            WHERE id = :request_id
        """)
        db.execute(update_count_query, {"request_id": result.request_id})
        db.commit()
        
        return {
            "success": True,
            "message": "수집 결과가 추가되었습니다",
            "data": {
                "id": row[0],
                "name": row[1],
                "popularity_score": float(row[2]) if row[2] else 0,
                "popularity_tier": row[3],
                "created_at": row[4].isoformat() if row[4] else None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"추가 실패: {str(e)}")


@router.get("")
async def get_collection_results(
    request_id: Optional[str] = None,
    edit_status: Optional[str] = None,
    source: Optional[str] = None,
    min_score: Optional[float] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """수집 결과 목록 조회 (필터링 지원)"""
    try:
        # Build WHERE clause
        where_clauses = []
        params = {"limit": limit, "offset": offset}
        
        if request_id:
            where_clauses.append("collection_request_id = :request_id")
            params["request_id"] = request_id
        
        if source:
            where_clauses.append("source = :source")
            params["source"] = source
        
        where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
        
        # Count query
        count_query = text(f"SELECT COUNT(*) FROM collection_results {where_sql}")
        count_result = db.execute(count_query, params)
        total = count_result.fetchone()[0]
        
        # Data query (간소화된 스키마)
        data_query = text(f"""
            SELECT 
                id, name, category, region, address, phone,
                description, rating, review_count,
                source, collection_request_id,
                created_at, updated_at
            FROM collection_results
            {where_sql}
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :offset
        """)
        
        results = db.execute(data_query, params)
        
        items = []
        for row in results:
            items.append({
                "id": row[0],
                "name": row[1],
                "category": row[2],
                "region": row[3],
                "address": row[4],
                "phone": row[5],
                "description": row[6],
                "rating": float(row[7]) if row[7] else None,
                "review_count": row[8],
                "source": row[9],
                "collection_request_id": row[10],
                "created_at": row[11].isoformat() if row[11] else None,
                "updated_at": row[12].isoformat() if row[12] else None
            })
        
        return {
            "success": True,
            "total": total,
            "limit": limit,
            "offset": offset,
            "data": items
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"조회 실패: {str(e)}")


@router.get("/{result_id}")
async def get_collection_result_detail(
    result_id: str,
    db: Session = Depends(get_db)
):
    """수집 결과 상세 조회 (간소화 버전)"""
    try:
        query = text("""
            SELECT 
                r.id, r.name, r.category, r.region, r.address, r.phone,
                r.description, r.rating, r.review_count,
                r.business_hours, r.menu_items, r.links,
                r.source, r.collection_request_id,
                r.created_at, r.updated_at,
                req.name as request_name
            FROM collection_results r
            LEFT JOIN collection_requests req ON r.collection_request_id = req.id
            WHERE r.id = :result_id
        """)
        
        result = db.execute(query, {"result_id": result_id})
        row = result.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="수집 결과를 찾을 수 없습니다")
        
        return {
            "success": True,
            "data": {
                "id": row[0],
                "name": row[1],
                "category": row[2],
                "region": row[3],
                "address": row[4],
                "phone": row[5],
                "description": row[6],
                "rating": float(row[7]) if row[7] else None,
                "review_count": row[8],
                "business_hours": row[9],
                "menu_items": row[10],
                "links": row[11],
                "source": row[12],
                "collection_request_id": row[13],
                "created_at": row[14].isoformat() if row[14] else None,
                "updated_at": row[15].isoformat() if row[15] else None,
                "request_name": row[16]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"상세 조회 실패: {str(e)}")


@router.put("/{result_id}")
async def update_collection_result(
    result_id: str,
    update_data: CollectionResultUpdate,
    db: Session = Depends(get_db)
):
    """수집 결과 수정"""
    try:
        # Check if exists
        check_query = text("SELECT id FROM collection_results WHERE id = :result_id")
        check_result = db.execute(check_query, {"result_id": result_id})
        if not check_result.fetchone():
            raise HTTPException(status_code=404, detail="수집 결과를 찾을 수 없습니다")
        
        # Build update fields (간소화 버전)
        update_fields = []
        params = {"result_id": result_id}
        
        if update_data.name is not None:
            update_fields.append("name = :name")
            params["name"] = update_data.name
        if update_data.category is not None:
            update_fields.append("category = :category")
            params["category"] = update_data.category
        if update_data.region is not None:
            update_fields.append("region = :region")
            params["region"] = update_data.region
        if update_data.address is not None:
            update_fields.append("address = :address")
            params["address"] = update_data.address
        if update_data.phone is not None:
            update_fields.append("phone = :phone")
            params["phone"] = update_data.phone
        if update_data.description is not None:
            update_fields.append("description = :description")
            params["description"] = update_data.description
        if update_data.rating is not None:
            update_fields.append("rating = :rating")
            params["rating"] = update_data.rating
        if update_data.review_count is not None:
            update_fields.append("review_count = :review_count")
            params["review_count"] = update_data.review_count
        if update_data.business_hours is not None:
            update_fields.append("business_hours = CAST(:business_hours AS jsonb)")
            params["business_hours"] = json.dumps(update_data.business_hours)
        if update_data.menu_items is not None:
            update_fields.append("menu_items = CAST(:menu_items AS jsonb)")
            params["menu_items"] = json.dumps(update_data.menu_items)
        if update_data.links is not None:
            update_fields.append("links = CAST(:links AS jsonb)")
            params["links"] = json.dumps(update_data.links)
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="수정할 필드가 없습니다")
        
        # Add metadata
        update_fields.append("updated_at = NOW()")
        
        update_query = text(f"""
            UPDATE collection_results
            SET {', '.join(update_fields)}
            WHERE id = :result_id
            RETURNING id, name
        """)
        
        result = db.execute(update_query, params)
        row = result.fetchone()
        db.commit()
        
        return {
            "success": True,
            "message": "수집 결과가 수정되었습니다",
            "data": {
                "id": row[0],
                "name": row[1]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"수정 실패: {str(e)}")


@router.delete("/{result_id}")
async def delete_collection_result(
    result_id: str,
    db: Session = Depends(get_db)
):
    """수집 결과 삭제"""
    try:
        # Get collection_request_id before deletion
        get_request_query = text("SELECT collection_request_id FROM collection_results WHERE id = :result_id")
        request_result = db.execute(get_request_query, {"result_id": result_id})
        row = request_result.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="수집 결과를 찾을 수 없습니다")
        
        request_id = row[0]
        
        # Delete
        delete_query = text("DELETE FROM collection_results WHERE id = :result_id")
        db.execute(delete_query, {"result_id": result_id})
        db.commit()
        
        # Update request results_count
        update_count_query = text("""
            UPDATE collection_requests 
            SET results_count = GREATEST(results_count - 1, 0)
            WHERE id = :request_id
        """)
        db.execute(update_count_query, {"request_id": request_id})
        db.commit()
        
        return {
            "success": True,
            "message": "수집 결과가 삭제되었습니다"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"삭제 실패: {str(e)}")


@router.post("/{result_id}/recalculate-score")
async def recalculate_popularity_score(
    result_id: str,
    db: Session = Depends(get_db)
):
    """인기도 점수 재계산"""
    try:
        # Get current data
        get_query = text("""
            SELECT rating, review_count, youtube_mention_count, blog_mention_count,
                   name, address, phone, latitude, longitude, category
            FROM collection_results
            WHERE id = :result_id
        """)
        
        result = db.execute(get_query, {"result_id": result_id})
        row = result.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="수집 결과를 찾을 수 없습니다")
        
        # Calculate new scores
        has_complete_info = all([row[4], row[5], row[6], row[7], row[8], row[9]])
        scores = calculate_popularity_score(
            float(row[0]) if row[0] else None,
            int(row[1]) if row[1] else None,
            int(row[2]) if row[2] else None,
            int(row[3]) if row[3] else None,
            has_complete_info
        )
        
        # Update scores
        update_query = text("""
            UPDATE collection_results
            SET popularity_score = :popularity_score,
                popularity_tier = :popularity_tier,
                rating_score = :rating_score,
                review_score = :review_score,
                youtube_score = :youtube_score,
                blog_score = :blog_score,
                quality_score = :quality_score,
                updated_at = NOW()
            WHERE id = :result_id
            RETURNING id, name, popularity_score, popularity_tier
        """)
        
        update_result = db.execute(update_query, {
            "result_id": result_id,
            **scores
        })
        
        updated_row = update_result.fetchone()
        db.commit()
        
        return {
            "success": True,
            "message": "인기도 점수가 재계산되었습니다",
            "data": {
                "id": updated_row[0],
                "name": updated_row[1],
                "popularity_score": float(updated_row[2]),
                "popularity_tier": updated_row[3],
                **scores
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"재계산 실패: {str(e)}")


@router.get("/stats/summary")
async def get_collection_results_stats(
    db: Session = Depends(get_db)
):
    """수집 결과 통계"""
    try:
        stats_query = text("""
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE edit_status = 'pending') as pending,
                COUNT(*) FILTER (WHERE edit_status = 'edited') as edited,
                COUNT(*) FILTER (WHERE edit_status = 'approved') as approved,
                COUNT(*) FILTER (WHERE edit_status = 'rejected') as rejected,
                COUNT(*) FILTER (WHERE is_validated = TRUE) as validated,
                COUNT(*) FILTER (WHERE is_duplicate = TRUE) as duplicates,
                AVG(popularity_score) as avg_score,
                COUNT(*) FILTER (WHERE popularity_tier = 'top_rated') as top_rated,
                COUNT(*) FILTER (WHERE popularity_tier = 'popular') as popular,
                COUNT(*) FILTER (WHERE popularity_tier = 'average') as average,
                COUNT(*) FILTER (WHERE popularity_tier = 'new') as new_tier
            FROM collection_results
        """)
        
        result = db.execute(stats_query)
        row = result.fetchone()
        
        return {
            "success": True,
            "data": {
                "total": row[0],
                "by_edit_status": {
                    "pending": row[1],
                    "edited": row[2],
                    "approved": row[3],
                    "rejected": row[4]
                },
                "validated": row[5],
                "duplicates": row[6],
                "avg_popularity_score": round(float(row[7]), 2) if row[7] else 0,
                "by_tier": {
                    "top_rated": row[8],
                    "popular": row[9],
                    "average": row[10],
                    "new": row[11]
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"통계 조회 실패: {str(e)}")
