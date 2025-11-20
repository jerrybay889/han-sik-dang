"""
스마트 타겟팅 시스템
Smart Targeting System for Dynamic Query Generation
"""

from .trends_analyzer import TrendsAnalyzer
from .query_generator import QueryGenerator
from .popularity_scorer import PopularityScorer

__all__ = ['TrendsAnalyzer', 'QueryGenerator', 'PopularityScorer']
