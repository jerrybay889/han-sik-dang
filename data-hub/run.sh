#!/bin/bash
# Restaurant Data Hub 실행 스크립트

set -e

echo "🚀 Restaurant Data Hub"
echo ""

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "⚠️  .env 파일이 없습니다. .env.example을 복사하세요."
    cp .env.example .env
    echo "✅ .env 파일이 생성되었습니다. 환경 변수를 설정해주세요."
    exit 1
fi

# 명령어 파싱
case "$1" in
    init)
        echo "📦 데이터베이스 초기화..."
        python cli.py init
        ;;
    
    scrape)
        echo "🔍 스크래핑 시작..."
        python cli.py scrape
        ;;
    
    process)
        echo "⚙️  데이터 처리 시작..."
        python cli.py process
        ;;
    
    sync)
        echo "🔄 한식당 동기화..."
        python cli.py sync
        ;;
    
    pipeline)
        echo "🚀 전체 파이프라인 실행..."
        python cli.py full-pipeline
        ;;
    
    server)
        echo "🌐 API 서버 시작..."
        python -m src.api.main
        ;;
    
    cron)
        echo "⏰ 크론 스케줄러 시작..."
        python cron_schedule.py
        ;;
    
    *)
        echo "사용법:"
        echo "  ./run.sh init      - DB 초기화"
        echo "  ./run.sh scrape    - 스크래핑"
        echo "  ./run.sh process   - 데이터 처리"
        echo "  ./run.sh sync      - 한식당 동기화"
        echo "  ./run.sh pipeline  - 전체 파이프라인"
        echo "  ./run.sh server    - API 서버"
        echo "  ./run.sh cron      - 크론 스케줄러"
        exit 1
        ;;
esac
