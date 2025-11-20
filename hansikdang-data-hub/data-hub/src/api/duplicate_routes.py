"""
중복 검사 및 품질 관리 API - Stage B
Exact Match + Fuzzy Match 알고리즘 기반 중복 탐지
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
import uuid
import Levenshtein

from src.database.connection import get_db
from src.database.models import (
    ProcessedRestaurant, 
    DuplicateGroup, 
    QualityScore
)


router = APIRouter(prefix="/api/data-management/duplicates", tags=["duplicate-management"])


class DuplicateCheckRequest(BaseModel):
    """중복 검사 요청 (Exact Match)"""
    restaurant_ids: Optional[List[str]] = None  # None이면 전체 검사


class FuzzyCheckRequest(BaseModel):
    """Fuzzy Match 중복 검사 요청"""
    restaurant_ids: Optional[List[str]] = None  # None이면 전체 검사
    threshold: float = 85.0  # 유사도 임계값 (0-100), 기본 85%


class DuplicateGroupResponse(BaseModel):
    """중복 그룹 응답"""
    id: int
    restaurant_ids: List[str]
    match_type: str
    similarity_score: float
    status: str
    created_at: str
    resolved_at: Optional[str] = None
    resolved_by: Optional[str] = None


class MergeRequest(BaseModel):
    """중복 병합 요청"""
    master_id: str  # 유지할 레스토랑 ID
    reason: Optional[str] = "User merged duplicates"


class QualityScoreResponse(BaseModel):
    """품질 점수 응답"""
    restaurant_id: str
    completeness_score: float
    phone_valid: bool
    address_complete: bool
    coordinates_valid: bool
    total_score: float


def calculate_exact_match_score(r1: Dict[str, Any], r2: Dict[str, Any]) -> float:
    """
    Exact Match 알고리즘: 이름, 주소, 전화번호 완전 일치 검사
    
    Returns:
        100.0: 완전 일치
        0.0: 불일치
    """
    # 이름 비교 (대소문자 무시, 공백 제거)
    name1 = str(r1.get('name', '')).strip().lower().replace(' ', '')
    name2 = str(r2.get('name', '')).strip().lower().replace(' ', '')
    
    if not name1 or not name2:
        return 0.0
    
    if name1 != name2:
        return 0.0
    
    # 주소 비교 (대소문자 무시, 공백 제거)
    addr1 = str(r1.get('address', '')).strip().lower().replace(' ', '')
    addr2 = str(r2.get('address', '')).strip().lower().replace(' ', '')
    
    # 전화번호 비교 (숫자만 추출)
    phone1 = ''.join(filter(str.isdigit, str(r1.get('phone', ''))))
    phone2 = ''.join(filter(str.isdigit, str(r2.get('phone', ''))))
    
    # 주소 또는 전화번호 중 하나라도 일치하면 중복으로 판단
    address_match = addr1 == addr2 and len(addr1) > 0
    phone_match = phone1 == phone2 and len(phone1) >= 10
    
    if address_match or phone_match:
        return 100.0
    
    return 0.0


def normalize_korean_text(text: str) -> str:
    """
    한글 텍스트 정규화
    - 공백 제거
    - 소문자 변환
    - 특수문자 제거 (일부)
    """
    if not text:
        return ""
    
    # 공백 제거
    text = text.strip().replace(' ', '')
    
    # 소문자 변환
    text = text.lower()
    
    # 특수문자 제거 (괄호, 점 등)
    text = text.replace('(', '').replace(')', '').replace('.', '').replace(',', '')
    
    return text


def calculate_fuzzy_match_score(r1: Dict[str, Any], r2: Dict[str, Any]) -> float:
    """
    Fuzzy Match 알고리즘: Levenshtein distance 기반 유사도 검사
    
    Returns:
        0.0-100.0: 유사도 점수 (%)
    """
    # 이름 비교
    name1 = normalize_korean_text(str(r1.get('name', '')))
    name2 = normalize_korean_text(str(r2.get('name', '')))
    
    if not name1 or not name2:
        return 0.0
    
    # Levenshtein 거리 기반 유사도 계산
    # ratio() 함수: 0.0 (완전 다름) ~ 1.0 (완전 같음)
    name_similarity = Levenshtein.ratio(name1, name2) * 100
    
    # 주소 비교
    addr1 = normalize_korean_text(str(r1.get('address', '')))
    addr2 = normalize_korean_text(str(r2.get('address', '')))
    
    addr_similarity = 0.0
    if addr1 and addr2:
        addr_similarity = Levenshtein.ratio(addr1, addr2) * 100
    
    # 전화번호 비교 (숫자만 추출)
    phone1 = ''.join(filter(str.isdigit, str(r1.get('phone', ''))))
    phone2 = ''.join(filter(str.isdigit, str(r2.get('phone', ''))))
    
    phone_similarity = 0.0
    if phone1 and phone2 and len(phone1) >= 10 and len(phone2) >= 10:
        phone_similarity = Levenshtein.ratio(phone1, phone2) * 100
    
    # 최종 유사도 계산
    # 가중치: 이름 50%, 주소 30%, 전화번호 20%
    total_similarity = (
        name_similarity * 0.5 +
        addr_similarity * 0.3 +
        phone_similarity * 0.2
    )
    
    return round(total_similarity, 2)


def calculate_quality_score(restaurant: Dict[str, Any]) -> Dict[str, Any]:
    """
    데이터 품질 점수 계산
    
    Returns:
        {
            'completeness_score': float,  # 0-100
            'phone_valid': bool,
            'address_complete': bool,
            'coordinates_valid': bool,
            'total_score': float  # 0-100
        }
    """
    score = {
        'completeness_score': 0.0,
        'phone_valid': False,
        'address_complete': False,
        'coordinates_valid': False,
        'total_score': 0.0
    }
    
    # 필수 필드 체크
    required_fields = ['name', 'address', 'phone']
    filled_required = sum(1 for field in required_fields if restaurant.get(field))
    score['completeness_score'] = (filled_required / len(required_fields)) * 100
    
    # 전화번호 유효성 (10자리 이상 숫자)
    phone = ''.join(filter(str.isdigit, str(restaurant.get('phone', ''))))
    score['phone_valid'] = len(phone) >= 10
    
    # 주소 완성도 (10자 이상)
    address = str(restaurant.get('address', '')).strip()
    score['address_complete'] = len(address) >= 10
    
    # 좌표 유효성
    lat = restaurant.get('latitude')
    lng = restaurant.get('longitude')
    if lat and lng:
        try:
            lat_f = float(lat)
            lng_f = float(lng)
            # 한국 좌표 범위: 위도 33-39, 경도 124-132
            score['coordinates_valid'] = (33 <= lat_f <= 39 and 124 <= lng_f <= 132)
        except:
            score['coordinates_valid'] = False
    
    # 종합 점수 계산
    total = 0
    total += score['completeness_score'] * 0.4  # 40%
    total += 20 if score['phone_valid'] else 0  # 20%
    total += 20 if score['address_complete'] else 0  # 20%
    total += 20 if score['coordinates_valid'] else 0  # 20%
    
    score['total_score'] = min(100, total)
    
    return score


@router.post("/check")
async def check_duplicates(
    request: DuplicateCheckRequest = DuplicateCheckRequest(),
    db: Session = Depends(get_db)
):
    """
    중복 검사 실행 (Exact Match)
    
    - restaurant_ids가 None이면 전체 레스토랑 검사
    - Exact Match: 이름 + (주소 또는 전화번호) 완전 일치
    """
    try:
        # 검사 대상 레스토랑 조회
        query = db.query(ProcessedRestaurant)
        if request.restaurant_ids:
            query = query.filter(ProcessedRestaurant.id.in_(request.restaurant_ids))
        
        restaurants = query.all()
        
        if len(restaurants) < 2:
            return {
                "message": "검사 대상이 부족합니다 (최소 2개 필요)",
                "total_checked": len(restaurants),
                "duplicates_found": 0,
                "groups_created": 0
            }
        
        # 중복 그룹 찾기
        duplicate_groups = []
        checked_ids = set()
        
        for i, r1 in enumerate(restaurants):
            if r1.id in checked_ids:
                continue
            
            r1_data = {
                'name': r1.name,
                'address': r1.address,
                'phone': r1.phone
            }
            
            group_members = [r1.id]
            
            for r2 in restaurants[i+1:]:
                if r2.id in checked_ids:
                    continue
                
                r2_data = {
                    'name': r2.name,
                    'address': r2.address,
                    'phone': r2.phone
                }
                
                similarity = calculate_exact_match_score(r1_data, r2_data)
                
                if similarity == 100.0:
                    group_members.append(r2.id)
                    checked_ids.add(r2.id)
            
            if len(group_members) >= 2:
                duplicate_groups.append({
                    'restaurant_ids': group_members,
                    'similarity_score': 100.0
                })
                checked_ids.add(r1.id)
        
        # DB에 중복 그룹 저장
        groups_created = 0
        for group_data in duplicate_groups:
            # 기존 그룹 확인 (같은 레스토랑 조합)
            existing = db.query(DuplicateGroup).filter(
                DuplicateGroup.restaurant_ids == group_data['restaurant_ids'],
                DuplicateGroup.status == 'pending'
            ).first()
            
            if not existing:
                new_group = DuplicateGroup(
                    restaurant_ids=group_data['restaurant_ids'],
                    match_type='exact',
                    similarity_score=group_data['similarity_score'],
                    status='pending'
                )
                db.add(new_group)
                groups_created += 1
        
        db.commit()
        
        return {
            "message": "중복 검사 완료",
            "total_checked": len(restaurants),
            "duplicates_found": sum(len(g['restaurant_ids']) for g in duplicate_groups),
            "groups_created": groups_created,
            "duplicate_groups": duplicate_groups
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"중복 검사 실패: {str(e)}")


@router.post("/check-fuzzy")
async def check_fuzzy_duplicates(
    request: FuzzyCheckRequest = FuzzyCheckRequest(),
    db: Session = Depends(get_db)
):
    """
    Fuzzy Match 중복 검사 실행
    
    - Levenshtein distance 기반 유사도 계산
    - threshold (기본 85%) 이상이면 중복으로 판단
    - 가중치: 이름 50%, 주소 30%, 전화번호 20%
    """
    try:
        # 검사 대상 레스토랑 조회
        query = db.query(ProcessedRestaurant)
        if request.restaurant_ids:
            query = query.filter(ProcessedRestaurant.id.in_(request.restaurant_ids))
        
        restaurants = query.all()
        
        if len(restaurants) < 2:
            return {
                "message": "검사 대상이 부족합니다 (최소 2개 필요)",
                "total_checked": len(restaurants),
                "duplicates_found": 0,
                "groups_created": 0,
                "threshold": request.threshold
            }
        
        # 중복 그룹 찾기
        duplicate_groups = []
        checked_ids = set()
        
        for i, r1 in enumerate(restaurants):
            if r1.id in checked_ids:
                continue
            
            r1_data = {
                'name': r1.name,
                'address': r1.address,
                'phone': r1.phone
            }
            
            group_members = [r1.id]
            max_similarity = 0.0
            
            for r2 in restaurants[i+1:]:
                if r2.id in checked_ids:
                    continue
                
                r2_data = {
                    'name': r2.name,
                    'address': r2.address,
                    'phone': r2.phone
                }
                
                similarity = calculate_fuzzy_match_score(r1_data, r2_data)
                
                if similarity >= request.threshold:
                    group_members.append(r2.id)
                    checked_ids.add(r2.id)
                    max_similarity = max(max_similarity, similarity)
            
            if len(group_members) >= 2:
                duplicate_groups.append({
                    'restaurant_ids': group_members,
                    'similarity_score': max_similarity
                })
                checked_ids.add(r1.id)
        
        # DB에 중복 그룹 저장
        groups_created = 0
        for group_data in duplicate_groups:
            # 기존 그룹 확인 (같은 레스토랑 조합)
            existing = db.query(DuplicateGroup).filter(
                DuplicateGroup.restaurant_ids == group_data['restaurant_ids'],
                DuplicateGroup.status == 'pending'
            ).first()
            
            if not existing:
                new_group = DuplicateGroup(
                    restaurant_ids=group_data['restaurant_ids'],
                    match_type='fuzzy',
                    similarity_score=group_data['similarity_score'],
                    status='pending'
                )
                db.add(new_group)
                groups_created += 1
        
        db.commit()
        
        return {
            "message": "Fuzzy Match 중복 검사 완료",
            "total_checked": len(restaurants),
            "duplicates_found": sum(len(g['restaurant_ids']) for g in duplicate_groups),
            "groups_created": groups_created,
            "threshold": request.threshold,
            "duplicate_groups": duplicate_groups
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fuzzy Match 검사 실패: {str(e)}")


@router.get("")
async def get_duplicate_groups(
    status: Optional[str] = None,
    match_type: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """중복 그룹 목록 조회"""
    try:
        query = db.query(DuplicateGroup)
        
        if status:
            query = query.filter(DuplicateGroup.status == status)
        
        if match_type:
            query = query.filter(DuplicateGroup.match_type == match_type)
        
        groups = query.order_by(desc(DuplicateGroup.created_at)).limit(limit).all()
        
        return [
            {
                "id": g.id,
                "restaurant_ids": g.restaurant_ids,
                "match_type": g.match_type,
                "similarity_score": g.similarity_score,
                "status": g.status,
                "created_at": g.created_at.isoformat() if g.created_at else None,
                "resolved_at": g.resolved_at.isoformat() if g.resolved_at else None,
                "resolved_by": g.resolved_by
            }
            for g in groups
        ]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"목록 조회 실패: {str(e)}")


@router.get("/{group_id}")
async def get_duplicate_group(group_id: int, db: Session = Depends(get_db)):
    """중복 그룹 상세 조회"""
    try:
        group = db.query(DuplicateGroup).filter(DuplicateGroup.id == group_id).first()
        
        if not group:
            raise HTTPException(status_code=404, detail="중복 그룹을 찾을 수 없습니다")
        
        # 레스토랑 정보 조회
        restaurants = db.query(ProcessedRestaurant).filter(
            ProcessedRestaurant.id.in_(group.restaurant_ids)
        ).all()
        
        return {
            "id": group.id,
            "restaurant_ids": group.restaurant_ids,
            "match_type": group.match_type,
            "similarity_score": group.similarity_score,
            "status": group.status,
            "created_at": group.created_at.isoformat() if group.created_at else None,
            "resolved_at": group.resolved_at.isoformat() if group.resolved_at else None,
            "resolved_by": group.resolved_by,
            "restaurants": [
                {
                    "id": r.id,
                    "name": r.name,
                    "address": r.address,
                    "phone": r.phone,
                    "source": r.source
                }
                for r in restaurants
            ]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"상세 조회 실패: {str(e)}")


@router.post("/{group_id}/merge")
async def merge_duplicates(
    group_id: int,
    request: MergeRequest,
    db: Session = Depends(get_db)
):
    """중복 병합 (master 레스토랑만 유지)"""
    try:
        group = db.query(DuplicateGroup).filter(DuplicateGroup.id == group_id).first()
        
        if not group:
            raise HTTPException(status_code=404, detail="중복 그룹을 찾을 수 없습니다")
        
        if group.status != 'pending':
            raise HTTPException(status_code=400, detail="이미 처리된 그룹입니다")
        
        if request.master_id not in group.restaurant_ids:
            raise HTTPException(status_code=400, detail="master_id가 그룹에 없습니다")
        
        # 중복 그룹 상태 업데이트
        group.status = 'merged'
        group.resolved_at = datetime.utcnow()
        group.resolved_by = request.master_id
        
        # TODO: 실제 병합 로직 (Stage B에서 구현)
        # - 중복 레스토랑 데이터 삭제 또는 비활성화
        # - master에 데이터 병합
        
        db.commit()
        
        return {
            "message": "중복이 병합되었습니다",
            "group_id": group.id,
            "master_id": request.master_id,
            "merged_count": len(group.restaurant_ids) - 1
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"병합 실패: {str(e)}")


@router.post("/{group_id}/separate")
async def separate_duplicates(
    group_id: int,
    db: Session = Depends(get_db)
):
    """중복이 아님 (별개 레스토랑으로 표시)"""
    try:
        group = db.query(DuplicateGroup).filter(DuplicateGroup.id == group_id).first()
        
        if not group:
            raise HTTPException(status_code=404, detail="중복 그룹을 찾을 수 없습니다")
        
        if group.status != 'pending':
            raise HTTPException(status_code=400, detail="이미 처리된 그룹입니다")
        
        # 중복 그룹 상태 업데이트
        group.status = 'separated'
        group.resolved_at = datetime.utcnow()
        group.resolved_by = 'user'
        
        db.commit()
        
        return {
            "message": "별개 레스토랑으로 처리되었습니다",
            "group_id": group.id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"처리 실패: {str(e)}")


@router.post("/{group_id}/ignore")
async def ignore_duplicate(
    group_id: int,
    db: Session = Depends(get_db)
):
    """중복 그룹 무시"""
    try:
        group = db.query(DuplicateGroup).filter(DuplicateGroup.id == group_id).first()
        
        if not group:
            raise HTTPException(status_code=404, detail="중복 그룹을 찾을 수 없습니다")
        
        group.status = 'ignored'
        group.resolved_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "message": "중복 그룹이 무시되었습니다",
            "group_id": group.id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"처리 실패: {str(e)}")


class QualityCalculateRequest(BaseModel):
    """품질 점수 계산 요청"""
    restaurant_ids: Optional[List[str]] = None


@router.post("/quality/calculate")
async def calculate_quality_scores(
    request: QualityCalculateRequest = QualityCalculateRequest(),
    db: Session = Depends(get_db)
):
    """품질 점수 계산 및 저장"""
    try:
        # 대상 레스토랑 조회
        query = db.query(ProcessedRestaurant)
        if request.restaurant_ids:
            query = query.filter(ProcessedRestaurant.id.in_(request.restaurant_ids))
        
        restaurants = query.all()
        
        if not restaurants:
            return {
                "message": "계산 대상이 없습니다",
                "total_calculated": 0
            }
        
        calculated = 0
        for restaurant in restaurants:
            r_data = {
                'name': restaurant.name,
                'address': restaurant.address,
                'phone': restaurant.phone,
                'latitude': restaurant.latitude,
                'longitude': restaurant.longitude
            }
            
            score_data = calculate_quality_score(r_data)
            
            # 기존 점수 확인
            existing = db.query(QualityScore).filter(
                QualityScore.restaurant_id == restaurant.id
            ).first()
            
            if existing:
                # 업데이트
                existing.completeness_score = score_data['completeness_score']
                existing.phone_valid = score_data['phone_valid']
                existing.address_complete = score_data['address_complete']
                existing.coordinates_valid = score_data['coordinates_valid']
                existing.total_score = score_data['total_score']
            else:
                # 신규 생성
                new_score = QualityScore(
                    restaurant_id=restaurant.id,
                    completeness_score=score_data['completeness_score'],
                    phone_valid=score_data['phone_valid'],
                    address_complete=score_data['address_complete'],
                    coordinates_valid=score_data['coordinates_valid'],
                    total_score=score_data['total_score']
                )
                db.add(new_score)
            
            calculated += 1
        
        db.commit()
        
        return {
            "message": "품질 점수 계산 완료",
            "total_calculated": calculated
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"계산 실패: {str(e)}")


@router.get("/quality/scores")
async def get_quality_scores(
    min_score: Optional[float] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """품질 점수 목록 조회"""
    try:
        query = db.query(QualityScore)
        
        if min_score is not None:
            query = query.filter(QualityScore.total_score >= min_score)
        
        scores = query.order_by(desc(QualityScore.total_score)).limit(limit).all()
        
        return [
            {
                "id": s.id,
                "restaurant_id": s.restaurant_id,
                "completeness_score": s.completeness_score,
                "phone_valid": s.phone_valid,
                "address_complete": s.address_complete,
                "coordinates_valid": s.coordinates_valid,
                "total_score": s.total_score,
                "created_at": s.created_at.isoformat() if s.created_at else None
            }
            for s in scores
        ]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"조회 실패: {str(e)}")
