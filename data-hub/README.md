# Restaurant Data Hub

## 목적
한식당 플랫폼을 위한 대규모 레스토랑 데이터 수집 및 관리 시스템

## 목표
- **1개월에 1만 개 레스토랑** 데이터 수집
- 네이버플레이스 + 구글맵스 통합 스크래핑
- Gemini AI 기반 데이터 정제 및 번역
- 한식당 메인 플랫폼과 API 연동

## 아키텍처

```
data-hub/
├── src/
│   ├── scrapers/          # 스크래핑 모듈
│   │   ├── naver.py       # 네이버플레이스 스크래퍼
│   │   ├── google.py      # 구글맵스 스크래퍼
│   │   └── base.py        # 공통 스크래퍼 인터페이스
│   ├── processors/        # 데이터 처리
│   │   ├── gemini.py      # Gemini AI 정제
│   │   ├── translator.py  # 다국어 번역
│   │   └── validator.py   # 품질 검증
│   ├── database/          # 데이터베이스
│   │   ├── models.py      # SQLAlchemy 모델
│   │   ├── connection.py  # DB 연결
│   │   └── migrations/    # 마이그레이션
│   ├── workflows/         # 워크플로우
│   │   ├── discovery.py   # 타겟 발견
│   │   ├── scraping.py    # 수집 워크플로우
│   │   └── sync.py        # 한식당 동기화
│   └── api/               # FastAPI 서버
│       ├── main.py        # API 엔트리포인트
│       └── routes/        # API 라우트
├── dashboard/             # Admin Dashboard
│   ├── src/
│   │   ├── pages/
│   │   └── components/
│   └── package.json
├── requirements.txt       # Python 의존성
├── Dockerfile            # Cloud Run 배포용
└── config.py             # 설정 관리
```

## 기술 스택
- **언어**: Python 3.11+
- **프레임워크**: FastAPI, SQLAlchemy
- **AI**: Google Gemini 2.0 Flash
- **스크래핑**: Apify, Outscraper, httpx
- **데이터베이스**: PostgreSQL (Supabase)
- **워크플로우**: Python asyncio + schedule

## 환경 변수
```bash
# Supabase (별도 인스턴스)
DATA_HUB_DATABASE_URL=

# API Keys
GEMINI_API_KEY=
APIFY_API_TOKEN=
OUTSCRAPER_API_KEY=
BRIGHT_DATA_PROXY_URL=

# 한식당 연동
HANSIKDANG_API_URL=
DATA_COLLECTION_API_KEY=
```

## 실행 방법
```bash
# 의존성 설치
pip install -r requirements.txt

# 데이터베이스 마이그레이션
python -m src.database.migrations.migrate

# API 서버 실행
python -m src.api.main

# 워크플로우 실행 (크론)
python -m src.workflows.scraping
```

## 배포
Google Cloud Run으로 배포 예정
