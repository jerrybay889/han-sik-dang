# 한식당 Data Hub 배포 가이드

## 📋 배포 개요

한식당 Data Hub를 프로덕션 환경에 배포하기 위한 단계별 가이드입니다.

---

## 🚀 Step 1: hansikdang-data-hub Repl에서 Publish 설정

### 1-1. Replit에서 Data Hub Repl 열기
1. Replit 대시보드로 이동
2. **hansikdang-data-hub** Repl 선택

### 1-2. Publish 버튼 클릭
1. 화면 상단의 **"Publish"** 버튼 클릭
2. 배포 옵션 선택 화면이 나타남

### 1-3. Autoscale 배포 선택
**왜 Autoscale?**
- 트래픽이 없을 때는 비용 $0
- 트래픽에 따라 자동으로 확장/축소
- 24/7 크론잡 실행에 최적화
- Replit Core 구독자는 월 $25 크레딧 제공

**설정값:**
```
Machine: 1vCPU, 2 GiB RAM (기본값)
Max Machines: 3 (기본값)
Run Command: python cli.py server
Port: 8000
```

### 1-4. 환경 변수 확인
Publish 설정 화면에서 다음 환경 변수가 모두 설정되어 있는지 확인:

```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
GEMINI_API_KEY=<your-gemini-key>
DATA_COLLECTION_API_KEY=<shared-api-key>
APIFY_API_TOKEN=<your-apify-token>
MAIN_PLATFORM_URL=https://c9a4c16f-b729-4b66-b697-b4ffb3d735c3-00-2cbc9o0oqmxhz.janeway.replit.dev
```

> ⚠️ **중요**: `MAIN_PLATFORM_URL`은 메인 hansikdang 플랫폼의 현재 개발 URL입니다. 
> 메인 플랫폼을 배포한 후에는 이 값을 프로덕션 URL로 업데이트해야 합니다.

### 1-5. Publish 실행
1. **"Publish"** 버튼 클릭
2. 배포 진행 상황 모니터링 (약 2-3분 소요)
3. 배포 완료 후 **프로덕션 URL** 확인

**예상 URL 형식:**
```
https://hansikdang-data-hub-[username].replit.app
```

---

## 🔗 Step 2: 프로덕션 URL 확인 및 환경 변수 업데이트

### 2-1. Data Hub 프로덕션 URL 테스트
배포 완료 후 API가 정상 작동하는지 확인:

```bash
# 헬스 체크
curl https://hansikdang-data-hub-[username].replit.app/health

# API 인증 테스트
curl -X GET https://hansikdang-data-hub-[username].replit.app/status \
  -H "X-API-Key: YOUR_API_KEY"
```

### 2-2. 메인 플랫폼에서 환경 변수 추가 (선택사항)
메인 hansikdang Repl에서 Data Hub URL을 참조해야 하는 경우:

1. 메인 hansikdang Repl의 Secrets 탭으로 이동
2. 새 Secret 추가:
   ```
   Key: DATA_HUB_URL
   Value: https://hansikdang-data-hub-[username].replit.app
   ```

---

## 🌐 Step 3: 서브도메인 DNS 연결 (data-hub.hansikdang.net)

### 3-1. Replit에서 Custom Domain 설정
1. Data Hub Repl의 **Publish** 페이지로 이동
2. **"Custom Domain"** 섹션 찾기
3. 도메인 입력: `data-hub.hansikdang.net`
4. Replit이 제공하는 **DNS 레코드** 복사:
   - A Record IP 주소
   - TXT Record 값

### 3-2. 도메인 등록 업체에서 DNS 레코드 추가
**예시: Cloudflare, GoDaddy, Namecheap 등**

#### A Record 추가:
```
Type: A
Name: data-hub
Value: [Replit이 제공한 IP 주소]
TTL: Auto (또는 3600)
```

#### TXT Record 추가 (소유권 인증):
```
Type: TXT
Name: _replit-challenge.data-hub
Value: [Replit이 제공한 TXT 값]
TTL: Auto (또는 3600)
```

### 3-3. DNS 전파 대기
- DNS 변경사항이 전파되는 데 **최대 48시간** 소요
- 보통 15분~2시간 내에 완료됨
- DNS 전파 확인 도구: https://dnschecker.org

### 3-4. SSL/TLS 자동 설정
DNS 연결이 완료되면 Replit이 자동으로:
- Let's Encrypt SSL 인증서 발급
- HTTPS 자동 활성화

---

## ⏰ Step 4: 24/7 크론잡 자동화 설정

### 4-1. 현재 스케줄링 상태 확인
Data Hub는 이미 내장 스케줄러가 포함되어 있습니다:

**파일 위치:** `data-hub/src/workflows/scheduler.py`

