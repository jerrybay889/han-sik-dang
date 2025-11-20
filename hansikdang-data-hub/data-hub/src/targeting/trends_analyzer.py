"""
Google Trends 분석기
외국인 관광객의 서울 지역별 한식 관심도를 분석
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from loguru import logger
from pytrends.request import TrendReq
import pandas as pd
import asyncio


class TrendsAnalyzer:
    """Google Trends 데이터를 활용한 지역별 인기도 분석"""
    
    SEOUL_REGIONS = [
        "강남구",
        "중구",
        "종로구",
        "용산구",
        "마포구",
        "영등포구",
        "송파구",
        "서초구"
    ]
    
    KEYWORDS = [
        "Korean food Seoul",
        "Korean restaurant Seoul",
        "Seoul food tour",
        "Korean BBQ Seoul",
        "Traditional Korean food"
    ]
    
    def __init__(self):
        """초기화"""
        self.pytrends = None
        self.logger = logger
        
    def _get_pytrends(self) -> TrendReq:
        """PyTrends 인스턴스 생성 (재사용)"""
        if self.pytrends is None:
            self.pytrends = TrendReq(hl='en-US', tz=540)
        return self.pytrends
    
    async def get_regional_popularity(
        self, 
        regions: Optional[List[str]] = None,
        days: int = 7
    ) -> Dict[str, float]:
        """
        지역별 외국인 인기도 점수 계산
        
        Args:
            regions: 분석할 지역 리스트 (기본: SEOUL_REGIONS)
            days: 분석 기간 (일 단위, 기본: 7일)
            
        Returns:
            {지역명: 인기도 점수(0-100)}
        """
        if regions is None:
            regions = self.SEOUL_REGIONS
            
        try:
            self.logger.info(f"🔍 Google Trends 분석 시작 (지역: {len(regions)}개, 기간: {days}일)")
            
            # 비동기 실행을 위해 동기 함수를 별도 스레드에서 실행
            loop = asyncio.get_event_loop()
            scores = await loop.run_in_executor(
                None,
                self._fetch_trends_data,
                regions,
                days
            )
            
            self.logger.info(f"✅ Google Trends 분석 완료: {len(scores)}개 지역")
            return scores
            
        except Exception as e:
            self.logger.error(f"❌ Google Trends 분석 실패: {e}")
            # Fallback: 모든 지역에 동일 점수
            return {region: 50.0 for region in regions}
    
    def _fetch_trends_data(self, regions: List[str], days: int) -> Dict[str, float]:
        """
        실제 Google Trends 데이터 수집 (동기 함수)
        
        Args:
            regions: 지역 리스트
            days: 분석 기간
            
        Returns:
            지역별 점수
        """
        pytrends = self._get_pytrends()
        regional_scores = {region: 0.0 for region in regions}
        
        try:
            # 각 키워드별로 지역 검색량 수집
            for keyword in self.KEYWORDS:
                try:
                    # 시간 범위 설정
                    timeframe = f'now {days}-d'
                    
                    # 키워드 + 지역 조합으로 검색
                    search_terms = [f"{keyword} {region}" for region in regions[:5]]
                    
                    pytrends.build_payload(
                        search_terms,
                        timeframe=timeframe,
                        geo='KR'
                    )
                    
                    # Interest over time 데이터 가져오기
                    data = pytrends.interest_over_time()
                    
                    if not data.empty and len(data.columns) > 0:
                        # 각 지역별 평균 점수 계산
                        for i, region in enumerate(regions[:5]):
                            if i < len(data.columns) - 1:  # 'isPartial' 컬럼 제외
                                col_name = search_terms[i]
                                if col_name in data.columns:
                                    avg_score = data[col_name].mean()
                                    regional_scores[region] += avg_score
                        
                        self.logger.debug(f"  ✓ {keyword}: 데이터 수집 완료")
                    
                    # Rate limiting 방지
                    import time
                    time.sleep(2)
                    
                except Exception as e:
                    self.logger.warning(f"  ⚠️  {keyword} 수집 실패: {e}")
                    continue
            
            # 정규화 (0-100)
            if regional_scores:
                max_score = max(regional_scores.values()) if max(regional_scores.values()) > 0 else 1
                regional_scores = {
                    region: round((score / max_score) * 100, 2)
                    for region, score in regional_scores.items()
                }
            
            # 나머지 지역은 평균값 할당
            avg_score = sum(regional_scores.values()) / len(regional_scores) if regional_scores else 50.0
            for region in regions:
                if regional_scores[region] == 0.0:
                    regional_scores[region] = avg_score * 0.8
            
            return regional_scores
            
        except Exception as e:
            self.logger.error(f"❌ Trends 데이터 수집 중 오류: {e}")
            # Fallback
            return {region: 50.0 for region in regions}
    
    async def get_top_regions(
        self,
        count: int = 7,
        days: int = 7
    ) -> List[tuple]:
        """
        상위 N개 인기 지역 반환
        
        Args:
            count: 반환할 지역 개수
            days: 분석 기간
            
        Returns:
            [(지역명, 점수), ...] (점수 내림차순)
        """
        scores = await self.get_regional_popularity(days=days)
        sorted_regions = sorted(
            scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return sorted_regions[:count]
    
    async def get_trend_history(
        self,
        region: str,
        days: int = 30
    ) -> List[Dict[str, any]]:
        """
        특정 지역의 트렌드 히스토리 반환
        
        Args:
            region: 지역명
            days: 분석 기간
            
        Returns:
            [{"date": "2025-11-01", "score": 75.5}, ...]
        """
        try:
            pytrends = self._get_pytrends()
            timeframe = f'now {days}-d'
            
            # 대표 키워드로 검색
            keyword = f"Korean food {region}"
            pytrends.build_payload([keyword], timeframe=timeframe, geo='KR')
            
            data = pytrends.interest_over_time()
            
            if data.empty:
                return []
            
            history = []
            for date, row in data.iterrows():
                if keyword in data.columns:
                    history.append({
                        "date": date.strftime("%Y-%m-%d"),
                        "score": float(row[keyword])
                    })
            
            return history
            
        except Exception as e:
            self.logger.error(f"❌ 트렌드 히스토리 조회 실패: {e}")
            return []
