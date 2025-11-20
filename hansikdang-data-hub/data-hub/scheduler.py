"""
24/7 자동화 스케줄러
Restaurant Data Hub Automated Scheduler

일일 목표: 333개 (네이버 33개 + 구글 300개)
"""

import asyncio
import schedule
import time
from datetime import datetime
from loguru import logger
import sys

sys.path.insert(0, '/home/runner/workspace/data-hub')

from src.scrapers.naver_maps_api import NaverMapsScraper
from src.scrapers.google_places_api import GooglePlacesAPI
from src.scrapers.apify_naver_scraper import ApifyNaverScraper
from src.scrapers.place_id_loader import PlaceIDLoader
from src.workflows.sync import SyncWorkflow
from src.processors.gemini import GeminiProcessor
from src.processors.quality_validator import QualityValidator
from src.targeting.trends_analyzer import TrendsAnalyzer
from src.targeting.query_generator import QueryGenerator
from src.targeting.popularity_scorer import PopularityScorer
from src.deduplication.service import DeduplicationService
from src.governance.drive_backup import DriveBackupManager
from src.database.connection import db_session, init_db
from src.database.models import RawRestaurantData, ProcessedRestaurant, ScrapingTarget
import uuid


logger.add("logs/scheduler.log", rotation="1 day", retention="30 days", level="INFO")
logger.add("logs/scheduler_error.log", rotation="1 day", retention="30 days", level="ERROR")


async def generate_smart_queries_daily():
    """스마트 타겟팅: 매일 01:30 KST에 외국인 인기도 기반 33개 쿼리 생성"""
    logger.info("=" * 70)
    logger.info("🎯 Smart Targeting: Generating dynamic queries")
    logger.info("=" * 70)
    
    try:
        trends_analyzer = TrendsAnalyzer()
        query_generator = QueryGenerator()
        popularity_scorer = PopularityScorer()
        
        # 1. 지역별 인기도 분석 (최근 7일)
        logger.info("📊 Step 1: Analyzing regional popularity...")
        top_regions = await trends_analyzer.get_top_regions(count=7, days=7)
        
        logger.info(f"  ✓ Top 7 regions identified:")
        for i, (region, score) in enumerate(top_regions, 1):
            logger.info(f"    {i}. {region}: {score:.1f}")
            popularity_scorer.update_history(region, score)
        
        # 2. 동적 쿼리 생성 (33개)
        logger.info("🔧 Step 2: Generating 33 dynamic queries...")
        queries = await query_generator.generate_daily_queries(top_regions, target_count=33)
        
        # 3. 다양성 점수 계산
        diversity = query_generator.get_query_diversity_score(queries)
        logger.info(f"  ✓ Query diversity: {diversity['diversity_score']:.1f}%")
        logger.info(f"    - Unique regions: {diversity['unique_regions']}")
        logger.info(f"    - Unique categories: {diversity['unique_categories']}")
        
        # 4. DB에 저장
        logger.info("💾 Step 3: Saving to database...")
        with db_session() as db:
            # 기존 자동 생성 쿼리 삭제
            deleted = db.query(ScrapingTarget).filter_by(created_by='auto').delete()
            logger.info(f"  - Deleted {deleted} old auto-generated queries")
            
            # 새 쿼리 저장
            today_str = datetime.now().strftime('%Y%m%d')
            for idx, query in enumerate(queries):
                target = ScrapingTarget(
                    id=f"auto_{today_str}_{idx:03d}",
                    keyword=query,
                    region=query.split()[0] if query.split() else "",
                    priority=5,
                    status='active',
                    created_by='auto'
                )
                db.add(target)
            
            db.commit()
            logger.info(f"  ✓ Saved {len(queries)} new queries")
        
        # 5. 히스토리 저장
        popularity_scorer.save_to_json("logs/popularity_history.json")
        
        logger.info("=" * 70)
        logger.info(f"✅ Smart Targeting completed: {len(queries)} queries ready")
        logger.info("=" * 70)
        
        return len(queries)
        
    except Exception as e:
        logger.error(f"❌ Smart Targeting failed: {e}")
        logger.exception(e)
        return 0