**기본 스케줄:**
```python
# 매일 오전 3시: 데이터 수집 (333개 레스토랑)
schedule.every().day.at("03:00").do(run_collection_workflow)

# 매일 오전 6시: 데이터 동기화
schedule.every().day.at("06:00").do(run_sync_workflow)

# 1시간마다: 헬스 체크
schedule.every().hour.do(health_check)
```

### 4-2. 스케줄러 활성화
배포된 Data Hub는 자동으로 스케줄러를 실행합니다:

```bash
# 서버 시작 시 스케줄러 자동 실행
python cli.py server
```

### 4-3. 스케줄 커스터마이징 (선택사항)
다른 시간대로 변경하려면 `scheduler.py` 수정:

```python
# 예시: 매일 새벽 2시, 5시에 실행
schedule.every().day.at("02:00").do(run_collection_workflow)
schedule.every().day.at("05:00").do(run_sync_workflow)
```

---

## 📊 Step 5: 모니터링 및 검증

### 5-1. 프로덕션 API 엔드포인트 테스트

```bash
# 1. 헬스 체크
curl https://data-hub.hansikdang.net/health

# 2. 데이터베이스 상태 확인
curl https://data-hub.hansikdang.net/status \
  -H "X-API-Key: YOUR_API_KEY"

# 3. 수집 워크플로우 수동 실행 (테스트용)
curl -X POST https://data-hub.hansikdang.net/workflows/collect \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"limit": 5}'
```

### 5-2. 로그 모니터링
Replit Console에서 실시간 로그 확인:
```
[2025-10-28 03:00:00] INFO - Starting collection workflow (target: 333 restaurants)
[2025-10-28 03:15:23] INFO - Collected: 333/333 restaurants
[2025-10-28 03:15:24] INFO - Gemini processing: 333/333 success
[2025-10-28 06:00:00] INFO - Starting sync workflow
[2025-10-28 06:02:15] INFO - Synced: 333/333 to main platform
```

### 5-3. 메인 플랫폼에서 데이터 확인
메인 hansikdang 플랫폼에서:

```bash
curl https://hansikdang-main.replit.app/api/external/status \
  -H "X-API-Key: YOUR_API_KEY"

# 기대 결과:
# {
#   "statistics": {
#     "restaurants": 364,  # 31 기존 + 333 신규
#     "reviews": 0,
#     "menus": 0
#   }
# }
```

---

## 💰 비용 예상

### Autoscale 배포 비용 (월간)
```
기본 요금: $0 (사용량 기반 과금)
예상 사용량:
  - 일일 크론잡 2회 (수집 + 동기화)
  - 각 작업 약 15분 소요
  - 월간 총 실행 시간: ~15시간

예상 비용: $8-12/월
```

> ✅ **Replit Core 구독자는 월 $25 크레딧 제공**으로 충분히 커버 가능

### Apify 스크래핑 비용 (월간)
```
무료 플랜: 사용 불가 (실제 스크래핑 제한)
유료 플랜: $30/월
  - 월 10,000 크레딧
  - 일일 333개 레스토랑 수집 가능
```

---

## 🎯 최종 체크리스트

- [ ] Data Hub Repl에서 Autoscale로 배포 완료
- [ ] 프로덕션 URL 확인 및 API 테스트 통과
- [ ] 서브도메인 DNS 레코드 추가 (data-hub.hansikdang.net)
- [ ] DNS 전파 완료 및 HTTPS 활성화 확인
- [ ] 24/7 크론잡 스케줄러 작동 확인
- [ ] 메인 플랫폼과 동기화 테스트 성공
- [ ] 로그 모니터링 정상 작동
- [ ] Apify 유료 구독 활성화 (실제 데이터 수집용)

---

## 🆘 문제 해결

### DNS가 연결되지 않는 경우
```bash
# DNS 전파 확인
nslookup data-hub.hansikdang.net

# 캐시 초기화 (Windows)
ipconfig /flushdns

# 캐시 초기화 (macOS)
sudo dscacheutil -flushcache
```

### 크론잡이 실행되지 않는 경우
1. Replit Console에서 로그 확인
2. `scheduler.py`의 시간대 설정 확인 (UTC 기준)
3. 서버 재시작: Repl Stop → Run

### API 인증 오류
- `X-API-Key` 헤더가 올바른지 확인
- `DATA_COLLECTION_API_KEY` 환경 변수 동일한지 확인 (양쪽 Repl)

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. Replit Console 로그
2. Data Hub `/health` 엔드포인트
3. 메인 플랫폼 `/api/external/status` 엔드포인트

**축하합니다! 한식당 Data Hub가 프로덕션 환경에서 24/7 자동으로 운영됩니다! 🎉**
