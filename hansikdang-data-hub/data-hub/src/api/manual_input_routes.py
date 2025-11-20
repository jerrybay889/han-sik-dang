from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
import re
import os
import csv
import io
import json
from datetime import datetime

from src.database.connection import get_db

router = APIRouter(prefix="/api/data-management/manual-input", tags=["Manual Input"])


class URLParseRequest(BaseModel):
    url: str
    request_id: Optional[int] = None


class URLParseResponse(BaseModel):
    success: bool
    source: str
    extracted_data: Dict[str, Any]
    preview: Dict[str, Any]


class DirectInputRequest(BaseModel):
    name: str
    category: Optional[str] = None
    region: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    business_hours: Optional[Dict[str, Any]] = None
    menu_items: Optional[List[Dict[str, Any]]] = None
    links: Optional[Dict[str, str]] = None
    facilities: Optional[Dict[str, Any]] = None
    additional_info: Optional[Dict[str, str]] = None
    collection_request_id: Optional[str] = None
    source: str = "manual"


@router.post("/parse-url", response_model=URLParseResponse)
async def parse_url(request: URLParseRequest):
    """
    C-3-1: URL 파싱 - 네이버/구글/카카오 URL에서 레스토랑 정보 추출
    """
    url = request.url.strip()
    
    try:
        if "naver.com" in url or "map.naver.com" in url:
            source = "naver"
            extracted = extract_naver_info(url)
        elif "google.com/maps" in url or "goo.gl/maps" in url:
            source = "google"
            extracted = extract_google_info(url)
        elif "kakao.com" in url or "map.kakao.com" in url:
            source = "kakao"
            extracted = extract_kakao_info(url)
        else:
            raise HTTPException(
                status_code=400,
                detail="지원하지 않는 URL입니다. 네이버/구글/카카오 URL만 지원합니다."
            )
        
        preview = {
            "name": extracted.get("name", "자동 추출 대기"),
            "address": extracted.get("address", "URL에서 추출 중..."),
            "source": source,
            "place_id": extracted.get("place_id"),
            "url": url
        }
        
        return URLParseResponse(
            success=True,
            source=source,
            extracted_data=extracted,
            preview=preview
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"URL 파싱 실패: {str(e)}")


def extract_naver_info(url: str) -> Dict[str, Any]:
    """네이버 플레이스 URL에서 정보 추출"""
    place_id = None
    
    id_match = re.search(r'/place/(\d+)', url)
    if id_match:
        place_id = id_match.group(1)
    
    return {
        "place_id": place_id,
        "url": url,
        "name": f"네이버 플레이스 #{place_id}" if place_id else "추출 필요",
        "address": "크롤링으로 추출 예정",
        "extraction_method": "naver_api"
    }


def extract_google_info(url: str) -> Dict[str, Any]:
    """구글 맵스 URL에서 정보 추출"""
    place_id = None
    
    coords_match = re.search(r'@([\d\.-]+),([\d\.-]+)', url)
    name_match = re.search(r'/place/([^/]+)', url)
    
    if coords_match:
        lat, lng = coords_match.groups()
    else:
        lat, lng = None, None
    
    name = name_match.group(1).replace('+', ' ') if name_match else "추출 필요"
    
    return {
        "place_id": place_id,
        "url": url,
        "name": name,
        "latitude": float(lat) if lat else None,
        "longitude": float(lng) if lng else None,
        "address": "크롤링으로 추출 예정",
        "extraction_method": "google_places_api"
    }


def extract_kakao_info(url: str) -> Dict[str, Any]:
    """카카오맵 URL에서 정보 추출"""
    place_id = None
    
    id_match = re.search(r'/(\d+)', url)
    if id_match:
        place_id = id_match.group(1)
    
    return {
        "place_id": place_id,
        "url": url,
        "name": f"카카오맵 #{place_id}" if place_id else "추출 필요",
        "address": "크롤링으로 추출 예정",
        "extraction_method": "kakao_api"
    }