async def scrape_naver_daily():
    """Apify Naver Map Scraper로 매일 33개 수집 (메뉴/전화번호 포함)"""
    logger.info("=" * 60)
    logger.info("🔍 Starting Naver Maps scraping with Apify (Daily target: 33)")
    logger.info("=" * 60)
    
    try:
        apify = ApifyNaverScraper()
        
        # DB에서 자동 생성된 쿼리 가져오기 (스마트 타겟팅)
        with db_session() as db:
            auto_targets = db.query(ScrapingTarget).filter_by(
                created_by='auto',
                status='active'
            ).limit(33).all()
            
            if auto_targets:
                search_queries = [t.keyword for t in auto_targets]
                logger.info(f"  ✓ Using {len(search_queries)} smart-generated queries")
            else:
                # Fallback: 기본 쿼리 사용
                search_queries = [
                    "홍대 한식",
                    "강남 한식당",
                    "명동 한식",
                    "여의도 맛집",
                    "이태원 한식",
                    "서울 삼계탕",
                    "서울 불고기",
                    "서울 비빔밥",
                    "서울 갈비",
                    "서울 냉면",
                    "서울 찌개",
                ]
                logger.warning(f"  ⚠️  No smart queries found, using {len(search_queries)} default queries")
        
        total_saved = 0
        for query in search_queries:
            try:
                # Apify로 레스토랑 검색 (메뉴/전화번호 포함)
                results = await apify.search_restaurants([query], max_results=11)
                
                if not results:
                    logger.warning(f"  ⚠️  {query}: No results")
                    continue
                
                # DB에 저장
                with db_session() as db:
                    saved_count = 0
                    for restaurant_data in results:
                        try:
                            # 중복 체크
                            existing = db.query(RawRestaurantData).filter_by(
                                name=restaurant_data.get('name'),
                                address=restaurant_data.get('address')
                            ).first()
                            
                            if existing:
                                continue
                            
                            # Raw 데이터 저장
                            raw = RawRestaurantData(
                                id=str(uuid.uuid4()),
                                source='apify_naver',
                                raw_data=restaurant_data,
                                status='pending'
                            )
                            db.add(raw)
                            saved_count += 1
                            
                        except Exception as e:
                            logger.error(f"    ❌ Error saving {restaurant_data.get('name')}: {e}")
                    
                    db.commit()
                    total_saved += saved_count
                    logger.info(f"  ✓ {query}: {saved_count} saved (with menu/phone)")
                    
                if total_saved >= 33:
                    break
                
                await asyncio.sleep(2)
                
            except Exception as e:
                logger.error(f"  ❌ Error with query '{query}': {e}")
        
        logger.info(f"✅ Naver scraping completed: {total_saved} restaurants saved (with full data)")
        return total_saved
        
    except Exception as e:
        logger.error(f"❌ Naver scraping failed: {e}")
        return 0


