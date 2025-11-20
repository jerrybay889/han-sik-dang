#!/bin/bash
# Data Hub 새 Repl 설정 자동화 스크립트

set -e  # 오류 발생 시 중단

echo "🚀 Restaurant Data Hub - 새 Repl 설정 시작"
echo "=========================================="
echo ""

# 1. 환경 변수 확인
echo "📋 1/6: 환경 변수 확인 중..."
required_vars=("DATABASE_URL" "GEMINI_API_KEY" "DATA_COLLECTION_API_KEY" "APIFY_API_TOKEN")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ 다음 환경 변수가 없습니다:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Replit Tools → Secrets에서 다음 변수를 추가하세요:"
    echo "   DATABASE_URL, GEMINI_API_KEY, DATA_COLLECTION_API_KEY, APIFY_API_TOKEN"
    echo ""
    exit 1
fi

echo "✅ 필수 환경 변수 확인 완료"
echo ""

# 2. Python 패키지 설치
echo "📦 2/6: Python 패키지 설치 중..."
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt 파일이 없습니다!"
    exit 1
fi

pip install -q -r requirements.txt
echo "✅ Python 패키지 설치 완료"
echo ""

# 3. .env 파일 생성 (환경 변수 백업)
echo "📝 3/6: .env 파일 생성 중..."
cat > .env << EOF
# Database
DATABASE_URL=${DATABASE_URL}

# AI
GEMINI_API_KEY=${GEMINI_API_KEY}

# Scraping
APIFY_API_TOKEN=${APIFY_API_TOKEN}
${OUTSCRAPER_API_KEY:+OUTSCRAPER_API_KEY=${OUTSCRAPER_API_KEY}}

# API
DATA_COLLECTION_API_KEY=${DATA_COLLECTION_API_KEY}

# Session
${SESSION_SECRET:+SESSION_SECRET=${SESSION_SECRET}}
EOF

echo "✅ .env 파일 생성 완료"
echo ""

# 4. 데이터베이스 초기화
echo "🗄️  4/6: 데이터베이스 초기화 중..."
python3 cli.py init
echo "✅ 데이터베이스 초기화 완료"
echo ""

# 5. 테스트 타겟 추가
echo "🎯 5/6: 테스트 타겟 추가 중..."
python3 cli.py add-target "강남 냉면" --region 강남구 --priority 10
python3 cli.py add-target "이태원 한정식" --region 용산구 --priority 8
echo "✅ 테스트 타겟 추가 완료"
echo ""

# 6. 시스템 상태 확인
echo "✅ 6/6: 시스템 상태 확인"
echo ""
python3 cli.py
echo ""

# 완료 메시지
echo "=========================================="
echo "🎉 Data Hub 설정 완료!"
echo "=========================================="
echo ""
echo "다음 명령어로 API 서버를 실행하세요:"
echo ""
echo "  python3 -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload"
echo ""
echo "접속 URL:"
echo "  - API: https://[your-repl].replit.dev:8000"
echo "  - 문서: https://[your-repl].replit.dev:8000/docs"
echo ""
