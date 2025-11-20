"""
CLI Tool for Restaurant Data Hub
명령줄 인터페이스
"""
import asyncio
import click
from loguru import logger

from src.database.connection import init_db
from src.workflows.scraping import ScrapingWorkflow
from src.workflows.sync import SyncWorkflow
from src.processors.gemini import GeminiProcessor
from src.database.connection import db_session
from src.database.models import ScrapingTarget
import uuid


@click.group()
def cli():
    """Restaurant Data Hub CLI"""
    pass


@cli.command()
def init():
    """데이터베이스 초기화"""
    click.echo("Initializing database...")
    init_db()
    click.echo("✅ Database initialized!")


@cli.command()
def scrape():
    """스크래핑 실행"""
    click.echo("Starting scraping workflow...")
    
    async def run():
        workflow = ScrapingWorkflow()
        await workflow.run_daily_scraping()
    
    asyncio.run(run())
    click.echo("✅ Scraping completed!")


@cli.command()
def process():
    """원본 데이터 처리"""
    click.echo("Processing raw data with Gemini AI...")
    
    async def run():
        from src.database.models import RawRestaurantData, ProcessedRestaurant
        
        with db_session() as db:
            # pending 상태 데이터 가져오기
            raw_data = db.query(RawRestaurantData).filter(
                RawRestaurantData.status == 'pending'
            ).limit(100).all()
            
            click.echo(f"Found {len(raw_data)} pending records")
            
            if not raw_data:
                click.echo("No pending data to process")
                return
            
            gemini = GeminiProcessor()
            processed_count = 0
            
            for idx, raw in enumerate(raw_data):
                try:
                    # Rate Limit 방지를 위한 delay (분당 10개 제한 → 8개/60초로 안전하게)
                    if idx > 0 and idx % 8 == 0:
                        click.echo(f"  → Rate limit protection: waiting 60 seconds... ({idx}/{len(raw_data)} processed)")
                        await asyncio.sleep(60)
                    
                    # Gemini로 정제 (재시도 로직 포함)
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
                                    click.echo(f"  ⚠️ Rate limit hit! Retrying in {wait_time}s... (attempt {retry_count}/{max_retries})")
                                    await asyncio.sleep(wait_time)
                                else:
                                    click.echo(f"  ❌ Max retries exceeded for: {raw.source_id}")
                                    raise
                            else:
                                raise
                    
                    if refined is None:
                        raise Exception("Failed to refine data after retries")
                    
                    # 품질 점수 계산
                    quality = await gemini.calculate_quality_score(raw.raw_data)
                    
                    # DB에 저장
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
                    
                    # raw 데이터 상태 업데이트
                    raw.status = 'processed'
                    
                    processed_count += 1
                    click.echo(f"✓ Processed: {refined.get('name', 'Unknown')}")
                    
                except Exception as e:
                    raw.status = 'failed'
                    raw.error_message = str(e)
                    logger.error(f"Failed to process {raw.id}: {e}")
                    click.echo(f"✗ Failed: {raw.source_id}")
            
            db.commit()
            click.echo(f"\n✅ Processed {processed_count}/{len(raw_data)} records")
    
    asyncio.run(run())
    click.echo("✅ Processing completed!")


@cli.command()
def sync():
    """한식당 동기화"""
    click.echo("Syncing to 한식당...")
    
    async def run():
        workflow = SyncWorkflow()
        await workflow.sync_to_hansikdang()
    
    asyncio.run(run())
    click.echo("✅ Sync completed!")


@cli.command()
@click.argument('keyword')
@click.option('--region', default=None, help='지역 (예: 강남구)')
@click.option('--priority', default=5, help='우선순위 (1-10)')
def add_target(keyword, region, priority):
    """스크래핑 타겟 추가"""
    with db_session() as db:
        target = ScrapingTarget(
            id=str(uuid.uuid4()),
            keyword=keyword,
            region=region,
            priority=priority,
            status='active',
            created_by='cli'
        )
        db.add(target)
        db.commit()
    
    click.echo(f"✅ Target added: {keyword} ({region})")


@cli.command()
@click.option('--region', default='강남구', help='지역')
@click.option('--count', default=50, help='생성할 키워드 수')
def generate_targets(region, count):
    """AI로 타겟 키워드 자동 생성"""
    click.echo(f"Generating {count} target keywords for {region}...")
    
    async def run():
        gemini = GeminiProcessor()
        keywords = await gemini.generate_target_keywords(region, count)
        
        with db_session() as db:
            for keyword in keywords:
                target = ScrapingTarget(
                    id=str(uuid.uuid4()),
                    keyword=keyword,
                    region=region,
                    priority=5,
                    status='active',
                    created_by='ai'
                )
                db.add(target)
            db.commit()
        
        click.echo(f"✅ Generated {len(keywords)} targets")
    
    asyncio.run(run())


