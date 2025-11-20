# ✅ Data Hub → 새 Repl 복사 체크리스트

## 🎯 목표
`hansikdang` Repl의 `data-hub/` 폴더를 → `hansikdang-data-hub` Repl로 완전히 이동

---

## 📦 방법 1: Replit 파일 시스템 사용 (가장 쉬움)

### **단계별 가이드:**

1. **현재 Repl (hansikdang)에서:**
   - 왼쪽 Files 패널에서 `data-hub` 폴더 찾기
   - `data-hub` 폴더 우클릭 → **Download**
   - `data-hub.zip` 파일이 다운로드됨

2. **새 Repl (hansikdang-data-hub)로 이동:**
   - hansikdang-data-hub Repl 열기
   - Files 패널에서 빈 공간 우클릭 → **Upload files** 또는 **Upload folder**
   - 다운로드한 `data-hub.zip` 업로드 또는 압축 해제한 폴더 업로드

3. **폴더 구조 확인:**
   ```
   hansikdang-data-hub/
   ├── src/
   │   ├── api/
   │   ├── database/
   │   ├── scrapers/
   │   ├── processors/
   │   └── workflows/
   ├── cli.py
   ├── config.py
   ├── requirements.txt
   └── ...
   ```

---

## 📦 방법 2: 터미널 복사 (고급)

### **hansikdang Repl Shell:**

```bash
# data-hub 폴더 압축
cd /home/runner/workspace
tar -czf data-hub-backup.tar.gz data-hub/

# 다운로드 (Webview에서 접근 가능하도록)
cp data-hub-backup.tar.gz ~/workspace/
```

### **hansikdang-data-hub Repl Shell:**

```bash
# 압축 파일 업로드 후
tar -xzf data-hub-backup.tar.gz
mv data-hub/* .
rm -rf data-hub
```

---

## 📋 복사해야 할 필수 파일 목록

### **✅ 루트 파일들**
- [ ] `cli.py` - CLI 도구
- [ ] `config.py` - 설정
- [ ] `cron_schedule.py` - 크론 스케줄러
- [ ] `requirements.txt` - Python 의존성
- [ ] `.env.example` - 환경 변수 예제
- [ ] `setup_new_repl.sh` - 자동 설정 스크립트
- [ ] `DEPLOYMENT_TO_NEW_REPL.md` - 배포 가이드
- [ ] `START_HERE.md` - 시작 가이드
- [ ] `QUICK_START.md` - 빠른 시작
- [ ] `DEPLOYMENT_GUIDE.md` - Cloud Run 가이드
- [ ] `README.md` - 전체 문서

### **✅ src/ 폴더**
- [ ] `src/__init__.py`
- [ ] `src/api/__init__.py`
- [ ] `src/api/main.py` - FastAPI 메인
- [ ] `src/database/__init__.py`
- [ ] `src/database/connection.py` - DB 연결
- [ ] `src/database/models.py` - 7개 테이블 모델
- [ ] `src/scrapers/__init__.py`
- [ ] `src/scrapers/base.py` - 스크래퍼 베이스
- [ ] `src/scrapers/naver.py` - Naver Place (Apify)
- [ ] `src/scrapers/google.py` - Google Maps (Outscraper)
- [ ] `src/processors/__init__.py`
- [ ] `src/processors/gemini.py` - Gemini AI 프로세서
- [ ] `src/workflows/__init__.py`
- [ ] `src/workflows/scraping.py` - 스크래핑 워크플로우
- [ ] `src/workflows/sync.py` - 한식당 동기화

### **⚠️ 복사하지 말 것**
- ❌ `__pycache__/` 폴더들
- ❌ `.pyc` 파일들
- ❌ `venv/` 또는 `.venv/`
- ❌ `.db_initialized` (자동 생성됨)
- ❌ `*.log` 파일들
- ❌ `api_server.pid`

---

## 🔧 복사 후 설정

### **1. Replit Secrets 설정**

hansikdang-data-hub Repl에서:

```
Tools (🔧) → Secrets → Add new secret
```

**필수:**
- `DATABASE_URL` - Supabase PostgreSQL URL
- `GEMINI_API_KEY` - Google Gemini API 키
- `APIFY_API_TOKEN` - Apify API 토큰
- `DATA_COLLECTION_API_KEY` - 한식당 External API 키

**선택:**
- `OUTSCRAPER_API_KEY` - Google Maps 스크래핑용 (선택)
- `SESSION_SECRET` - 32자 랜덤 문자열

### **2. 자동 설정 실행**

```bash
# hansikdang-data-hub Repl Shell에서
chmod +x setup_new_repl.sh
./setup_new_repl.sh
```

**이 스크립트가 자동으로 실행:**
1. ✅ 환경 변수 확인
2. ✅ Python 패키지 설치
3. ✅ .env 파일 생성
4. ✅ 데이터베이스 초기화 (7개 테이블)
5. ✅ 테스트 타겟 추가 (2개)
6. ✅ 시스템 상태 확인

### **3. API 서버 실행**

```bash
python3 -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## ✅ 검증 체크리스트

### **파일 구조 확인**
```bash
ls -la
# 출력에 cli.py, config.py, requirements.txt, src/ 등이 보여야 함
```

### **Python 패키지 확인**
```bash
pip list | grep -E "(fastapi|sqlalchemy|apify|google-generativeai)"
```

### **DB 연결 확인**
```bash
python3 -c "from src.database.connection import db_session; print('✅ DB 연결 성공')"
```

### **API 서버 확인**
```bash
curl http://localhost:8000/ | python3 -m json.tool
```

---

## 🚀 완료 후

1. **Publish** 버튼 클릭
2. **Deployment Type**: Autoscale 선택
3. **Deploy** 실행
4. **Settings → Link a domain**
5. **입력**: `data-hub.hansikdang.net`
6. **DNS 설정**: Replit이 제공한 IP 주소로 A 레코드 추가

---

## 🆘 문제 해결

**파일이 너무 많아서 업로드가 안 되면:**
→ 방법 2 (터미널 복사) 사용

**Python 패키지 설치가 안 되면:**
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

**DB 연결 오류:**
→ Secrets에 `DATABASE_URL`이 올바르게 설정되었는지 확인

---

**다음 문서:** `DEPLOYMENT_TO_NEW_REPL.md` 참고
