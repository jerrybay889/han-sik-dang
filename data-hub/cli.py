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
        workflow = ScrapingWorkflow()
        await workflow.process_raw_data(batch_size=100)
    
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


if __name__ == '__main__':
    cli()
