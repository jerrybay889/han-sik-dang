# 📥 Data Hub 다운로드 및 업로드 가이드

## ✅ 문제 해결 완료!

**새 압축 파일:** `data-hub-complete.tar.gz` (22KB)

---

## 📥 Step 1: 압축 파일 다운로드

### **현재 hansikdang Repl에서:**

1. **Files 패널 (왼쪽)에서 `data-hub-complete.tar.gz` 찾기**
2. **파일 우클릭 → Download**
3. **컴퓨터에 저장**

**확인:**
- 파일 크기: 22KB (0 바이트가 아님!)
- 파일 이름: `data-hub-complete.tar.gz`

---

## 📤 Step 2: 새 Repl에 업로드

### **hansikdang-data-hub Repl로 이동:**

**2-1. 압축 파일 업로드**
```
Files 패널 → 빈 공간 우클릭 → Upload file
→ data-hub-complete.tar.gz 선택
```

**2-2. Shell에서 압축 해제**
```bash
# 압축 해제
tar -xzf data-hub-complete.tar.gz

# 압축 파일 삭제
rm data-hub-complete.tar.gz

# 파일 확인
ls -la
```

**예상 출력:**
```
cli.py
config.py
cron_schedule.py
requirements.txt
src/
├── __init__.py
├── api/
├── database/
├── scrapers/
├── processors/
└── workflows/
...
```

---

## 🔧 Step 3: 자동 설정 실행

```bash
# 실행 권한 부여
chmod +x setup_new_repl.sh

# 자동 설정 시작
./setup_new_repl.sh
```

**이 스크립트가 자동으로:**
- ✅ 환경 변수 확인 (Secrets에 설정한 값들)
- ✅ Python 패키지 설치
- ✅ .env 파일 생성
- ✅ PostgreSQL 데이터베이스 초기화 (7개 테이블)
- ✅ 테스트 타겟 2개 추가
- ✅ 시스템 상태 확인

---

## 🌐 Step 4: API 서버 실행

```bash
python3 -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```

**접속:**
- Webview 탭 클릭
- `/docs` 경로로 이동
- 30+ API 엔드포인트 확인!

---

## ✅ 완료 확인

### **파일 구조 확인:**
```bash
ls -la src/
```

**출력에 다음이 보여야 함:**
- `api/` - FastAPI 서버
- `database/` - DB 연결 및 모델
- `scrapers/` - Naver/Google 스크래퍼
- `processors/` - Gemini AI
- `workflows/` - 스크래핑/동기화 워크플로우

### **Python 패키지 확인:**
```bash
pip list | grep -E "(fastapi|sqlalchemy|apify)"
```

### **DB 연결 확인:**
```bash
python3 -c "from src.database.connection import db_session; print('✅ DB OK')"
```

---

## 🆘 문제 해결

**압축 파일이 0 바이트면:**
→ 이 가이드의 Step 1부터 다시 시작 (`data-hub-complete.tar.gz` 사용)

**압축 해제 오류:**
```bash
# 파일 확인
file data-hub-complete.tar.gz

# 다시 다운로드
```

**파일이 없으면:**
→ 압축 해제가 제대로 되지 않은 것. Shell에서 `tar -xzf` 명령어 다시 실행

---

## 📋 체크리스트

- [ ] `data-hub-complete.tar.gz` 다운로드 (22KB)
- [ ] hansikdang-data-hub Repl에 업로드
- [ ] `tar -xzf data-hub-complete.tar.gz` 실행
- [ ] `ls -la` 로 파일 확인
- [ ] Secrets 설정 완료 (5개 환경 변수)
- [ ] `./setup_new_repl.sh` 실행
- [ ] API 서버 실행 (`uvicorn`)
- [ ] `/docs` 접속 확인

---

**다음:** API 서버가 정상 작동하면 Publish (배포) 단계로 진행!
