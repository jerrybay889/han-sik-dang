# 🚀 hansikdang-data-hub 새 Repl 설정 완전 가이드

## 📦 Step 1: 환경 변수 설정 (2분)

hansikdang-data-hub Repl에서:

1. **Tools (🔧) 아이콘 클릭**
2. **Secrets 선택**
3. **Add new secret 클릭**
4. 아래 값들을 하나씩 추가:

### 📋 복사할 환경 변수

**파일 확인:** `/tmp/env_values_for_new_repl.txt` 파일에 모든 값이 준비되어 있습니다!

```bash
# 터미널에서 확인:
cat /tmp/env_values_for_new_repl.txt
```

---

## 📥 Step 2: data-hub 폴더 다운로드 (5분)

### 방법 A: 압축 파일 다운로드 (권장)

**준비 완료:** `data-hub-package.tar.gz` 파일이 생성되었습니다!

1. **현재 hansikdang Repl의 Files 패널에서:**
   - `data-hub-package.tar.gz` 파일 찾기
   - 파일 우클릭 → **Download**

2. **hansikdang-data-hub Repl에서:**
   - Files 패널에서 빈 공간 우클릭 → **Upload file**
   - `data-hub-package.tar.gz` 업로드
   
3. **Shell에서 압축 해제:**
   ```bash
   tar -xzf data-hub-package.tar.gz
   rm data-hub-package.tar.gz
   ```

### 방법 B: 폴더 직접 다운로드

1. **Files 패널에서 `data-hub` 폴더 찾기**
2. **우클릭 → Download**
3. **hansikdang-data-hub Repl에서 Upload folder**

---

## 🔧 Step 3: 자동 설정 실행 (5분)

hansikdang-data-hub Repl Shell에서:

```bash
# 실행 권한 부여
chmod +x setup_new_repl.sh

# 자동 설정 시작
./setup_new_repl.sh
```

**이 스크립트가 자동으로:**
- ✅ 환경 변수 확인
- ✅ Python 패키지 설치 (FastAPI, SQLAlchemy, Apify 등)
- ✅ .env 파일 생성
- ✅ PostgreSQL 데이터베이스 초기화 (7개 테이블)
- ✅ 테스트 타겟 2개 추가 (강남 냉면, 이태원 한정식)
- ✅ 시스템 상태 확인

**예상 출력:**
```
🚀 Restaurant Data Hub - 새 Repl 설정 시작
==========================================

📋 1/6: 환경 변수 확인 중...
✅ 필수 환경 변수 확인 완료

📦 2/6: Python 패키지 설치 중...
✅ Python 패키지 설치 완료

📝 3/6: .env 파일 생성 중...
✅ .env 파일 생성 완료

🗄️  4/6: 데이터베이스 초기화 중...
✅ 데이터베이스 초기화 완료

🎯 5/6: 테스트 타겟 추가 중...
✅ 테스트 타겟 추가 완료

✅ 6/6: 시스템 상태 확인
============================================================
  🏪 Restaurant Data Hub - System Status
============================================================

📍 Scraping Targets: 2 total, 2 active
📦 Raw Data: 0 total, 0 pending
✨ Processed Data: 0 total, 0 synced
🔗 ID Mappings: 0 naver↔google pairs
📋 Logs: 0 scraping, 0 sync

🎉 Data Hub 설정 완료!
```

---

## 🌐 Step 4: API 서버 실행 및 테스트 (5분)

```bash
python3 -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```

**접속 확인:**

1. **Webview 탭 클릭** (Replit 우측 상단)
2. **포트 8000으로 접속**
3. **`/docs` 경로 접속** → Swagger UI 자동 문서 확인

**테스트할 엔드포인트:**
- `GET /` - Health check
- `GET /api/stats` - 시스템 통계
- `GET /api/targets` - 스크래핑 타겟 목록
- `GET /api/restaurants/raw` - 원본 데이터
- `GET /api/logs/scraping` - 로그

---

## 🚀 Step 5: Replit 배포 (5분)

1. **Publish 버튼 클릭** (Replit 우측 상단)
2. **Deployment Type 선택: Autoscale**
3. **Deploy 클릭**
4. **배포 완료 대기** (약 2-3분)
5. **배포된 URL 확인**: `https://hansikdang-data-hub.replit.app`

---

## 🌍 Step 6: 하위 도메인 연결 (10분)

### 6-1. Replit에서 IP 주소 확인

```
Deployments → Settings → Link a domain
→ 입력: data-hub.hansikdang.net
→ Replit이 표시하는 IP 주소 복사
```

### 6-2. DNS 설정

hansikdang.net의 DNS 관리 페이지에서:

```
Type:  A
Name:  data-hub
Value: [Replit이 제공한 IP 주소]
TTL:   3600
```

### 6-3. DNS 전파 확인 (5~30분)

```bash
# 터미널에서
nslookup data-hub.hansikdang.net

# 또는 웹사이트
https://dnschecker.org
```

---

## ✅ 최종 확인

### 접속 테스트

```
https://data-hub.hansikdang.net/
https://data-hub.hansikdang.net/docs
https://data-hub.hansikdang.net/api/stats
```

### 첫 스크래핑 테스트

```bash
# Shell에서
python3 cli.py scrape
```

---

## 🎯 완료!

**매일 모니터링할 URL:**
```
https://data-hub.hansikdang.net/docs
```

**24/7 자동화 활성화:**
```bash
nohup python3 cron_schedule.py &
```

---

## 🆘 문제 해결

**환경 변수 오류:**
```bash
# Secrets 확인
python3 -c "import os; print('DATABASE_URL:', 'OK' if os.getenv('DATABASE_URL') else 'MISSING')"
```

**DB 연결 오류:**
```bash
python3 -c "from src.database.connection import db_session; print('✅ DB 연결 성공')"
```

**패키지 설치 오류:**
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

---

**다음 문서:** 
- `data-hub/START_HERE.md` - 사용 가이드
- `data-hub/DEPLOYMENT_GUIDE.md` - Cloud Run 배포
- `data-hub/QUICK_START.md` - 빠른 시작