async def process_pending_daily():
    """Gemini AI로 pending 데이터 정제 (배치 처리)"""
    logger.info("=" * 60)
    logger.info("🤖 Starting Gemini AI processing")
    logger.info("=" * 60)
    
    try:
        gemini = GeminiProcessor()
        total_processed = 0
        batch_size = 10
        
        while True:
            with db_session() as db:
                raw_batch = db.query(RawRestaurantData).filter(
                    RawRestaurantData.status == 'pending'
                ).limit(batch_size).all()
                
                if not raw_batch:
                    break
                
                logger.info(f"Processing batch of {len(raw_batch)} records...")
                batch_processed = 0
                
                for idx, raw in enumerate(raw_batch):
                    try:
                        if idx > 0 and idx % 5 == 0:
                            await asyncio.sleep(10)
                        
                        max_retries = 3
                        retry_count = 0
                        refined = None
                        
                        while retry_count < max_retries and refined is None:
                            try:
                                refined = await gemini.refine_restaurant_data(raw.raw_data)
                            except Exception as retry_error:
                                error_msg = str(retry_error)
                                if "429" in error_msg or "quota" in error_msg.lower():
                                    retry_count += 1
                                    if retry_count < max_retries:
                                        wait_time = 60 * retry_count
                                        logger.warning(f"  ⚠️ Rate limit! Retry in {wait_time}s (attempt {retry_count}/{max_retries})")
                                        await asyncio.sleep(wait_time)
                                    else:
                                        raise
                                else:
                                    raise
                        
                        if refined is None:
                            raise Exception("Failed to refine data after retries")
                        
                        quality = await gemini.calculate_quality_score(raw.raw_data)
                        
                        new_restaurant = ProcessedRestaurant(
                            id=str(uuid.uuid4()),
                            mapping_id=raw.id,
                            name=refined.get('name', ''),
                            name_en=refined.get('nameEn', ''),
                            category=refined.get('category', '한식'),
                            cuisine=refined.get('cuisine', ''),
                            district=refined.get('district', ''),
                            address=refined.get('address', ''),
                            address_en=refined.get('addressEn', ''),
                            latitude=raw.raw_data.get('lat') or raw.raw_data.get('geometry', {}).get('location', {}).get('lat'),
                            longitude=raw.raw_data.get('lng') or raw.raw_data.get('geometry', {}).get('location', {}).get('lng'),
                            description=refined.get('description', ''),
                            description_en=refined.get('descriptionEn', ''),
                            price_range=str(refined.get('priceRange', 2)),
                            phone=refined.get('phone', ''),
                            rating=raw.raw_data.get('rating'),
                            review_count=raw.raw_data.get('reviewCount') or raw.raw_data.get('user_ratings_total', 0),
                            image_url=refined.get('imageUrl', 'https://via.placeholder.com/400x300?text=Restaurant'),
                            open_hours=refined.get('openHours'),
                            quality_score=quality.get('quality_score', 0),
                            quality_details=quality.get('quality_details', {}),
                            sync_status='pending'
                        )
                        db.add(new_restaurant)
                        
                        raw.status = 'processed'
                        batch_processed += 1
                        
                    except Exception as e:
                        raw.status = 'failed'
                        raw.error_message = str(e)
                        logger.error(f"Failed to process {raw.id}: {e}")
                
                db.commit()
                total_processed += batch_processed
                logger.info(f"  ✓ Batch completed: {batch_processed}/{len(raw_batch)} processed (Total: {total_processed})")
                
                if len(raw_batch) < batch_size:
                    break
                
                await asyncio.sleep(60)
        
        logger.info(f"✅ Processing completed: {total_processed} records")
        return total_processed
            
    except Exception as e:
        logger.error(f"❌ Processing failed: {e}")
        return 0


async def enrich_with_google_ratings():
    """구글 평점으로 기존 레스토랑 보강"""
    logger.info("=" * 60)
    logger.info("⭐ Starting Google ratings enrichment")
    logger.info("=" * 60)
    
    try:
        with db_session() as db:
            restaurants_without_google = db.query(ProcessedRestaurant).filter(
                ProcessedRestaurant.google_place_id == None
            ).limit(33).all()
            
            if not restaurants_without_google:
                logger.info("No restaurants need Google enrichment")
                return 0
            
            logger.info(f"Found {len(restaurants_without_google)} restaurants to enrich")
            
            google_api = GooglePlacesAPI()
            enriched_count = 0
            
            for restaurant in restaurants_without_google:
                try:
                    place_data = await google_api.search_place(
                        name=restaurant.name,
                        address=restaurant.address or ""
                    )
                    
                    if place_data:
                        restaurant.google_place_id = place_data.get('place_id')
                        restaurant.google_rating = place_data.get('rating')
                        restaurant.google_review_count = place_data.get('user_ratings_total', 0)
                        
                        if place_data.get('image_urls'):
                            restaurant.image_urls = place_data.get('image_urls')
                            restaurant.image_url = place_data.get('image_url')
                        
                        from src.processors.popularity_calculator import PopularityCalculator
                        popularity_score, popularity_tier = PopularityCalculator.calculate_with_tier(
                            naver_rating=restaurant.naver_rating or 0,
                            naver_review_count=restaurant.naver_review_count or 0,
                            google_rating=restaurant.google_rating or 0,
                            google_review_count=restaurant.google_review_count or 0
                        )
                        restaurant.popularity_score = popularity_score
                        restaurant.popularity_tier = popularity_tier
                        
                        enriched_count += 1
                        images_count = len(place_data.get('image_urls', []))
                        logger.info(f"  ✓ Enriched: {restaurant.name} (Rating: {place_data.get('rating')}/5.0, Images: {images_count})")
                    
                    await asyncio.sleep(0.2)
                    
                except Exception as e:
                    logger.error(f"Failed to enrich {restaurant.name}: {e}")
            
            db.commit()
            logger.info(f"✅ Google enrichment completed: {enriched_count} restaurants")
            return enriched_count
            
    except Exception as e:
        logger.error(f"❌ Google enrichment failed: {e}")
        return 0


