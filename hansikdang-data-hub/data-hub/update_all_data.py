"""
Apify로 모든 레스토랑 데이터 업데이트
- 전화번호
- 메뉴
- 영업시간
- 리뷰
"""
import asyncio
import sys
sys.path.insert(0, '/home/runner/workspace/data-hub')

from loguru import logger
from src.scrapers.apify_naver_scraper import ApifyNaverScraper
from src.database.connection import db_session
from src.database.models import ProcessedRestaurant

logger.add("logs/update_all.log", rotation="1 day", retention="7 days")


async def update_all_restaurant_data():
    """모든 레스토랑의 누락된 정보를 Apify로 업데이트"""
    logger.info("=" * 70)
    logger.info("🔄 Starting comprehensive data update with Apify")
    logger.info("=" * 70)
    
    try:
        apify = ApifyNaverScraper()
        total_updated = 0
        batch_size = 10
        
        while True:
            with db_session() as db:
                # 전화번호 또는 메뉴가 없는 레스토랑 조회
                restaurants_to_update = db.query(ProcessedRestaurant).filter(
                    (ProcessedRestaurant.phone == None) | 
                    (ProcessedRestaurant.menu_summary == None)
                ).limit(batch_size).all()
                
                if not restaurants_to_update:
                    logger.info("✅ All restaurants have complete data")
                    break
                
                logger.info(f"Processing batch of {len(restaurants_to_update)} restaurants...")
                batch_updated = 0
                
                for restaurant in restaurants_to_update:
                    try:
                        logger.info(f"  🔍 Updating: {restaurant.name}")
                        
                        # Apify로 상세 정보 조회
                        details = await apify.get_restaurant_details(
                            restaurant_name=restaurant.name,
                            address=restaurant.address
                        )
                        
                        if details:
                            updated_fields = []
                            
                            # 1. 전화번호 업데이트
                            if not restaurant.phone and details.get('phone'):
                                restaurant.phone = details.get('phone')
                                updated_fields.append('phone')
                            
                            # 2. 메뉴 업데이트
                            if not restaurant.menu_summary:
                                menus = details.get('menus', []) or details.get('menu_items', [])
                                if menus:
                                    menu_list = []
                                    for menu in menus[:10]:
                                        if isinstance(menu, dict):
                                            menu_list.append({
                                                "name": menu.get('name', ''),
                                                "price": menu.get('price', '')
                                            })
                                    if menu_list:
                                        restaurant.menu_summary = menu_list
                                        updated_fields.append(f'menu({len(menu_list)})')
                            
                            # 3. 영업시간 업데이트
                            if not restaurant.open_hours and details.get('businessHours'):
                                restaurant.open_hours = {"hours": details.get('businessHours')}
                                updated_fields.append('hours')
                            
                            # 4. 평점 업데이트 (Naver)
                            if details.get('rating') and not restaurant.naver_rating:
                                restaurant.naver_rating = details.get('rating')
                                restaurant.naver_review_count = details.get('reviewCount', 0)
                                updated_fields.append('rating')
                            
                            if updated_fields:
                                batch_updated += 1
                                logger.info(f"    ✓ Updated: {', '.join(updated_fields)}")
                            else:
                                logger.debug(f"    ⚠️  No updates needed for {restaurant.name}")
                        else:
                            logger.warning(f"    ⚠️  No data found for {restaurant.name}")
                        
                        await asyncio.sleep(2)  # Rate limiting
                        
                    except Exception as e:
                        logger.error(f"    ❌ Failed to update {restaurant.name}: {e}")
                
                # 배치 커밋
                db.commit()
                total_updated += batch_updated
                logger.info(f"  ✓ Batch committed: {batch_updated}/{len(restaurants_to_update)} updated (Total: {total_updated})")
                
                if len(restaurants_to_update) < batch_size:
                    break
        
        logger.info("=" * 70)
        logger.info(f"✅ Update completed: {total_updated} restaurants")
        logger.info("=" * 70)
        return total_updated
            
    except Exception as e:
        logger.error(f"❌ Update failed: {e}")
        import traceback
        traceback.print_exc()
        return 0


if __name__ == "__main__":
    result = asyncio.run(update_all_restaurant_data())
    print(f"\n{'='*70}")
    print(f"Total restaurants updated: {result}")
    print(f"{'='*70}")