@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """
    C-3-2: CSV 업로드 - 엑셀 파일에서 레스토랑 데이터 일괄 가져오기
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="CSV 파일만 업로드 가능합니다.")
    
    try:
        contents = await file.read()
        decoded = contents.decode('utf-8-sig')
        
        csv_reader = csv.DictReader(io.StringIO(decoded))
        
        rows = []
        required_fields = ['name']
        
        for idx, row in enumerate(csv_reader):
            if idx == 0:
                headers = list(row.keys())
                if not any(field in headers for field in required_fields):
                    raise HTTPException(
                        status_code=400,
                        detail=f"필수 컬럼이 없습니다. 최소한 '{required_fields[0]}' 컬럼이 필요합니다."
                    )
            
            if row.get('name') and row['name'].strip():
                parsed_row = {
                    'name': row.get('name', '').strip(),
                    'category': row.get('category', '').strip() or None,
                    'address': row.get('address', '').strip() or None,
                    'phone': row.get('phone', '').strip() or None,
                    'rating': float(row['rating']) if row.get('rating') and row['rating'].strip() else None,
                    'review_count': int(row['review_count']) if row.get('review_count') and row['review_count'].strip() else None,
                    'description': row.get('description', '').strip() or None,
                    'hours': row.get('hours', '').strip() or None,
                    'menu': row.get('menu', '').strip() or None,
                }
                
                if row.get('latitude'):
                    try:
                        parsed_row['latitude'] = float(row['latitude'])
                    except ValueError:
                        pass
                
                if row.get('longitude'):
                    try:
                        parsed_row['longitude'] = float(row['longitude'])
                    except ValueError:
                        pass
                
                rows.append(parsed_row)
        
        return {
            "success": True,
            "total_rows": len(rows),
            "data": rows,
            "message": f"{len(rows)}개의 레스토랑 데이터를 성공적으로 파싱했습니다."
        }
    
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="파일 인코딩 오류입니다. UTF-8 또는 UTF-8-BOM 인코딩을 사용하세요."
        )
    except csv.Error as e:
        raise HTTPException(status_code=400, detail=f"CSV 파싱 오류: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 처리 실패: {str(e)}")


@router.post("/direct-input")
async def direct_input(request: DirectInputRequest, db: Any = Depends(get_db)):
    """
    C-3-3: 직접 입력 - 관리자가 수동으로 레스토랑 데이터 등록
    """
    import uuid
    from sqlalchemy import text
    from src.database.connection import get_db
    
    try:
        if not request.request_id:
            create_request_query = text("""
            INSERT INTO collection_requests (
                name, description, status, created_by
            ) VALUES (
                :name, :description, :status, :created_by
            ) RETURNING id
            """)
            
            request_result = db.execute(create_request_query, {
                "name": f"수동 입력: {request.name}",
                "description": f"{request.source} 소스를 통한 수동 데이터 입력",
                "status": "completed",
                "created_by": "system"
            })
            
            request_row = request_result.fetchone()
            request_id = request_row[0]
        else:
            request_id = request.request_id
        
        insert_query = text("""
        INSERT INTO collection_results (
            name, category, region, address, phone,
            description, rating, review_count,
            business_hours, menu_items, links,
            source, collection_request_id,
            created_at, updated_at
        ) VALUES (
            :name, :category, :region, :address, :phone,
            :description, :rating, :review_count,
            :business_hours, :menu_items, :links,
            :source, :collection_request_id,
            NOW(), NOW()
        ) RETURNING id, created_at
        """)
        
        # links 통합: additional_info를 links로 변환
        links = request.links or {}
        if request.additional_info:
            links.update(request.additional_info)
        
        result = db.execute(insert_query, {
            "name": request.name,
            "category": request.category,
            "region": request.region,
            "address": request.address,
            "phone": request.phone,
            "description": request.description,
            "rating": request.rating,
            "review_count": request.review_count,
            "business_hours": json.dumps(request.business_hours) if request.business_hours else None,
            "menu_items": json.dumps(request.menu_items) if request.menu_items else None,
            "links": json.dumps(links),
            "source": request.source,
            "collection_request_id": request_id
        })
        
        row = result.fetchone()
        db.commit()
        
        return {
            "success": True,
            "data": {
                "id": row[0],
                "name": request.name,
                "source": request.source,
                "request_id": request_id,
                "created_at": row[1].isoformat() if row[1] else None,
                "popularity_score": initial_score,
                "popularity_tier": initial_tier
            },
            "message": "레스토랑 데이터가 성공적으로 등록되었습니다."
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"데이터 등록 실패: {str(e)}")
    finally:
        db.close()


@router.post("/batch-create-from-csv")
async def batch_create_from_csv(data: List[Dict[str, Any]], db: Any = Depends(get_db)):
    """
    C-3-2 Helper: CSV 데이터를 DB에 일괄 등록
    """
    from sqlalchemy import text
    
    try:
        insert_query = text("""
        INSERT INTO collection_results (
            name, category, address, phone, latitude, longitude,
            rating, review_count, price_range,
            source, edit_status, popularity_score, popularity_tier, quality_score
        ) VALUES (
            :name, :category, :address, :phone, :latitude, :longitude,
            :rating, :review_count, :price_range,
            :source, :edit_status, :popularity_score, :popularity_tier, :quality_score
        ) RETURNING id
        """)
        
        created_ids = []
        
        for item in data:
            result = db.execute(insert_query, {
                "name": item.get('name'),
                "category": item.get('category'),
                "address": item.get('address'),
                "phone": item.get('phone'),
                "latitude": item.get('latitude'),
                "longitude": item.get('longitude'),
                "rating": item.get('rating'),
                "review_count": item.get('review_count'),
                "price_range": item.get('price_range'),
                "source": 'csv_upload',
                "edit_status": 'pending',
                "popularity_score": 40.0,
                "popularity_tier": 'new',
                "quality_score": 50.0
            })
            
            row = result.fetchone()
            created_ids.append(row[0])
        
        db.commit()
        
        return {
            "success": True,
            "created_count": len(created_ids),
            "created_ids": created_ids,
            "message": f"{len(created_ids)}개의 레스토랑이 성공적으로 등록되었습니다."
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"일괄 등록 실패: {str(e)}")
    finally:
        db.close()


@router.get("/csv-template")
async def get_csv_template():
    """CSV 업로드용 템플릿 다운로드"""
    template_data = [
        {
            "name": "예시 레스토랑",
            "category": "한식",
            "address": "서울시 강남구 테헤란로 123",
            "phone": "02-1234-5678",
            "latitude": "37.5665",
            "longitude": "126.9780",
            "rating": "4.5",
            "review_count": "150",
            "description": "맛있는 한식당",
            "hours": "10:00-22:00",
            "menu": "김치찌개 9000원, 된장찌개 8000원"
        }
    ]
    
    return {
        "success": True,
        "template": template_data,
        "headers": list(template_data[0].keys()),
        "message": "CSV 템플릿입니다. 첫 번째 행은 예시이므로 삭제 후 사용하세요."
    }
