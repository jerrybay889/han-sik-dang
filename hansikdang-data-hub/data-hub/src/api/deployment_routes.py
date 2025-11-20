"""
Stage C-5: 선택적 배포 & 동기화 시스템
- 승인된 레스토랑만 한식당 플랫폼에 배포
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Any, Optional, List
import json
from datetime import datetime

router = APIRouter(prefix="/api/deployment", tags=["Deployment"])


class DeploymentRequest(BaseModel):
    restaurant_ids: List[str]
    deployment_type: str = "immediate"
    notes: Optional[str] = None


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


@router.get("/candidates")
async def get_deployment_candidates(
    min_score: Optional[float] = None,
    status: Optional[str] = "approved",
    limit: int = 100,
    db: Any = Depends(get_db)
):
    """
    C-5-1: 배포 가능한 레스토랑 목록 조회
    """
    from sqlalchemy import text
    
    try:
        conditions = ["edit_status = :status"]
        params = {"status": status, "limit": limit}
        
        if min_score:
            conditions.append("popularity_score >= :min_score")
            params["min_score"] = min_score
        
        where_clause = " AND ".join(conditions)
        
        query = text(f"""
        SELECT 
            id, name, category, address, rating, review_count,
            popularity_score, quality_score, source, created_at
        FROM collection_results
        WHERE {where_clause}
        ORDER BY popularity_score DESC
        LIMIT :limit
        """)
        
        result = db.execute(query, params)
        rows = result.fetchall()
        
        data = []
        for row in rows:
            data.append({
                "id": row[0],
                "name": row[1],
                "category": row[2],
                "address": row[3],
                "rating": float(row[4]) if row[4] else None,
                "review_count": row[5],
                "popularity_score": float(row[6]) if row[6] else None,
                "quality_score": float(row[7]) if row[7] else None,
                "source": row[8],
                "created_at": row[9].isoformat() if row[9] else None
            })
        
        return {
            "success": True,
            "data": data,
            "total": len(data)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"조회 실패: {str(e)}")
    finally:
        db.close()


@router.post("/execute")
async def execute_deployment(request: DeploymentRequest, db: Any = Depends(get_db)):
    """
    C-5-2: 선택한 레스토랑을 한식당 플랫폼에 배포
    """
    from sqlalchemy import text
    
    try:
        deployed_count = 0
        failed_count = 0
        
        for restaurant_id in request.restaurant_ids:
            try:
                update_query = text("""
                UPDATE collection_results
                SET edit_status = 'deployed',
                    updated_at = :updated_at
                WHERE id = :id AND edit_status = 'approved'
                RETURNING id
                """)
                
                result = db.execute(update_query, {
                    "id": restaurant_id,
                    "updated_at": datetime.utcnow()
                })
                
                row = result.fetchone()
                if row:
                    deployed_count += 1
                else:
                    failed_count += 1
            
            except Exception as e:
                failed_count += 1
                continue
        
        db.commit()
        
        return {
            "success": True,
            "data": {
                "total_selected": len(request.restaurant_ids),
                "deployed": deployed_count,
                "failed": failed_count,
                "deployment_type": request.deployment_type,
                "timestamp": datetime.utcnow().isoformat()
            },
            "message": f"{deployed_count}개 레스토랑이 성공적으로 배포되었습니다"
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"배포 실패: {str(e)}")
    finally:
        db.close()


@router.get("/history")
async def get_deployment_history(
    days: int = 7,
    limit: int = 50,
    db: Any = Depends(get_db)
):
    """
    C-5-3: 배포 이력 조회
    """
    from sqlalchemy import text
    
    try:
        query = text("""
        SELECT 
            id, name, category, popularity_score, 
            edit_status, updated_at
        FROM collection_results
        WHERE edit_status = 'deployed'
            AND updated_at >= NOW() - INTERVAL ':days days'
        ORDER BY updated_at DESC
        LIMIT :limit
        """)
        
        result = db.execute(query, {"days": days, "limit": limit})
        rows = result.fetchall()
        
        data = []
        for row in rows:
            data.append({
                "id": row[0],
                "name": row[1],
                "category": row[2],
                "popularity_score": float(row[3]) if row[3] else None,
                "status": row[4],
                "deployed_at": row[5].isoformat() if row[5] else None
            })
        
        return {
            "success": True,
            "data": data,
            "total": len(data)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"조회 실패: {str(e)}")
    finally:
        db.close()


@router.get("/stats")
async def get_deployment_stats(db: Any = Depends(get_db)):
    """
    배포 통계
    """
    from sqlalchemy import text
    
    try:
        stats_query = text("""
        SELECT 
            COUNT(*) FILTER (WHERE edit_status = 'approved') as ready_to_deploy,
            COUNT(*) FILTER (WHERE edit_status = 'deployed') as deployed,
            COUNT(*) FILTER (WHERE edit_status = 'pending') as pending,
            AVG(popularity_score) FILTER (WHERE edit_status = 'deployed') as avg_deployed_score
        FROM collection_results
        """)
        
        result = db.execute(stats_query)
        row = result.fetchone()
        
        return {
            "success": True,
            "data": {
                "ready_to_deploy": row[0] or 0,
                "deployed": row[1] or 0,
                "pending": row[2] or 0,
                "avg_deployed_score": float(row[3]) if row[3] else 0.0
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"통계 조회 실패: {str(e)}")
    finally:
        db.close()