async def update_menus_with_apify():
    """Apify로 메뉴 데이터 업데이트 (배치 커밋)"""
    logger.info("=" * 60)
    logger.info("🍽️  Starting menu update with Apify")
    logger.info("=" * 60)
    
    try:
        apify = ApifyNaverScraper()
        total_updated = 0
        batch_size = 10
        
        while True:
            with db_session() as db:
                # 메뉴가 없는 레스토랑 조회 (배치 단위)
                restaurants_without_menu = db.query(ProcessedRestaurant).filter(
                    ProcessedRestaurant.menu_summary == None
                ).limit(batch_size).all()
                
                if not restaurants_without_menu:
                    logger.info("All restaurants have menu data")
                    break
                
                logger.info(f"Processing batch of {len(restaurants_without_menu)} restaurants...")
                batch_updated = 0
                
                for restaurant in restaurants_without_menu:
                    try:
                        # Apify로 상세 정보 조회 (메뉴 포함)
                        details = await apify.get_restaurant_details(
                            restaurant_name=restaurant.name,
                            address=restaurant.address
                        )
                        
                        if details and (details.get('menus') or details.get('menu_items')):
                            # 메뉴 데이터 저장
                            menus = details.get('menus', []) or details.get('menu_items', [])
                            
                            # JSON 배열 형태로 저장
                            menu_list = []
                            for menu in menus[:10]:  # 최대 10개
                                if isinstance(menu, dict):
                                    menu_list.append({
                                        "name": menu.get('name', ''),
                                        "price": menu.get('price', '')
                                    })
                                elif isinstance(menu, str):
                                    menu_list.append({
                                        "name": menu,
                                        "price": ""
                                    })
                            
                            restaurant.menu_summary = menu_list
                            batch_updated += 1
                            logger.info(f"  ✓ Updated menu: {restaurant.name} ({len(menu_list)} items)")
                        else:
                            logger.debug(f"  ⚠️  No menu found: {restaurant.name}")
                        
                        await asyncio.sleep(2)  # Rate limiting
                        
                    except Exception as e:
                        logger.error(f"Failed to update menu for {restaurant.name}: {e}")
                
                # 배치 커밋
                db.commit()
                total_updated += batch_updated
                logger.info(f"  ✓ Batch committed: {batch_updated}/{len(restaurants_without_menu)} updated (Total: {total_updated})")
                
                if len(restaurants_without_menu) < batch_size:
                    break
        
        logger.info(f"✅ Menu update completed: {total_updated} restaurants")
        return total_updated
            
    except Exception as e:
        logger.error(f"❌ Menu update failed: {e}")
        return 0


