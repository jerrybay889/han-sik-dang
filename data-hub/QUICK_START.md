# 빠른 시작 가이드

## 5분 안에 시작하기 🚀

### 1단계: 환경 변수 설정 (2분)

```bash
cd data-hub
cp .env.example .env
```

`.env` 파일 편집:
```bash
# 필수 (지금 당장)
GEMINI_API_KEY=your_key_here

# 나중에 (Apify 가입 후)
APIFY_API_TOKEN=
OUTSCRAPER_API_KEY=

# 기존 한식당 설정 재사용
DATA_COLLECTION_API_KEY=your_existing_key
HANSIKDANG_API_URL=http://localhost:5000
```

### 2단계: 의존성 설치 (1분)

```bash
pip install -r requirements.txt
```

### 3단계: 데이터베이스 초기화 (30초)

```bash
python cli.py init
```

### 4단계: AI로 타겟 생성 (1분)

```bash
# 강남구 한식당 키워드 50개 자동 생성
python cli.py generate-targets --region 강남구 --count 50
```

### 5단계: 테스트 실행 (30초)

```bash
# 수동으로 타겟 추가 (Apify 없이 테스트)
python cli.py add-target "강남 냉면" --region 강남구

# API 서버 시작
python -m src.api.main
```

브라우저에서 확인:
- http://localhost:8000 (API 서버)
- http://localhost:8000/api/stats (통계)
- http://localhost:8000/api/targets (타겟 목록)

---

## 실제 스크래핑 (Apify 필요)

### 1. Apify 가입
1. https://apify.com 가입
2. Starter 플랜 ($49/월)
3. API Token 복사 → `.env`에 추가

### 2. 스크래핑 시작
```bash
# 전체 파이프라인 (스크래핑 → 처리 → 동기화)
python cli.py full-pipeline
```

### 3. 자동화 (크론)
```bash
# 백그라운드에서 실행
nohup python cron_schedule.py &
```

---

## 다음 단계

✅ DEPLOYMENT_GUIDE.md: Google Cloud Run 배포  
✅ README.md: 전체 문서  
✅ API 문서: http://localhost:8000/docs (FastAPI 자동 생성)

---

## 도움이 필요하신가요?

**명령어 한눈에 보기**:
```bash
./run.sh init       # DB 초기화
./run.sh scrape     # 스크래핑
./run.sh process    # 데이터 처리
./run.sh sync       # 한식당 동기화
./run.sh pipeline   # 전체 파이프라인
./run.sh server     # API 서버
./run.sh cron       # 크론 스케줄러
```
