"""
Gemini AI Data Processor
- 데이터 정제
- 다국어 번역
- 카테고리 분류
- 중복 매칭 판단
- 인기지수 계산 (Phase 2)
"""
from typing import Dict, Any, Optional, List
import json
import google.generativeai as genai
from loguru import logger

from config import settings
from src.processors.popularity_calculator import PopularityCalculator


class GeminiProcessor:
    """Gemini AI 데이터 처리"""
    
    def __init__(self):
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY not set")
        
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")
        self.logger = logger.bind(processor="gemini")
    
    async def refine_restaurant_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        레스토랑 데이터 정제 및 보완 (Phase 2 업그레이드)
        - 200-300자 상세 설명
        - 다양한 필드 추가
        - 실제 데이터 기반 (할루시네이션 방지)
        """
        try:
            # 실제 메뉴/리뷰 데이터 추출 (있으면)
            menu_items = raw_data.get("menu_items", [])
            reviews = raw_data.get("reviews", [])
            category_info = raw_data.get("parsed_category", {})
            
            prompt = f"""
당신은 한국 음식 전문가입니다. 다음 레스토랑 정보를 바탕으로 상세하고 매력적인 설명을 작성하세요.

**레스토랑 정보:**
- 이름: {raw_data.get('name')}
- 주소: {raw_data.get('address')}
- 카테고리: {raw_data.get('category')} / {category_info.get('sub')} / {category_info.get('detail')}
- 전화번호: {raw_data.get('phone', '정보 없음')}
- 간단 설명: {raw_data.get('description', '')}

**다음 JSON 형식으로 정제된 데이터를 반환하세요:**
{{
  "name": "한글 식당 이름 (정제)",
  "nameEn": "영문 이름 (자연스러운 번역 또는 로마자 표기)",
  "category": "한식" | "일식" | "중식" | "양식" | "카페·디저트" | "기타",
  "cuisine": "구체적 요리 (예: 삼계탕, 육회, 냉면, 불고기)",
  "district": "지역구만 (강남구/종로구/마포구 등, '서울특별시' 제외)",
  "address": "정제된 전체 주소",
  "description": "한글 설명 (200-300자, 아래 작성 요구사항 참고)",
  "descriptionEn": "영문 설명 (150-200자, 한글 설명의 핵심 내용 번역)",
  "priceRange": "1" | "2" | "3" | "4" (문자열로 반환),
  "imageUrl": "https://via.placeholder.com/400x300?text=Restaurant",
  "openHours": "영업시간 (예: 11:00-22:00) 또는 null",
  "phone": "전화번호 (02-123-4567 형식) 또는 null"
}}

**한글 설명 작성 요구사항 (200-300자):**
1. **첫 문장**: 레스토랑의 핵심 특징 (대표 메뉴, 역사, 위치, 분위기)
   - 예: "1985년부터 3대째 이어온 전통 한식당으로, 신선한 한우 육회와 불고기가 대표 메뉴입니다."
   
2. **두 번째**: 인기 메뉴 상세 (맛, 재료, 조리법, 가격대)
   - 예: "육회는 참기름, 배, 마늘을 버무려 고소하고 부드러운 식감이 일품이며, 불고기는 직접 만든 양념에 재워 달콤하면서도 깊은 맛이 특징입니다."
   
3. **세 번째**: 추천 포인트 (분위기, 서비스, 접근성)
   - 예: "깔끔한 인테리어와 친절한 서비스로 가족 모임이나 접대에 적합하며, 지하철역에서 도보 5분 거리로 접근성이 좋습니다."
   
4. **네 번째**: 방문 추천 (시간대, 상황, 예약 필요성)
   - 예: "점심 특선 메뉴(11:00-14:00)가 가성비가 좋으며, 저녁 시간대에는 예약을 권장합니다."

**영문 설명 작성 요구사항 (150-200자):**
- 한글 설명의 핵심 내용을 자연스러운 영어로 번역
- 외국인 관광객이 이해하기 쉽게 작성
- 예: "A traditional Korean restaurant since 1985, famous for fresh yukhoe (Korean beef tartare) and bulgogi. The yukhoe is mixed with sesame oil, pear, and garlic for a smooth texture, while the bulgogi is marinated in house-made sauce. Clean interior and friendly service make it perfect for family gatherings. Lunch specials are available from 11:00-14:00."

**카테고리 선택 기준:**
- cuisine이 삼계탕/냉면/불고기/갈비/찌개/국밥/육회/한정식 → "한식"
- cuisine이 초밥/라멘/우동/사시미 → "일식"
- cuisine이 짜장면/짬뽕/탕수육 → "중식"
- cuisine이 스테이크/파스타/피자/리조또 → "양식"
- cuisine이 커피/케이크/디저트/베이커리 → "카페·디저트"
- cuisine이 떡볶이/김밥/분식 → "한식"
- 기타 → "기타"

**priceRange 결정 기준:**
- 한정식/일식/고급 한식 → "3" 또는 "4"
- 일반 한식당/중식당 → "2"
- 분식/김밥/국밥 → "1"
- 카페/디저트 → "2"

**중요 규칙:**
- "예상", "아마도", "것으로 보입니다" 같은 불확실한 표현 금지
- 실제 정보가 없으면 일반적인 사실만 작성 (할루시네이션 금지)
- 모든 필드 필수 (null 가능: openHours, phone)
- priceRange는 반드시 문자열 "1", "2", "3", "4"
- imageUrl은 반드시 제공 (기본값 사용)
- qualityScore는 시스템에서 자동 계산하므로 포함하지 마세요
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
            
            # ✅ Phase 2: 인기지수 계산
            # 현재는 raw_data에 평점/리뷰수가 없으므로 0으로 계산 (나중에 웹 파싱으로 업데이트)
            naver_rating = raw_data.get('naver_rating', 0.0)
            naver_review_count = raw_data.get('naver_review_count', 0)
            google_rating = raw_data.get('google_rating', 0.0)
            google_review_count = raw_data.get('google_review_count', 0)
            
            popularity_score, popularity_tier = PopularityCalculator.calculate_with_tier(
                naver_rating=naver_rating,
                naver_review_count=naver_review_count,
                google_rating=google_rating,
                google_review_count=google_review_count
            )
            
            # 인기지수 정보 추가
            refined['naver_rating'] = naver_rating
            refined['naver_review_count'] = naver_review_count
            refined['google_rating'] = google_rating
            refined['google_review_count'] = google_review_count
            refined['popularity_score'] = popularity_score
            refined['popularity_tier'] = popularity_tier
            
            self.logger.info(
                f"Refined restaurant: {refined.get('name')} "
                f"(Popularity: {popularity_score:.1f}/{popularity_tier})"
            )
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
