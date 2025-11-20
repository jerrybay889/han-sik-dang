"""
Quality Validator
품질 기준 검증: Quality Score >= 75, 이미지 >= 5, 리뷰 >= 10
"""
from typing import Dict, Any, Tuple
from loguru import logger
from config import settings


class QualityValidator:
    """품질 검증"""
    
    @staticmethod
    def validate(data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """
        품질 기준 검증
        
        Returns:
            (is_valid, validation_details)
        """
        details = {
            "quality_score": data.get("quality_score", data.get("qualityScore", 0)),
            "image_count": len(data.get("images", [])),
            "review_count": (
                data.get("naver_review_count", 0) + 
                data.get("google_review_count", 0)
            ),
            "checks": {}
        }
        
        # 1. Quality Score 검증
        quality_check = details["quality_score"] >= settings.quality_threshold
        details["checks"]["quality_score"] = {
            "value": details["quality_score"],
            "required": settings.quality_threshold,
            "passed": quality_check
        }
        
        # 2. 이미지 수 검증
        image_check = details["image_count"] >= settings.min_images
        details["checks"]["images"] = {
            "value": details["image_count"],
            "required": settings.min_images,
            "passed": image_check
        }
        
        # 3. 리뷰 수 검증
        review_check = details["review_count"] >= settings.min_reviews
        details["checks"]["reviews"] = {
            "value": details["review_count"],
            "required": settings.min_reviews,
            "passed": review_check
        }
        
        # 전체 검증 결과
        is_valid = quality_check and image_check and review_check
        details["overall_passed"] = is_valid
        
        if not is_valid:
            logger.warning(
                f"Quality check failed for {data.get('name')}: "
                f"Score={details['quality_score']}, "
                f"Images={details['image_count']}, "
                f"Reviews={details['review_count']}"
            )
        
        return is_valid, details
    
    @staticmethod
    def get_summary(details: Dict[str, Any]) -> str:
        """검증 결과 요약"""
        checks = details["checks"]
        passed = [k for k, v in checks.items() if v["passed"]]
        failed = [k for k, v in checks.items() if not v["passed"]]
        
        return (
            f"Quality Check: {details['overall_passed']} | "
            f"Passed: {', '.join(passed)} | "
            f"Failed: {', '.join(failed) if failed else 'None'}"
        )