async def sync_daily():
    """메인 플랫폼 동기화"""
    logger.info("=" * 60)
    logger.info("🔄 Starting sync to 한식당 platform")
    logger.info("=" * 60)
    
    try:
        workflow = SyncWorkflow()
        result = await workflow.sync_to_hansikdang()
        logger.info(f"✅ Sync completed: {result}")
        return result
        
    except Exception as e:
        logger.error(f"❌ Sync failed: {e}")
        return 0


async def deduplicate_daily():
    """중복 탐지 및 자동 병합"""
    logger.info("=" * 70)
    logger.info("🔍 Starting daily duplicate detection and merging")
    logger.info("=" * 70)
    
    try:
        with db_session() as db:
            service = DeduplicationService(
                db=db,
                name_threshold=90.0,
                address_threshold=85.0,
                distance_threshold_meters=100.0
            )
            
            result = service.detect_and_merge_duplicates(
                auto_merge=True,
                merge_type='auto'
            )
            
            logger.info("=" * 70)
            logger.info("✅ Duplicate detection and merging completed")
            logger.info(f"   Total restaurants: {result['total_restaurants']}")
            logger.info(f"   Duplicate groups found: {result['duplicate_groups_found']}")
            logger.info(f"   Merged groups: {result['merged_groups']}")
            logger.info(f"   Total merged restaurants: {result['total_merged_restaurants']}")
            logger.info("=" * 70)
            
            return result['merged_groups']
        
    except Exception as e:
        logger.error(f"❌ Duplicate detection failed: {e}")
        logger.exception(e)
        return 0


def log_statistics():
    """통계 로깅 및 시스템 모니터링"""
    try:
        with db_session() as db:
            total_raw = db.query(RawRestaurantData).count()
            total_processed = db.query(ProcessedRestaurant).count()
            total_synced = db.query(ProcessedRestaurant).filter(
                ProcessedRestaurant.synced_to_hansikdang == True
            ).count()
            raw_pending = db.query(RawRestaurantData).filter(
                RawRestaurantData.status == 'pending'
            ).count()
            
            logger.info("=" * 60)
            logger.info("📊 Hourly Statistics")
            logger.info(f"  Total raw: {total_raw}")
            logger.info(f"  Total processed: {total_processed}")
            logger.info(f"  Total synced: {total_synced}")
            logger.info(f"  Pending processing: {raw_pending}")
            logger.info(f"  Daily target: 333")
            logger.info("=" * 60)
            
            from src.monitoring.system_monitor import SystemMonitor
            from src.monitoring.alert_manager import AlertManager
            
            monitor = SystemMonitor(db)
            alert_manager = AlertManager(db)
            
            monitor.monitor_component(
                component='database',
                total_operations=total_processed,
                successful_operations=total_synced,
                failed_operations=0
            )
            
            alerts = alert_manager.check_all_alerts()
            
            if alerts['total_alerts'] > 0:
                logger.warning(f"⚠️  Active alerts: {alerts['total_alerts']} (Critical: {alerts['critical']}, High: {alerts['high']})")
            
    except Exception as e:
        logger.error(f"Failed to log statistics: {e}")


def smart_targeting_job():
    """스마트 타겟팅 작업 (동기 래퍼)"""
    asyncio.run(generate_smart_queries_daily())


def scrape_naver_job():
    """네이버 수집 작업 (동기 래퍼)"""
    asyncio.run(scrape_naver_daily())


def process_job():
    """정제 작업 (동기 래퍼)"""
    asyncio.run(process_pending_daily())


def sync_job():
    """동기화 작업 (동기 래퍼)"""
    asyncio.run(sync_daily())


def google_enrichment_job():
    """구글 평점 보강 작업 (동기 래퍼)"""
    asyncio.run(enrich_with_google_ratings())


def deduplication_job():
    """중복 탐지 및 병합 작업 (동기 래퍼)"""
    asyncio.run(deduplicate_daily())


def weekly_update_job():
    """주간 전체 데이터 업데이트 (동기 래퍼)"""
    asyncio.run(update_all_restaurants_weekly())


def backup_job():
    """Google Drive 백업 작업 (동기 래퍼)"""
    backup_daily_data()


