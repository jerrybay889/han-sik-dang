"""
인기도 점수 계산기
Google Trends 기반 지역별 외국인 인기도 점수 계산 및 관리
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from loguru import logger
from sqlalchemy import and_
import json


class PopularityScorer:
    """지역별 인기도 점수 계산 및 히스토리 관리"""
    
    def __init__(self):
        """초기화"""
        self.logger = logger
        self.history = {}
    
    def calculate_weighted_score(
        self,
        current_score: float,
        historical_avg: Optional[float] = None,
        weight_current: float = 0.8
    ) -> float:
        """
        가중 평균 점수 계산
        
        Args:
            current_score: 현재 점수
            historical_avg: 히스토리 평균 점수
            weight_current: 현재 점수 가중치 (기본: 0.8)
            
        Returns:
            가중 평균 점수 (0-100)
        """
        if historical_avg is None:
            return current_score
        
        weighted = (
            current_score * weight_current +
            historical_avg * (1 - weight_current)
        )
        
        return round(weighted, 2)
    
    def update_history(
        self,
        region: str,
        score: float,
        date: Optional[datetime] = None
    ):
        """
        히스토리에 점수 추가
        
        Args:
            region: 지역명
            score: 점수
            date: 날짜 (기본: 현재)
        """
        if date is None:
            date = datetime.now()
        
        if region not in self.history:
            self.history[region] = []
        
        self.history[region].append({
            "date": date.isoformat(),
            "score": score
        })
        
        # 최근 30일만 유지
        cutoff = datetime.now() - timedelta(days=30)
        self.history[region] = [
            entry for entry in self.history[region]
            if datetime.fromisoformat(entry["date"]) > cutoff
        ]
    
    def get_historical_avg(
        self,
        region: str,
        days: int = 7
    ) -> Optional[float]:
        """
        특정 지역의 히스토리 평균 반환
        
        Args:
            region: 지역명
            days: 기간 (일)
            
        Returns:
            평균 점수 또는 None
        """
        if region not in self.history or not self.history[region]:
            return None
        
        cutoff = datetime.now() - timedelta(days=days)
        recent = [
            entry["score"] for entry in self.history[region]
            if datetime.fromisoformat(entry["date"]) > cutoff
        ]
        
        if not recent:
            return None
        
        return round(sum(recent) / len(recent), 2)
    
    def get_trend_direction(
        self,
        region: str,
        days: int = 7
    ) -> str:
        """
        트렌드 방향 반환
        
        Args:
            region: 지역명
            days: 기간 (일)
            
        Returns:
            "up", "down", "stable"
        """
        if region not in self.history or len(self.history[region]) < 2:
            return "stable"
        
        cutoff = datetime.now() - timedelta(days=days)
        recent = [
            entry for entry in self.history[region]
            if datetime.fromisoformat(entry["date"]) > cutoff
        ]
        
        if len(recent) < 2:
            return "stable"
        
        # 첫 절반 vs 후 절반 비교
        mid = len(recent) // 2
        first_half_avg = sum(e["score"] for e in recent[:mid]) / mid
        second_half_avg = sum(e["score"] for e in recent[mid:]) / (len(recent) - mid)
        
        diff = second_half_avg - first_half_avg
        
        if diff > 5:
            return "up"
        elif diff < -5:
            return "down"
        else:
            return "stable"
    
    def get_all_stats(self) -> Dict[str, any]:
        """
        전체 통계 반환
        
        Returns:
            통계 딕셔너리
        """
        stats = {
            "total_regions": len(self.history),
            "regions": {}
        }
        
        for region, entries in self.history.items():
            if entries:
                scores = [e["score"] for e in entries]
                stats["regions"][region] = {
                    "current_score": scores[-1] if scores else 0,
                    "avg_score": round(sum(scores) / len(scores), 2),
                    "min_score": min(scores),
                    "max_score": max(scores),
                    "trend": self.get_trend_direction(region),
                    "data_points": len(scores)
                }
        
        return stats
    
    def save_to_json(self, filepath: str):
        """
        히스토리를 JSON 파일로 저장
        
        Args:
            filepath: 저장할 파일 경로
        """
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(self.history, f, ensure_ascii=False, indent=2)
            self.logger.info(f"✅ 히스토리 저장 완료: {filepath}")
        except Exception as e:
            self.logger.error(f"❌ 히스토리 저장 실패: {e}")
    
    def load_from_json(self, filepath: str) -> bool:
        """
        JSON 파일에서 히스토리 로드
        
        Args:
            filepath: 로드할 파일 경로
            
        Returns:
            성공 여부
        """
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                self.history = json.load(f)
            self.logger.info(f"✅ 히스토리 로드 완료: {filepath}")
            return True
        except FileNotFoundError:
            self.logger.warning(f"⚠️  히스토리 파일 없음: {filepath}")
            return False
        except Exception as e:
            self.logger.error(f"❌ 히스토리 로드 실패: {e}")
            return False
