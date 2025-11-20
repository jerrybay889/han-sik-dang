# 🚀 Data Hub 새 Repl 배포 가이드

## 📋 환경 변수 설정 (Replit Secrets)

hansikdang-data-hub Repl에서 다음 환경 변수를 설정하세요:

### **필수 환경 변수**

1. **Tools 아이콘 (🔧) → Secrets 클릭**
2. 다음 변수들을 하나씩 추가:

```bash
# 1. PostgreSQL Database (Supabase)
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres

# 2. Google Gemini AI
GEMINI_API_KEY=AIzaSy...

# 3. Apify (Naver Place 스크래핑)
APIFY_API_TOKEN=apify_api_...

# 4. 한식당 External API 인증
DATA_COLLECTION_API_KEY=...

# 5. Session Secret (32자 랜덤 문자열)
SESSION_SECRET=...
```

### **선택 환경 변수**

```bash
# Google Maps 스크래핑 (선택사항)
OUTSCRAPER_API_KEY=...
```

---

## 📦 파일 복사 방법

### **방법 1: Replit 파일 업로드 (권장)**

1. 현재 hansikdang Repl에서 `data-hub/` 폴더 전체를 다운로드
2. hansikdang-data-hub Repl에서 업로드

### **방법 2: Git 사용**

```bash
# 현재 hansikdang Repl에서
cd data-hub
git init
git add .
git commit -m "Initial Data Hub commit"
git remote add origin <your-repo-url>
git push -u origin main

# hansikdang-data-hub Repl에서
git clone <your-repo-url> .
```

### **방법 3: 수동 복사 (모든 파일)**

다음 폴더/파일들을 복사:

```
data-hub/
├── src/
│   ├── api/
│   │   └── main.py                 # FastAPI 메인 앱
│   ├── database/
│   │   ├── connection.py           # DB 연결
│   │   └── models.py               # SQLAlchemy 모델 (7개 테이블)
│   ├── scrapers/
│   │   ├── apify_scraper.py        # Apify (Naver Place)
│   │   └── outscraper_scraper.py   # Outscraper (Google Maps)
│   ├── processors/
│   │   └── gemini.py               # Gemini AI 프로세서
│   └── workflows/
│       ├── scraping.py             # 스크래핑 워크플로우
│       ├── processing.py           # AI 처리 워크플로우
│       └── sync.py                 # 한식당 동기화
├── cli.py                          # CLI 도구
├── cron_schedule.py                # 크론 스케줄러
├── config.py                       # 설정
├── requirements.txt                # Python 의존성
├── Dockerfile                      # Docker 설정
├── .env.example                    # 환경 변수 예제
├── START_HERE.md                   # 시작 가이드
├── QUICK_START.md                  # 빠른 시작
└── DEPLOYMENT_GUIDE.md             # 배포 가이드
```

---

## 🔧 설치 및 초기화

### **1. Python 패키지 설치**

```bash
# hansikdang-data-hub Repl Shell에서
pip install -r requirements.txt
```

### **2. 데이터베이스 초기화**

```bash
# 7개 테이블 생성
python3 cli.py init

# 테스트 타겟 추가
python3 cli.py add-target "강남 냉면" --region 강남구 --priority 10
python3 cli.py add-target "이태원 한정식" --region 용산구 --priority 8
```

### **3. 시스템 상태 확인**

```bash
python3 cli.py
```

출력 예상:
```
============================================================
  🏪 Restaurant Data Hub - System Status
============================================================

📍 Scraping Targets: 2 total, 2 active
📦 Raw Data: 0 total, 0 pending
✨ Processed Data: 0 total, 0 synced
🔗 ID Mappings: 0 naver↔google pairs
📋 Logs: 0 scraping, 0 sync
```

---

## 🌐 API 서버 실행

```bash
python3 -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```

**접속:**
- API: `https://[your-repl].replit.dev:8000`
- 문서: `https://[your-repl].replit.dev:8000/docs`

---

## 🧪 테스트

### **1. Health Check**
```bash
curl https://[your-repl].replit.dev:8000/
```

### **2. 시스템 통계**
```bash
curl https://[your-repl].replit.dev:8000/api/stats
```

### **3. 첫 스크래핑 (Apify)**
```bash
python3 cli.py scrape
```

---

## 📤 배포 (Publish)

1. **Replit Console → Publish 버튼 클릭**
2. **Deployment Type 선택: Autoscale**
3. **Deploy 클릭**
4. **Settings → Link a domain**
5. **입력: `data-hub.hansikdang.net`**
6. **Replit이 제공하는 IP 주소 복사**

---

## 🌍 DNS 설정

hansikdang.net DNS 관리 페이지에서:

```
Type:  A
Name:  data-hub
Value: [Replit이 제공한 IP 주소]
TTL:   3600
```

**전파 대기:** 5~30분 (최대 48시간)

**확인:**
```bash
# 터미널에서
nslookup data-hub.hansikdang.net

# 또는 웹사이트
https://dnschecker.org
```

---

## ✅ 최종 확인

```bash
# 하위 도메인 접속
https://data-hub.hansikdang.net/

# API 문서
https://data-hub.hansikdang.net/docs

# 실시간 통계
https://data-hub.hansikdang.net/api/stats
```

---

## 🤖 24/7 자동화 활성화

```bash
# 크론 스케줄러 실행 (백그라운드)
nohup python3 cron_schedule.py &
```

**자동 작업:**
- 매일 00:00 - AI 타겟 생성
- 매일 02:00 - 스크래핑 실행
- 매일 04:00 - AI 처리
- 매일 06:00 - 한식당 동기화

---

## 📊 모니터링

**매일 확인할 URL:**
```
https://data-hub.hansikdang.net/docs
```

**주요 지표:**
- `/api/stats` - 전체 시스템 통계
- `/api/targets` - 스크래핑 타겟 목록
- `/api/logs/scraping` - 스크래핑 로그
- `/api/restaurants/raw` - 수집된 원본 데이터

---

## 🆘 문제 해결

**API 서버가 안 뜨면:**
```bash
# 로그 확인
cat /tmp/logs/*.log

# DB 연결 테스트
python3 -c "from src.database.connection import db_session; print('DB OK')"
```

**스크래핑이 안 되면:**
```bash
# Apify 크레딧 확인
https://console.apify.com/account/plan

# 환경 변수 확인
python3 -c "from config import APIFY_API_TOKEN; print('Token OK' if APIFY_API_TOKEN else 'Missing')"
```

---

**배포 완료 후 이 문서를 참고하여 매일 모니터링하세요!** 🎉
