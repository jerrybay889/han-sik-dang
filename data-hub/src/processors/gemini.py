"""
Gemini AI Data Processor
- 데이터 정제
- 다국어 번역
- 카테고리 분류
- 중복 매칭 판단
"""
from typing import Dict, Any, Optional, List
import json
import google.generativeai as genai
from loguru import logger

from config import settings


class GeminiProcessor:
    """Gemini AI 데이터 처리"""
    
    def __init__(self):
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY not set")
        
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")
        self.logger = logger.bind(processor="gemini")
    
    async def refine_restaurant_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """레스토랑 데이터 정제 및 보완"""
        try:
            prompt = f"""
다음은 스크래핑된 한식당 정보입니다. 이 데이터를 정제하고 보완해주세요.

원본 데이터:
{json.dumps(raw_data, ensure_ascii=False, indent=2)}

다음 JSON 형식으로 정제된 데이터를 반환해주세요:
{{
  "name": "한글 식당 이름 (정제)",
  "name_en": "영문 이름 (번역)",
  "cuisine": "요리 카테고리 (육류/냉면/분식/찌개/한정식/기타 중 하나)",
  "district": "지역구 (강남구/종로구 형식)",
  "address": "정제된 주소",
  "address_en": "영문 주소",
  "description": "한글 설명 (50자 이내)",
  "description_en": "영문 설명",
  "price_range": "저렴/보통/비쌈 중 하나",
  "phone": "전화번호 (02-123-4567 형식)",
  "specialties": ["대표 메뉴1", "대표 메뉴2"]
}}

주의사항:
- 맞춤법 교정
- 불필요한 공백 제거
- 전화번호 형식 통일
- 누락된 정보는 null
- JSON만 반환 (설명 없이)
"""
            
            response = await self.model.generate_content_async(prompt)
            result_text = response.text.strip()
            
            # JSON 파싱
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            refined = json.loads(result_text)
            self.logger.info(f"Refined restaurant: {refined.get('name')}")
            return refined
            
        except Exception as e:
            self.logger.error(f"Failed to refine data: {e}")
            return raw_data
    
    async def match_restaurants(
        self,
        naver_data: Dict[str, Any],
        google_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """네이버와 구글 데이터가 같은 업체인지 판단"""
        try:
            prompt = f"""
다음 두 데이터가 같은 식당인지 판단해주세요.

네이버 데이터:
- 이름: {naver_data.get('name')}
- 주소: {naver_data.get('address')}
- 전화번호: {naver_data.get('phone')}

구글 데이터:
- 이름: {google_data.get('name')}
- 주소: {google_data.get('address')}
- 전화번호: {google_data.get('phone')}

다음 JSON 형식으로 판단 결과를 반환해주세요:
{{
  "is_match": true 또는 false,
  "confidence": 0.0-1.0 (확신도),
  "reason": "판단 이유"
}}

판단 기준:
- 이름이 유사하거나 번역 관계
- 주소가 같은 건물/동일 지역
- 전화번호 일치
- 종합 판단으로 확신도 계산

JSON만 반환하세요.
"""
            
            response = await self.model.generate_content_async(prompt)
            result_text = response.text.strip()
            
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            result = json.loads(result_text)
            self.logger.info(f"Match result: {result.get('is_match')} ({result.get('confidence')})")
            return result
            
        except Exception as e:
            self.logger.error(f"Failed to match restaurants: {e}")
            return {
                "is_match": False,
                "confidence": 0.0,
                "reason": f"Error: {str(e)}"
            }
    
    async def calculate_quality_score(self, restaurant: Dict[str, Any]) -> Dict[str, Any]:
        """데이터 품질 점수 계산 (0-100)"""
        score = 0
        details = {}
        
        # GPS 좌표 (20점)
        if restaurant.get("latitude") and restaurant.get("longitude"):
            score += 20
            details["gps"] = 20
        
        # 리뷰 (20점)
        review_count = restaurant.get("review_count", 0)
        if review_count >= 10:
            score += 20
            details["reviews"] = 20
        elif review_count > 0:
            review_score = min(review_count * 2, 20)
            score += review_score
            details["reviews"] = review_score
        
        # 이미지 (20점)
        if restaurant.get("image_url") or restaurant.get("image_urls"):
            score += 20
            details["images"] = 20
        
        # 영업시간 (20점)
        if restaurant.get("open_hours"):
            score += 20
            details["hours"] = 20
        
        # 메뉴 정보 (20점)
        if restaurant.get("menu_summary"):
            score += 20
            details["menu"] = 20
        
        return {
            "quality_score": score,
            "quality_details": details
        }
    
    async def generate_target_keywords(self, region: str, count: int = 50) -> List[str]:
        """AI가 타겟 키워드 생성"""
        try:
            prompt = f"""
서울 {region} 지역에서 외국인 관광객이 좋아할 만한 한식당을 찾기 위한 검색 키워드를 {count}개 생성해주세요.

조건:
- 다양한 음식 카테고리 포함 (냉면, 삼겹살, 불고기, 찌개, 한정식 등)
- 유명 관광지 주변
- 인기 맛집 거리

JSON 배열로만 반환:
["키워드1", "키워드2", ...]

예시:
["강남 냉면", "이태원 삼겹살", "명동 한정식", ...]
"""
            
            response = await self.model.generate_content_async(prompt)
            result_text = response.text.strip()
            
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()
            
            keywords = json.loads(result_text)
            self.logger.info(f"Generated {len(keywords)} target keywords")
            return keywords
            
        except Exception as e:
            self.logger.error(f"Failed to generate keywords: {e}")
            return []
