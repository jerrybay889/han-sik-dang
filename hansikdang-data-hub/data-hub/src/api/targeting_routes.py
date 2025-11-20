"""
스마트 타겟팅 API 엔드포인트
Smart Targeting System API Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from loguru import logger
from sqlalchemy import desc

from ..targeting.trends_analyzer import TrendsAnalyzer
from ..targeting.query_generator import QueryGenerator
from ..targeting.popularity_scorer import PopularityScorer
from ..database.connection import db_session
from ..database.models import ScrapingTarget

router = APIRouter(prefix="/api/targeting", tags=["targeting"])

# 전역 인스턴스
trends_analyzer = TrendsAnalyzer()
query_generator = QueryGenerator()
popularity_scorer = PopularityScorer()


@router.get("/popularity")
async def get_regional_popularity(days: int = 7):
    """
    지역별 외국인 인기도 점수 조회
    
    Args:
        days: 분석 기간 (일 단위, 기본: 7일)
        
    Returns:
        {지역명: 점수(0-100)}
    """
    try:
        logger.info(f"📊 지역별 인기도 조회 요청 (기간: {days}일)")
        
        scores = await trends_analyzer.get_regional_popularity(days=days)
        
        # 히스토리에 저장
        for region, score in scores.items():
            popularity_scorer.update_history(region, score)
        
        # 트렌드 방향 추가
        result = {}
        for region, score in scores.items():
            result[region] = {
                "score": score,
                "trend": popularity_scorer.get_trend_direction(region, days),
                "historical_avg": popularity_scorer.get_historical_avg(region, days)
            }
        
        return {
            "status": "success",
            "data": result,
            "analyzed_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ 인기도 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/top-regions")
async def get_top_regions(count: int = 7, days: int = 7):
    """
    상위 N개 인기 지역 조회
    
    Args:
        count: 반환할 지역 개수 (기본: 7)
        days: 분석 기간 (기본: 7일)
        
    Returns:
        상위 지역 리스트
    """
    try:
        logger.info(f"🏆 상위 {count}개 지역 조회")
        
        top_regions = await trends_analyzer.get_top_regions(count=count, days=days)
        
        result = [
            {
                "rank": i + 1,
                "region": region,
                "score": score,
                "trend": popularity_scorer.get_trend_direction(region, days)
            }
            for i, (region, score) in enumerate(top_regions)
        ]
        
        return {
            "status": "success",
            "data": result,
            "total": len(result)
        }
        
    except Exception as e:
        logger.error(f"❌ 상위 지역 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/regenerate")
async def regenerate_queries(target_count: int = 33, days: int = 7):
    """
    동적 쿼리 수동 재생성
    
    Args:
        target_count: 생성할 쿼리 개수 (기본: 33)
        days: 분석 기간 (기본: 7일)
        
    Returns:
        생성된 쿼리 리스트
    """
    try:
        logger.info(f"🔄 쿼리 수동 재생성 시작 (목표: {target_count}개)")
        
        # 1. 상위 지역 분석
        top_regions = await trends_analyzer.get_top_regions(count=7, days=days)
        
        # 2. 동적 쿼리 생성
        queries = await query_generator.generate_daily_queries(top_regions, target_count)
        
        # 3. DB에 저장
        with db_session() as db:
            # 기존 자동 생성 쿼리 삭제
            db.query(ScrapingTarget).filter_by(created_by='auto').delete()
            
            # 새 쿼리 저장
            for query in queries:
                target = ScrapingTarget(
                    id=f"auto_{datetime.now().strftime('%Y%m%d')}_{queries.index(query)}",
                    keyword=query,
                    region=query.split()[0] if query.split() else "",
                    priority=5,
                    status='active',
                    created_by='auto'
                )
                db.add(target)
            
            db.commit()
        
        # 4. 다양성 점수 계산
        diversity = query_generator.get_query_diversity_score(queries)
        
        logger.info(f"✅ 쿼리 재생성 완료: {len(queries)}개")
        
        return {
            "status": "success",
            "data": {
                "queries": queries,
                "top_regions": [
                    {"region": r, "score": s} for r, s in top_regions
                ],
                "diversity": diversity,
                "generated_at": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"❌ 쿼리 재생성 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_targeting_stats():
    """
    타겟팅 시스템 통계 조회
    
    Returns:
        전체 통계
    """
    try:
        # 인기도 통계
        popularity_stats = popularity_scorer.get_all_stats()
        
        # DB 쿼리 통계
        with db_session() as db:
            total_targets = db.query(ScrapingTarget).count()
            active_targets = db.query(ScrapingTarget).filter_by(status='active').count()
            auto_targets = db.query(ScrapingTarget).filter_by(created_by='auto').count()
        
        return {
            "status": "success",
            "data": {
                "popularity": popularity_stats,
                "targets": {
                    "total": total_targets,
                    "active": active_targets,
                    "auto_generated": auto_targets
                },
                "updated_at": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"❌ 통계 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/queries/today")
async def get_today_queries():
    """
    오늘의 동적 쿼리 조회
    
    Returns:
        오늘 생성된 쿼리 리스트
    """
    try:
        with db_session() as db:
            today = datetime.now().date()
            
            # 오늘 생성된 자동 쿼리 조회
            targets = db.query(ScrapingTarget).filter(
                ScrapingTarget.created_by == 'auto',
                ScrapingTarget.status == 'active'
            ).order_by(desc(ScrapingTarget.created_at)).limit(33).all()
            
            queries = [
                {
                    "keyword": t.keyword,
                    "region": t.region,
                    "priority": t.priority,
                    "created_at": t.created_at.isoformat() if t.created_at else None
                }
                for t in targets
            ]
            
            return {
                "status": "success",
                "data": {
                    "queries": queries,
                    "total": len(queries),
                    "date": today.isoformat()
                }
            }
            
    except Exception as e:
        logger.error(f"❌ 오늘의 쿼리 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/queries/history")
async def get_query_history(days: int = 7):
    """
    쿼리 히스토리 조회
    
    Args:
        days: 조회 기간 (일 단위, 기본: 7일)
        
    Returns:
        히스토리 데이터
    """
    try:
        with db_session() as db:
            cutoff = datetime.now() - timedelta(days=days)
            
            targets = db.query(ScrapingTarget).filter(
                ScrapingTarget.created_by == 'auto',
                ScrapingTarget.created_at >= cutoff
            ).order_by(desc(ScrapingTarget.created_at)).all()
            
            # 날짜별로 그룹화
            history_by_date = {}
            for target in targets:
                if target.created_at:
                    date_key = target.created_at.date().isoformat()
                    if date_key not in history_by_date:
                        history_by_date[date_key] = []
                    history_by_date[date_key].append({
                        "keyword": target.keyword,
                        "region": target.region
                    })
            
            return {
                "status": "success",
                "data": {
                    "history": history_by_date,
                    "period_days": days,
                    "total_dates": len(history_by_date)
                }
            }
            
    except Exception as e:
        logger.error(f"❌ 쿼리 히스토리 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def targeting_health_check():
    """타겟팅 시스템 헬스 체크"""
    try:
        # Google Trends 연결 테스트
        test_scores = await trends_analyzer.get_regional_popularity(
            regions=["강남구"],
            days=1
        )
        
        trends_ok = "강남구" in test_scores
        
        return {
            "status": "healthy" if trends_ok else "degraded",
            "components": {
                "google_trends": "ok" if trends_ok else "error",
                "query_generator": "ok",
                "popularity_scorer": "ok"
            },
            "checked_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ 헬스 체크 실패: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "checked_at": datetime.now().isoformat()
        }
