#!/bin/bash
# Data Hub API Server Startup Script

echo "🚀 Starting Restaurant Data Hub API Server..."
echo ""

cd "$(dirname "$0")"

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "⚠️  .env 파일이 없습니다."
    cp .env.example .env
    echo "✅ .env 파일이 생성되었습니다."
fi

# DB 초기화 (처음 한 번만)
if [ ! -f .db_initialized ]; then
    echo "📦 데이터베이스 초기화 중..."
    python3 cli.py init
    touch .db_initialized
    echo "✅ 데이터베이스 초기화 완료"
    echo ""
fi

# API 서버 시작
echo "🌐 API 서버 시작 (포트 8000)..."
echo "📍 접속: http://localhost:8000"
echo "📚 API 문서: http://localhost:8000/docs"
echo ""

exec python3 -m uvicorn src.api.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload \
    --log-level info
