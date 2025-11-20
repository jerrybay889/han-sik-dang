"""
Quality Validator - 7가지 품질 지표 측정 시스템
"""
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from loguru import logger
from sqlalchemy.orm import Session

from ..database.models import ProcessedRestaurant, QualityMetrics


class QualityValidator:
    """
    데이터 품질 검증 엔진
    7가지 품질 지표를 측정하고 등급을 부여합니다.
    """
    
    def __init__(self, db: Session):
        self.db = db
        
        self.required_fields = [
            'name', 'address', 'category', 'description'
        ]
        
        self.recommended_fields = [
            'phone', 'hours', 'menu', 'images', 
            'google_rating', 'google_reviews'
        ]
    
    def validate_restaurant(
        self, 
        restaurant: ProcessedRestaurant
    ) -> QualityMetrics:
        """
        레스토랑 데이터의 품질을 7가지 지표로 측정합니다.
        
        Args:
            restaurant: 검증할 레스토랑
            
        Returns:
            QualityMetrics: 품질 메트릭 객체
        """
        logger.info(f"품질 검증 시작: {restaurant.name}")
        
        completeness = self._measure_completeness(restaurant)
        accuracy = self._measure_accuracy(restaurant)
        consistency = self._measure_consistency(restaurant)
        timeliness = self._measure_timeliness(restaurant)
        validity = self._measure_validity(restaurant)
        uniqueness = self._measure_uniqueness(restaurant)
        relevance = self._measure_relevance(restaurant)
        
        overall_score = (
            completeness * 0.20 +
            accuracy * 0.20 +
            consistency * 0.15 +
            timeliness * 0.10 +
            validity * 0.15 +
            uniqueness * 0.10 +
            relevance * 0.10
        )
        
        grade = self._calculate_grade(overall_score)
        issues = self._identify_issues(restaurant)
        recommendations = self._generate_recommendations(issues)
        
        metrics = QualityMetrics(
            id=str(uuid.uuid4()),
            restaurant_id=restaurant.id,
            data_type='restaurant',
            completeness_score=completeness,
            accuracy_score=accuracy,
            consistency_score=consistency,
            timeliness_score=timeliness,
            validity_score=validity,
            uniqueness_score=uniqueness,
            relevance_score=relevance,
            overall_quality_score=overall_score,
            quality_grade=grade,
            issues=issues,
            recommendations=recommendations,
            measured_by='system'
        )
        
        self.db.add(metrics)
        self.db.commit()
        
        logger.info(f"✅ 품질 검증 완료: {restaurant.name} - {grade}등급 ({overall_score:.1f}점)")
        
        return metrics
    
    def _measure_completeness(self, restaurant: ProcessedRestaurant) -> float:
        """
        완전성 측정: 필수 필드가 모두 채워져 있는가?
        """
        total_fields = len(self.required_fields) + len(self.recommended_fields)
        filled_fields = 0
        
        for field in self.required_fields:
            value = getattr(restaurant, field, None)
            if value and str(value).strip():
                filled_fields += 1
        
        for field in self.recommended_fields:
            value = getattr(restaurant, field, None)
            if value:
                if isinstance(value, list) and len(value) > 0:
                    filled_fields += 1
                elif isinstance(value, (str, int, float)) and str(value).strip():
                    filled_fields += 1
        
        score = (filled_fields / total_fields) * 100
        return min(100, score)
    
    def _measure_accuracy(self, restaurant: ProcessedRestaurant) -> float:
        """
        정확성 측정: 데이터가 정확한가?
        """
        score = 100.0
        
        if restaurant.description and len(restaurant.description) < 200:
            score -= 20
        
        if restaurant.google_rating and (restaurant.google_rating < 0 or restaurant.google_rating > 5):
            score -= 30
        
        if restaurant.phone and len(restaurant.phone.replace('-', '').replace(' ', '')) < 9:
            score -= 10
        
        return max(0, score)
    
    def _measure_consistency(self, restaurant: ProcessedRestaurant) -> float:
        """
        일관성 측정: 데이터가 다른 소스와 일치하는가?
        """
        score = 100.0
        
        if restaurant.naver_rating and restaurant.google_rating:
            rating_diff = abs(restaurant.naver_rating - restaurant.google_rating)
            if rating_diff > 1.0:
                score -= 30
            elif rating_diff > 0.5:
                score -= 15
        
        if not restaurant.address or not restaurant.latitude or not restaurant.longitude:
            score -= 20
        
        return max(0, score)
    
    def _measure_timeliness(self, restaurant: ProcessedRestaurant) -> float:
        """
        적시성 측정: 데이터가 최신인가?
        """
        if not restaurant.created_at:
            return 50.0
        
        now = datetime.now(timezone.utc)
        age_days = (now - restaurant.created_at).days
        
        if age_days <= 1:
            return 100.0
        elif age_days <= 7:
            return 90.0
        elif age_days <= 30:
            return 70.0
        elif age_days <= 90:
            return 50.0
        else:
            return 30.0
    
    def _measure_validity(self, restaurant: ProcessedRestaurant) -> float:
        """
        유효성 측정: 데이터 형식이 올바른가?
        """
        score = 100.0
        
        if restaurant.latitude:
            if not (33 <= restaurant.latitude <= 43):
                score -= 30
        
        if restaurant.longitude:
            if not (124 <= restaurant.longitude <= 132):
                score -= 30
        
        if restaurant.category:
            valid_categories = ['한식', '일식', '중식', '양식', '카페', '주점', '분식', '아시안']
            if not any(cat in restaurant.category for cat in valid_categories):
                score -= 10
        
        return max(0, score)
    
    def _measure_uniqueness(self, restaurant: ProcessedRestaurant) -> float:
        """
        고유성 측정: 중복되지 않은 데이터인가?
        """
        duplicates_count = self.db.query(ProcessedRestaurant).filter(
            ProcessedRestaurant.name == restaurant.name,
            ProcessedRestaurant.id != restaurant.id
        ).count()
        
        if duplicates_count == 0:
            return 100.0
        elif duplicates_count == 1:
            return 70.0
        else:
            return 40.0
    
    def _measure_relevance(self, restaurant: ProcessedRestaurant) -> float:
        """
        관련성 측정: 한식당 플랫폼에 적합한가?
        """
        score = 100.0
        
        if restaurant.category:
            korean_keywords = ['한식', '한정식', '국밥', '찌개', '삼겹살', '갈비', '비빔밥']
            if not any(keyword in restaurant.category for keyword in korean_keywords):
                score -= 30
        
        if not restaurant.description:
            score -= 20
        elif len(restaurant.description) < 200:
            score -= 10
        
        if not restaurant.google_rating or restaurant.google_rating < 3.5:
            score -= 20
        
        return max(0, score)
    
    def _calculate_grade(self, score: float) -> str:
        """점수를 등급으로 변환"""
        if score >= 90:
            return 'A'
        elif score >= 80:
            return 'B'
        elif score >= 70:
            return 'C'
        elif score >= 60:
            return 'D'
        else:
            return 'F'
    
    def _identify_issues(self, restaurant: ProcessedRestaurant) -> List[Dict[str, str]]:
        """품질 이슈 식별"""
        issues = []
        
        for field in self.required_fields:
            value = getattr(restaurant, field, None)
            if not value or not str(value).strip():
                issues.append({
                    'field': field,
                    'severity': 'critical',
                    'message': f'필수 필드 누락: {field}'
                })
        
        if restaurant.description and len(restaurant.description) < 200:
            issues.append({
                'field': 'description',
                'severity': 'warning',
                'message': f'설명이 너무 짧습니다 ({len(restaurant.description)}자, 권장: 200자 이상)'
            })
        
        if not restaurant.google_rating:
            issues.append({
                'field': 'google_rating',
                'severity': 'warning',
                'message': 'Google 평점 누락'
            })
        
        return issues
    
    def _generate_recommendations(self, issues: List[Dict[str, str]]) -> List[str]:
        """개선 권장사항 생성"""
        recommendations = []
        
        for issue in issues:
            if issue['field'] == 'description':
                recommendations.append('Gemini AI로 설명 재생성 필요')
            elif issue['field'] == 'google_rating':
                recommendations.append('Google Places API로 평점 수집 필요')
            elif issue['severity'] == 'critical':
                recommendations.append(f'{issue["field"]} 필드 데이터 보완 필요')
        
        return recommendations
    
    def validate_batch(
        self,
        batch_size: int = 100
    ) -> Dict[str, Any]:
        """
        일괄 품질 검증
        
        Args:
            batch_size: 한 번에 검증할 레스토랑 수
            
        Returns:
            통계 정보
        """
        logger.info(f"일괄 품질 검증 시작 (배치 크기: {batch_size})")
        
        restaurants = self.db.query(ProcessedRestaurant).limit(batch_size).all()
        
        total = len(restaurants)
        grades = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0}
        avg_score = 0.0
        
        for restaurant in restaurants:
            metrics = self.validate_restaurant(restaurant)
            grades[metrics.quality_grade] += 1
            avg_score += metrics.overall_quality_score
        
        if total > 0:
            avg_score /= total
        
        stats = {
            'total_validated': total,
            'average_score': round(avg_score, 2),
            'grade_distribution': grades,
            'a_grade_percentage': round((grades['A'] / total * 100) if total > 0 else 0, 2)
        }
        
        logger.info(f"✅ 일괄 품질 검증 완료: {total}개, 평균 {avg_score:.1f}점")
        
        return stats