def backup_daily_data():
    """당일 수집된 데이터를 Google Drive에 백업"""
    logger.info("=" * 70)
    logger.info("💾 Starting Google Drive backup")
    logger.info("=" * 70)
    
    try:
        with db_session() as db:
            backup_manager = DriveBackupManager(db)
            
            backup_history = backup_manager.backup_daily(
                backup_date=None,
                backup_type='daily'
            )
            
            if backup_history.status == 'success':
                logger.info(f"✅ Backup completed successfully:")
                logger.info(f"   File: {backup_history.file_path}")
                logger.info(f"   Records: {backup_history.total_records}")
                logger.info(f"   Size: {backup_history.file_size_bytes / 1024 / 1024:.2f} MB")
                logger.info(f"   Quality: {backup_history.average_quality_score}")
                logger.info(f"   Time: {backup_history.execution_time_seconds}s")
            else:
                logger.error(f"❌ Backup failed: {backup_history.error_message}")
            
            return backup_history.status == 'success'
            
    except Exception as e:
        logger.error(f"❌ Backup job failed: {e}")
        return False


async def update_all_restaurants_weekly():
    """매주 모든 레스토랑의 누락된 정보를 Apify로 업데이트"""
    logger.info("=" * 70)
    logger.info("📅 Starting weekly comprehensive data update")
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
                    (ProcessedRestaurant.menu_summary == None) |
                    (ProcessedRestaurant.open_hours == None)
                ).limit(batch_size).all()
                
                if not restaurants_to_update:
                    logger.info("✅ All restaurants have complete data")
                    break
                
                logger.info(f"Processing batch of {len(restaurants_to_update)} restaurants...")
                batch_updated = 0
                
                for restaurant in restaurants_to_update:
                    try:
                        logger.info(f"  🔍 Updating: {restaurant.name}")
                        
                        details = await apify.get_restaurant_details(
                            restaurant_name=restaurant.name,
                            address=restaurant.address
                        )
                        
                        if details:
                            updated_fields = []
                            
                            if not restaurant.phone and details.get('phone'):
                                restaurant.phone = details.get('phone')
                                updated_fields.append('phone')
                            
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
                            
                            if not restaurant.open_hours and details.get('businessHours'):
                                restaurant.open_hours = {"hours": details.get('businessHours')}
                                updated_fields.append('hours')
                            
                            if details.get('rating') and not restaurant.naver_rating:
                                restaurant.naver_rating = details.get('rating')
                                restaurant.naver_review_count = details.get('reviewCount', 0)
                                updated_fields.append('rating')
                            
                            if updated_fields:
                                batch_updated += 1
                                logger.info(f"    ✓ Updated: {', '.join(updated_fields)}")
                        
                        await asyncio.sleep(2)
                        
                    except Exception as e:
                        logger.error(f"    ❌ Failed to update {restaurant.name}: {e}")
                
                db.commit()
                total_updated += batch_updated
                logger.info(f"  ✓ Batch committed: {batch_updated}/{len(restaurants_to_update)} updated (Total: {total_updated})")
                
                if len(restaurants_to_update) < batch_size:
                    break
        
        logger.info("=" * 70)
        logger.info(f"✅ Weekly update completed: {total_updated} restaurants")
        logger.info("=" * 70)
        return total_updated
            
    except Exception as e:
        logger.error(f"❌ Weekly update failed: {e}")
        return 0


