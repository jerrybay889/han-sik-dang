# Restaurant Data Hub 배포 가이드

## 🎯 목표
1개월에 1만 개 레스토랑 데이터 자동 수집 및 관리

## 📋 사전 준비

### 1. API 키 발급

#### Apify (네이버플레이스 스크래핑)
1. https://apify.com 가입
2. 플랜: Starter ($49/월)
3. API Token 복사

#### Outscraper (구글맵스 스크래핑)
1. https://outscraper.com 가입
2. 크레딧 구매 ($10 = 1,000개)
3. API Key 복사

#### Bright Data (선택 - 프록시)
1. https://brightdata.com 가입
2. Residential Proxies 선택
3. 한국 IP 프록시 설정

#### Gemini API (무료!)
- 이미 설정된 GEMINI_API_KEY 재사용 가능

---

## 🚀 Replit에서 실행 (개발/테스트)

### 1. Python 패키지 설치
```bash
cd data-hub
pip install -r requirements.txt
```

### 2. 환경 변수 설정
Replit Secrets에 추가:
```
DATA_HUB_DATABASE_URL=postgresql://...  # 별도 Supabase 인스턴스
GEMINI_API_KEY=your_key
APIFY_API_TOKEN=your_token
OUTSCRAPER_API_KEY=your_key
HANSIKDANG_API_URL=http://localhost:5000
DATA_COLLECTION_API_KEY=your_existing_key
```

### 3. 데이터베이스 초기화
```bash
cd data-hub
python cli.py init
```

### 4. 타겟 키워드 생성 (AI)
```bash
python cli.py generate-targets --region 강남구 --count 50
```

### 5. 테스트 실행
```bash
# 스크래핑 테스트 (소량)
python cli.py scrape

# 데이터 처리 테스트
python cli.py process

# 한식당 동기화 테스트
python cli.py sync
```

---

## ☁️ Google Cloud Run 배포 (프로덕션)

### 왜 Cloud Run?
- ✅ 사용한 만큼만 과금 (실행 안 하면 $0)
- ✅ Auto-scaling (부하 증가 시 자동 확장)
- ✅ 한식당과 같은 Google Cloud 생태계
- ✅ 크론 잡 내장 (Cloud Scheduler)

### 1. Google Cloud 설정

```bash
# gcloud CLI 설치
curl https://sdk.cloud.google.com | bash

# 로그인
gcloud auth login

# 프로젝트 설정
gcloud config set project YOUR_PROJECT_ID
```

### 2. Docker 이미지 빌드 & 푸시

```bash
cd data-hub

# 이미지 빌드
docker build -t gcr.io/YOUR_PROJECT_ID/data-hub .

# Google Container Registry에 푸시
docker push gcr.io/YOUR_PROJECT_ID/data-hub
```

### 3. Cloud Run 배포

```bash
gcloud run deploy data-hub \
  --image gcr.io/YOUR_PROJECT_ID/data-hub \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --set-env-vars DATA_HUB_DATABASE_URL=postgresql://... \
  --set-env-vars GEMINI_API_KEY=... \
  --set-env-vars APIFY_API_TOKEN=... \
  --set-env-vars OUTSCRAPER_API_KEY=... \
  --set-env-vars HANSIKDANG_API_URL=... \
  --set-env-vars DATA_COLLECTION_API_KEY=... \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600 \
  --max-instances 5
```

### 4. Cloud Scheduler (크론 잡) 설정

```bash
# 매일 오후 2시: 스크래핑
gcloud scheduler jobs create http daily-scraping \
  --schedule="0 14 * * *" \
  --uri="https://YOUR_CLOUD_RUN_URL/api/scrape/start" \
  --http-method=POST \
  --time-zone="Asia/Seoul"

# 매일 오후 4시: 데이터 처리
gcloud scheduler jobs create http daily-processing \
  --schedule="0 16 * * *" \
  --uri="https://YOUR_CLOUD_RUN_URL/api/process/start" \
  --http-method=POST \
  --time-zone="Asia/Seoul"

# 매일 새벽 3시: 한식당 동기화
gcloud scheduler jobs create http daily-sync \
  --schedule="0 3 * * *" \
  --uri="https://YOUR_CLOUD_RUN_URL/api/sync/start" \
  --http-method=POST \
  --time-zone="Asia/Seoul"
```

---

## 📊 모니터링

### Grafana Cloud (무료)

1. https://grafana.com 가입
2. Data Source 추가: PostgreSQL (Supabase)
3. Dashboard 생성:
   - 일일 수집 현황
   - 에러율
   - 품질 점수 분포
   - 동기화 상태

### Better Stack (무료)

1. https://betterstack.com 가입
2. Uptime Monitoring 설정
3. 알림: 이메일/SMS

---

## 💰 예상 비용 (월)

```
Apify Starter:          $49
Outscraper:            $150 (15,000개 × $0.01)
Bright Data:            $50 (선택)
Google Cloud Run:       $30 (컨테이너)
Gemini API:             $50 (데이터 정제)
Supabase Pro:           $25 (별도 DB)
──────────────────────────
총 비용:              $354/월
──────────────────────────
업체당 비용:          $0.035 (3.5센트)
```

### 비용 절감 팁
- Apify 대신 Playwright 직접 구현 ($49 절감)
- 수집 속도 조절 (하루 200개 → 월 $200)
- Gemini 프롬프트 최적화 (토큰 사용 최소화)

---

## 🔧 트러블슈팅

### 스크래핑 차단
- Bright Data 프록시 사용
- User-Agent 랜덤화
- 딜레이 추가 (3-5초)

### Gemini API 할당량 초과
- 배치 사이즈 줄이기 (50 → 20)
- 프롬프트 최적화
- Gemini 1.5 Flash 사용 (더 저렴)

### 데이터베이스 연결 오류
- Supabase Connection Pooler 사용
- SQLAlchemy NullPool 설정
- 타임아웃 증가 (30s → 60s)

---

## 📈 확장 계획

### Phase 1 (현재)
- 1개월 1만 개 수집
- 네이버 + 구글 통합
- 품질 점수 70 이상만 동기화

### Phase 2 (3개월)
- 리뷰 데이터 수집
- 메뉴판 OCR (Google Vision)
- 사진 크롤링

### Phase 3 (6개월)
- 실시간 업데이트 감지
- 폐업 업체 자동 제거
- 사용자 피드백 반영

---

## 🎯 성공 지표

### 데이터 품질
- 평균 품질 점수 > 80
- GPS 정확도 > 95%
- 중복률 < 5%

### 운영 효율
- 스크래핑 성공률 > 90%
- 동기화 성공률 > 95%
- 일일 다운타임 < 10분

### 비용 효율
- 업체당 비용 < $0.05
- 월 총 비용 < $500
- ROI (광고 수익 대비) > 300%

---

## 📞 지원

문제 발생 시:
1. 로그 확인: `python cli.py logs`
2. 데이터베이스 상태: API `/api/stats`
3. GitHub Issues 등록
