"""
Collection Request Routes - Stage C-1
온디맨드 수집 요청 관리 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid
import json

from src.database.connection import get_db

router = APIRouter(prefix="/api/data-management/collection-requests", tags=["collection-requests"])


class CollectionRequestCreate(BaseModel):
    """수집 요청 생성 스키마"""
    name: str
    description: Optional[str] = None
    regions: List[str] = []
    keywords: List[str] = []
    reference_urls: List[str] = []
    crawl_methods: List[str] = ["google", "naver"]
    
    
class CollectionRequestUpdate(BaseModel):
    """수집 요청 수정 스키마"""
    name: Optional[str] = None
    description: Optional[str] = None
    regions: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    reference_urls: Optional[List[str]] = None
    crawl_methods: Optional[List[str]] = None


def calculate_estimated_cost(regions: List[str], keywords: List[str], crawl_methods: List[str]) -> float:
    """예상 비용 계산
    
    Google: $15/키워드/지역
    Naver: $10/키워드/지역
    """
    cost = 0.0
    region_count = len(regions) if regions else 1
    keyword_count = len(keywords) if keywords else 1
    
    if "google" in crawl_methods:
        cost += 15.0 * keyword_count * region_count
    if "naver" in crawl_methods:
        cost += 10.0 * keyword_count * region_count
        
    return round(cost, 2)


@router.post("")
async def create_collection_request(
    request: CollectionRequestCreate,
    db: Session = Depends(get_db)
):
    """새 수집 요청 생성"""
    try:
        request_id = str(uuid.uuid4())
        estimated_cost = calculate_estimated_cost(
            request.regions, 
            request.keywords, 
            request.crawl_methods
        )
        
        query = text("""
            INSERT INTO collection_requests 
            (id, name, description, regions, keywords, reference_urls, crawl_methods, estimated_cost, status, created_by, created_at)
            VALUES 
            (:id, :name, :description, CAST(:regions AS jsonb), CAST(:keywords AS jsonb), CAST(:reference_urls AS jsonb), CAST(:crawl_methods AS jsonb), :estimated_cost, 'pending', 'admin', NOW())
            RETURNING id, name, description, estimated_cost, status, created_at
        """)
        
        result = db.execute(query, {
            "id": request_id,
            "name": request.name,
            "description": request.description,
            "regions": json.dumps(request.regions),
            "keywords": json.dumps(request.keywords),
            "reference_urls": json.dumps(request.reference_urls),
            "crawl_methods": json.dumps(request.crawl_methods),
            "estimated_cost": estimated_cost
        })
        
        row = result.fetchone()
        db.commit()
        
        return {
            "success": True,
            "message": "수집 요청이 생성되었습니다",
            "data": {
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "estimated_cost": row[3],
                "status": row[4],
                "created_at": row[5].isoformat() if row[5] else None
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"요청 생성 실패: {str(e)}")


@router.get("")
async def get_collection_requests(
    status: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """수집 요청 목록 조회"""
    try:
        if status:
            query = text("""
                SELECT id, name, description, regions, keywords, reference_urls, crawl_methods, 
                       estimated_cost, status, created_by, created_at, started_at, completed_at, 
                       actual_cost, results_count
                FROM collection_requests
                WHERE status = :status
                ORDER BY created_at DESC
                LIMIT :limit
            """)
            result = db.execute(query, {"status": status, "limit": limit})
        else:
            query = text("""
                SELECT id, name, description, regions, keywords, reference_urls, crawl_methods, 
                       estimated_cost, status, created_by, created_at, started_at, completed_at, 
                       actual_cost, results_count
                FROM collection_requests
                ORDER BY created_at DESC
                LIMIT :limit
            """)
            result = db.execute(query, {"limit": limit})
        
        rows = result.fetchall()
        
        requests = []
        for row in rows:
            requests.append({
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "regions": row[3],
                "keywords": row[4],
                "reference_urls": row[5],
                "crawl_methods": row[6],
                "estimated_cost": row[7],
                "status": row[8],
                "created_by": row[9],
                "created_at": row[10].isoformat() if row[10] else None,
                "started_at": row[11].isoformat() if row[11] else None,
                "completed_at": row[12].isoformat() if row[12] else None,
                "actual_cost": row[13],
                "results_count": row[14]
            })
        
        return {
            "success": True,
            "total": len(requests),
            "data": requests
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"목록 조회 실패: {str(e)}")


@router.get("/{request_id}")
async def get_collection_request(
    request_id: str,
    db: Session = Depends(get_db)
):
    """수집 요청 상세 조회"""
    try:
        query = text("""
            SELECT id, name, description, regions, keywords, reference_urls, crawl_methods, 
                   estimated_cost, status, created_by, created_at, started_at, completed_at, 
                   actual_cost, results_count
            FROM collection_requests
            WHERE id = :request_id
        """)
        
        result = db.execute(query, {"request_id": request_id})
        row = result.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="수집 요청을 찾을 수 없습니다")
        
        return {
            "success": True,
            "data": {
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "regions": row[3],
                "keywords": row[4],
                "reference_urls": row[5],
                "crawl_methods": row[6],
                "estimated_cost": row[7],
                "status": row[8],
                "created_by": row[9],
                "created_at": row[10].isoformat() if row[10] else None,
                "started_at": row[11].isoformat() if row[11] else None,
                "completed_at": row[12].isoformat() if row[12] else None,
                "actual_cost": row[13],
                "results_count": row[14]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"상세 조회 실패: {str(e)}")


@router.put("/{request_id}")
async def update_collection_request(
    request_id: str,
    request: CollectionRequestUpdate,
    db: Session = Depends(get_db)
):
    """수집 요청 수정 (pending 상태만 가능)"""
    try:
        check_query = text("""
            SELECT status FROM collection_requests WHERE id = :request_id
        """)
        result = db.execute(check_query, {"request_id": request_id})
        row = result.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="수집 요청을 찾을 수 없습니다")
        
        if row[0] != 'pending':
            raise HTTPException(status_code=400, detail="대기 중인 요청만 수정할 수 있습니다")
        
        update_fields = []
        params = {"request_id": request_id}
        
        if request.name is not None:
            update_fields.append("name = :name")
            params["name"] = request.name
        if request.description is not None:
            update_fields.append("description = :description")
            params["description"] = request.description
        if request.regions is not None:
            update_fields.append("regions = CAST(:regions AS jsonb)")
            params["regions"] = json.dumps(request.regions)
        if request.keywords is not None:
            update_fields.append("keywords = CAST(:keywords AS jsonb)")
            params["keywords"] = json.dumps(request.keywords)
        if request.reference_urls is not None:
            update_fields.append("reference_urls = CAST(:reference_urls AS jsonb)")
            params["reference_urls"] = json.dumps(request.reference_urls)
        if request.crawl_methods is not None:
            update_fields.append("crawl_methods = CAST(:crawl_methods AS jsonb)")
            params["crawl_methods"] = json.dumps(request.crawl_methods)
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="수정할 필드가 없습니다")
        
        update_query = text(f"""
            UPDATE collection_requests
            SET {', '.join(update_fields)}
            WHERE id = :request_id
            RETURNING id, name, status
        """)
        
        result = db.execute(update_query, params)
        row = result.fetchone()
        db.commit()
        
        return {
            "success": True,
            "message": "수집 요청이 수정되었습니다",
            "data": {
                "id": row[0],
                "name": row[1],
                "status": row[2]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"수정 실패: {str(e)}")


@router.delete("/{request_id}")
async def delete_collection_request(
    request_id: str,
    db: Session = Depends(get_db)
):
    """수집 요청 삭제"""
    try:
        check_query = text("""
            SELECT status FROM collection_requests WHERE id = :request_id
        """)
        result = db.execute(check_query, {"request_id": request_id})
        row = result.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="수집 요청을 찾을 수 없습니다")
        
        if row[0] == 'running':
            raise HTTPException(status_code=400, detail="실행 중인 요청은 삭제할 수 없습니다")
        
        delete_query = text("""
            DELETE FROM collection_requests WHERE id = :request_id
        """)
        
        db.execute(delete_query, {"request_id": request_id})
        db.commit()
        
        return {
            "success": True,
            "message": "수집 요청이 삭제되었습니다"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"삭제 실패: {str(e)}")


@router.post("/{request_id}/start")
async def start_collection_request(
    request_id: str,
    db: Session = Depends(get_db)
):
    """수집 요청 즉시 실행"""
    try:
        check_query = text("""
            SELECT status, name, keywords, regions, crawl_methods 
            FROM collection_requests 
            WHERE id = :request_id
        """)
        result = db.execute(check_query, {"request_id": request_id})
        row = result.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="수집 요청을 찾을 수 없습니다")
        
        if row[0] == 'running':
            raise HTTPException(status_code=400, detail="이미 실행 중입니다")
        
        update_query = text("""
            UPDATE collection_requests
            SET status = 'running', started_at = NOW()
            WHERE id = :request_id
            RETURNING id, name, status, started_at
        """)
        
        result = db.execute(update_query, {"request_id": request_id})
        row = result.fetchone()
        db.commit()
        
        return {
            "success": True,
            "message": "수집이 시작되었습니다",
            "data": {
                "id": row[0],
                "name": row[1],
                "status": row[2],
                "started_at": row[3].isoformat() if row[3] else None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"실행 실패: {str(e)}")


@router.post("/{request_id}/cancel")
async def cancel_collection_request(
    request_id: str,
    db: Session = Depends(get_db)
):
    """수집 요청 취소"""
    try:
        check_query = text("""
            SELECT status FROM collection_requests WHERE id = :request_id
        """)
        result = db.execute(check_query, {"request_id": request_id})
        row = result.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="수집 요청을 찾을 수 없습니다")
        
        if row[0] != 'running':
            raise HTTPException(status_code=400, detail="실행 중인 요청만 취소할 수 있습니다")
        
        update_query = text("""
            UPDATE collection_requests
            SET status = 'cancelled', completed_at = NOW()
            WHERE id = :request_id
            RETURNING id, name, status
        """)
        
        result = db.execute(update_query, {"request_id": request_id})
        row = result.fetchone()
        db.commit()
        
        return {
            "success": True,
            "message": "수집이 취소되었습니다",
            "data": {
                "id": row[0],
                "name": row[1],
                "status": row[2]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"취소 실패: {str(e)}")