def setup_schedule():
    """스케줄 설정 (UTC 기준, KST = UTC + 9시간)"""
    logger.info("🚀 Setting up 24/7 automated schedule...")
    
    # UTC 16:30 = KST 01:30 (다음날) - 스마트 타겟팅
    schedule.every().day.at("16:30").do(smart_targeting_job)
    logger.info("  ✓ Smart targeting: Daily at 16:30 UTC (KST 01:30, dynamic queries)")
    
    # UTC 18:00 = KST 03:00 (다음날)
    schedule.every().day.at("18:00").do(scrape_naver_job)
    logger.info("  ✓ Naver scraping: Daily at 18:00 UTC (KST 03:00, 33 restaurants)")
    
    # UTC 18:05 = KST 03:05 (다음날) - 중복 탐지 및 병합 (Gemini/Google 전에 실행)
    schedule.every().day.at("18:05").do(deduplication_job)
    logger.info("  ✓ Duplicate detection: Daily at 18:05 UTC (KST 03:05, auto-merge)")
    
    # UTC 21:00 = KST 06:00 (다음날)
    schedule.every().day.at("21:00").do(process_job)
    logger.info("  ✓ Gemini processing: Daily at 21:00 UTC (KST 06:00)")
    
    # UTC 22:00 = KST 07:00 (다음날)
    schedule.every().day.at("22:00").do(google_enrichment_job)
    logger.info("  ✓ Google enrichment: Daily at 22:00 UTC (KST 07:00, 33 restaurants)")
    
    # UTC 23:00 = KST 08:00 (다음날)
    schedule.every().day.at("23:00").do(sync_job)
    logger.info("  ✓ Hansikdang sync: Daily at 23:00 UTC (KST 08:00)")
    
    # UTC 13:00 = KST 22:00 (같은 날) - Google Drive 백업
    schedule.every().day.at("13:00").do(backup_job)
    logger.info("  ✓ Google Drive backup: Daily at 13:00 UTC (KST 22:00)")
    
    # 매주 일요일 UTC 03:00 = KST 12:00 (정오)
    schedule.every().sunday.at("03:00").do(weekly_update_job)
    logger.info("  ✓ Weekly data update: Sunday at 03:00 UTC (KST 12:00)")
    
    schedule.every().hour.do(log_statistics)
    logger.info("  ✓ Statistics logging: Every hour")
    
    logger.info("\n✅ Schedule setup completed!")
    logger.info("=" * 60)
    logger.info("📅 Daily Schedule (KST):")
    logger.info("  01:30 KST - Smart Targeting (외국인 인기도 분석 + 동적 쿼리 생성)")
    logger.info("  03:00 KST - Naver Maps scraping (33 smart queries)")
    logger.info("  03:05 KST - Duplicate detection & merging (중복 제거)")
    logger.info("  06:00 KST - Gemini AI processing")
    logger.info("  07:00 KST - Google rating enrichment (33 restaurants)")
    logger.info("  08:00 KST - Sync to 한식당 platform")
    logger.info("  22:00 KST - Google Drive daily backup")
    logger.info("  Every hour - Statistics logging")
    logger.info("")
    logger.info("📅 Weekly Schedule (KST):")
    logger.info("  Sunday 12:00 KST - Full data update (phone, menu, hours)")
    logger.info("=" * 60)
    logger.info(f"🎯 Daily target: 33 restaurants (스마트 타겟팅)")
    logger.info(f"🎯 Monthly target: 990 restaurants")
    logger.info(f"💾 Backup: Daily 22:00 KST to Google Drive")
    logger.info("=" * 60)


def main():
    """메인 실행 함수"""
    logger.info("=" * 60)
    logger.info("🚀 Restaurant Data Hub - 24/7 Scheduler Starting")
    logger.info("=" * 60)
    logger.info(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 60)
    
    init_db()
    
    setup_schedule()
    
    log_statistics()
    
    logger.info("\n🔄 Scheduler running... (Press Ctrl+C to stop)")
    logger.info("⏰ Schedule check interval: 10 seconds")
    logger.info("=" * 60)
    
    try:
        loop_count = 0
        while True:
            schedule.run_pending()
            loop_count += 1
            
            if loop_count % 360 == 0:
                logger.debug(f"Scheduler loop: {loop_count} iterations ({loop_count // 360} hours)")
            
            time.sleep(10)
            
    except KeyboardInterrupt:
        logger.info("\n🛑 Scheduler stopped by user")
    except Exception as e:
        logger.error(f"❌ Scheduler error: {e}")
        raise


if __name__ == "__main__":
    main()