@cli.command()
def full_pipeline():
    """전체 파이프라인 실행 (스크래핑 → 처리 → 동기화)"""
    click.echo("Running full pipeline...")
    
    async def run():
        # 1. 스크래핑
        click.echo("Step 1/3: Scraping...")
        scrape_workflow = ScrapingWorkflow()
        await scrape_workflow.run_daily_scraping()
        
        # 2. 처리
        click.echo("Step 2/3: Processing...")
        await scrape_workflow.process_raw_data(batch_size=100)
        
        # 3. 동기화
        click.echo("Step 3/3: Syncing...")
        sync_workflow = SyncWorkflow()
        await sync_workflow.sync_to_hansikdang()
    
    asyncio.run(run())
    click.echo("✅ Full pipeline completed!")


@cli.command()
@click.argument('json_file')
@click.option('--source', default='google_places', help='데이터 소스')
def import_json(json_file, source):
    """JSON 파일에서 레스토랑 데이터 임포트"""
    import json
    from src.database.models import RawRestaurantData
    
    click.echo(f"Importing from {json_file}...")
    
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    click.echo(f"Found {len(data)} restaurants")
    
    with db_session() as db:
        count = 0
        for item in data:
            try:
                # 위치 정보 추출
                location = item.get('location', {})
                lat = location.get('lat')
                lng = location.get('lng')
                
                # raw_data에 lat/lng 추가
                raw_data = {**item, 'lat': lat, 'lng': lng}
                
                raw = RawRestaurantData(
                    id=str(uuid.uuid4()),
                    source=source,
                    source_id=item.get('placeId', item.get('id', str(uuid.uuid4()))),
                    raw_data=raw_data,
                    status='pending'
                )
                db.add(raw)
                count += 1
            except Exception as e:
                logger.error(f"Failed to import: {e}")
        
        db.commit()
        click.echo(f"✅ Imported {count}/{len(data)} restaurants")


@cli.command()
@click.option('--query', default='홍대 한식', help='검색 쿼리')
@click.option('--limit', default=100, help='수집할 최대 개수')
def scrape_naver(query, limit):
    """네이버 Maps API로 레스토랑 데이터 수집"""
    click.echo(f"🔍 Naver Maps API: {query} (limit={limit})")
    
    async def run():
        from src.scrapers.naver_maps_api import NaverMapsScraper
        
        scraper = NaverMapsScraper()
        result = await scraper.scrape(query=query, limit=limit)
        
        click.echo(f"\n✅ 네이버 Maps API 수집 완료!")
        click.echo(f"  - 검색 쿼리: {result['query']}")
        click.echo(f"  - 발견: {result['total_found']}개")
        click.echo(f"  - 저장: {result['saved_count']}개")
        click.echo(f"  - 중복: {result['duplicate_count']}개")
    
    asyncio.run(run())


@cli.command()
def stats():
    """전체 통계 확인"""
    from src.database.models import RawRestaurantData, ProcessedRestaurant
    
    with db_session() as db:
        total_raw = db.query(RawRestaurantData).count()
        total_processed = db.query(ProcessedRestaurant).count()
        total_synced = db.query(ProcessedRestaurant).filter(
            ProcessedRestaurant.synced_to_hansikdang == True
        ).count()
        
        raw_pending = db.query(RawRestaurantData).filter(
            RawRestaurantData.status == 'pending'
        ).count()
        
        # 소스별 통계
        naver_count = db.query(RawRestaurantData).filter(
            RawRestaurantData.source == 'naver'
        ).count()
        google_count = db.query(RawRestaurantData).filter(
            RawRestaurantData.source == 'google_places'
        ).count()
        
        click.echo("\n📊 Data Hub 통계")
        click.echo("=" * 50)
        click.echo(f"Total raw: {total_raw}")
        click.echo(f"  - Naver: {naver_count}")
        click.echo(f"  - Google: {google_count}")
        click.echo(f"Total processed: {total_processed}")
        click.echo(f"Total synced: {total_synced}")
        click.echo(f"Pending processing: {raw_pending}")
        click.echo(f"Daily target: 333")
        click.echo("=" * 50)


if __name__ == '__main__':
    cli()
