# 🚀 Restaurant Data Hub - 시작 가이드

## ✅ 시스템 준비 완료!

데이터베이스가 초기화되었고, 테스트 타겟이 추가되었습니다.

---

## 📡 API 서버 실행 방법

### 방법 1: 직접 실행 (권장)

```bash
cd data-hub
python3 -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```

**접속 URL:**
- API 서버: `http://localhost:8000`
- 자동 문서: `http://localhost:8000/docs` (Swagger UI)
- 대체 문서: `http://localhost:8000/redoc`

### 방법 2: 스크립트 실행

```bash
cd data-hub
./start_server.sh
```

---

## 🔍 API 엔드포인트 테스트

### 1. Health Check
```bash
curl http://localhost:8000/
```

### 2. 시스템 통계
```bash
curl http://localhost:8000/api/stats
```

### 3. 스크래핑 타겟 목록
```bash
curl http://localhost:8000/api/targets
```

### 4. 원본 레스토랑 데이터
```bash
curl http://localhost:8000/api/restaurants/raw?limit=10
```

### 5. 스크래핑 로그
```bash
curl http://localhost:8000/api/logs/scraping?limit=10
```

---

## 🎯 다음 단계

### 1. AI로 타겟 키워드 자동 생성
```bash
cd data-hub
python3 cli.py generate-targets --region 강남구 --count 50
```

### 2. 스크래핑 실행 (Apify API 필요)
```bash
# .env 파일에 APIFY_API_TOKEN 추가 후
python3 cli.py scrape
```

### 3. 데이터 처리 (Gemini AI)
```bash
python3 cli.py process
```

### 4. 한식당 동기화
```bash
python3 cli.py sync
```

### 5. 전체 파이프라인 실행
```bash
python3 cli.py full-pipeline
```

---

## 🌐 Replit 웹뷰에서 접속하기

Replit에서 API 서버를 실행하면, Webview 탭에서 자동으로 접속 가능합니다:

1. **터미널에서 실행:**
   ```bash
   cd data-hub && python3 -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000
   ```

2. **Webview 탭 클릭** 또는 URL 뒤에 포트 추가:
   ```
   https://your-repl-url.replit.dev:8000
   ```

3. **API 문서 자동 생성:**
   ```
   https://your-repl-url.replit.dev:8000/docs
   ```

---

## 📊 현재 상태

- ✅ 데이터베이스: 7개 테이블 생성 완료
- ✅ 테스트 타겟: 2개 추가 (강남 냉면, 이태원 한정식)
- ✅ API 서버: 준비 완료
- ⏳ 스크래핑: API 키 설정 필요
- ⏳ AI 처리: Gemini API 사용 가능
- ⏳ 한식당 연동: External API 준비 완료

---

## 💡 유용한 명령어

```bash
# 시스템 상태 확인
python3 cli.py

# 타겟 추가
python3 cli.py add-target "명동 한정식" --region 중구

# 데이터베이스 초기화 (주의!)
python3 cli.py init

# API 서버 + 자동 재시작
python3 -m uvicorn src.api.main:app --reload --port 8000
```

---

## 📚 문서

- **QUICK_START.md**: 5분 빠른 시작
- **DEPLOYMENT_GUIDE.md**: Google Cloud Run 배포
- **README.md**: 전체 아키텍처
- **API Docs**: http://localhost:8000/docs (서버 실행 후)

---

**질문이나 문제가 있으신가요?**  
`python3 cli.py --help` 명령어로 사용 가능한 모든 명령어를 확인하세요!
