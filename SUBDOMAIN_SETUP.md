# 서브도메인 DNS 연결 가이드
## data-hub.hansikdang.net 설정 방법

---

## 📋 필요한 정보

배포 전에 다음 정보를 준비하세요:

1. **도메인 등록 업체 계정** (예: Cloudflare, GoDaddy, Namecheap, 가비아 등)
2. **기본 도메인**: `hansikdang.net` (이미 소유 중이어야 함)
3. **Replit에서 제공한 DNS 레코드** (배포 후 확인 가능)

---

## 🚀 Step 1: Data Hub 배포 및 DNS 레코드 확인

### 1-1. Data Hub를 Autoscale로 배포
1. hansikdang-data-hub Repl에서 **Publish** 클릭
2. **Autoscale** 선택
3. **Publish** 버튼으로 배포 완료

### 1-2. Custom Domain 설정 시작
1. 배포 완료 후 **Publish** 페이지로 이동
2. **"Custom Domain"** 섹션 찾기
3. 도메인 입력: `data-hub.hansikdang.net`
4. Replit이 생성한 **DNS 레코드** 메모:

**예시:**
```
A Record:
  IP 주소: 35.190.XXX.XXX

TXT Record:
  값: replit-verification=abc123def456...
```

---

## 🌐 Step 2: 도메인 등록 업체에서 DNS 레코드 추가

아래에서 사용 중인 서비스를 선택하세요:

---

### 옵션 A: Cloudflare 사용자

#### 1. Cloudflare 대시보드 로그인
- https://dash.cloudflare.com 접속
- `hansikdang.net` 도메인 선택

#### 2. DNS 레코드 추가
**DNS 탭으로 이동 → Add record**

**A Record 추가:**
```
Type: A
Name: data-hub
IPv4 address: [Replit이 제공한 IP 주소]
Proxy status: DNS only (회색 구름 아이콘)
TTL: Auto
```

**TXT Record 추가:**
```
Type: TXT
Name: _replit-challenge.data-hub
Content: [Replit이 제공한 TXT 값]
TTL: Auto
```

#### 3. 저장 및 확인
- **Save** 클릭
- Cloudflare는 즉시 적용됨 (보통 1-5분 내 전파)

---

### 옵션 B: GoDaddy 사용자

#### 1. GoDaddy 계정 로그인
- https://dcc.godaddy.com/domains 접속
- `hansikdang.net` 선택 → **DNS 관리** 클릭

#### 2. DNS 레코드 추가
**새 레코드 추가 → A 레코드**

**A Record:**
```
Type: A
Host: data-hub
Points to: [Replit이 제공한 IP 주소]
TTL: 600초 (기본값)
```

**TXT Record:**
```
Type: TXT
Host: _replit-challenge.data-hub
TXT Value: [Replit이 제공한 TXT 값]
TTL: 600초 (기본값)
```

#### 3. 저장 및 대기
- **저장** 클릭
- GoDaddy는 전파에 1-24시간 소요 (보통 2-4시간)

---

### 옵션 C: Namecheap 사용자

#### 1. Namecheap 계정 로그인
- https://ap.www.namecheap.com/domains/list 접속
- `hansikdang.net` 옆 **MANAGE** 클릭
- **Advanced DNS** 탭 선택

#### 2. DNS 레코드 추가
**Add New Record**

**A Record:**
```
Type: A Record
Host: data-hub
Value: [Replit이 제공한 IP 주소]
TTL: Automatic
```

**TXT Record:**
```
Type: TXT Record
Host: _replit-challenge.data-hub
Value: [Replit이 제공한 TXT 값]
TTL: Automatic
```

#### 3. 저장 및 대기
- **Save All Changes** 클릭
- Namecheap은 전파에 30분-2시간 소요

---

### 옵션 D: 가비아 사용자

#### 1. 가비아 관리 콘솔 로그인
- https://www.gabia.com 접속 → My가비아
- **도메인 관리** → `hansikdang.net` 선택
- **DNS 정보** → **DNS 관리** 클릭

#### 2. DNS 레코드 추가
**레코드 추가**

**A 레코드:**
```
타입: A
호스트: data-hub
값/위치: [Replit이 제공한 IP 주소]
TTL: 3600
```

**TXT 레코드:**
```
타입: TXT
호스트: _replit-challenge.data-hub
값/위치: [Replit이 제공한 TXT 값]
TTL: 3600
```

#### 3. 저장 및 대기
- **저장** 클릭
- 가비아는 전파에 1-4시간 소요

---

## ⏱️ Step 3: DNS 전파 대기 및 확인

### 3-1. DNS 전파 시간
| 서비스 | 예상 전파 시간 |
|--------|---------------|
| Cloudflare | 1-5분 |
| Namecheap | 30분-2시간 |
| GoDaddy | 2-4시간 |
| 가비아 | 1-4시간 |
| 기타 | 최대 48시간 |

### 3-2. DNS 전파 확인 방법

#### 방법 1: 온라인 도구 사용
https://dnschecker.org 접속:
1. `data-hub.hansikdang.net` 입력
2. 레코드 타입: **A** 선택
3. 전 세계 DNS 서버에서 전파 상태 확인

#### 방법 2: 명령줄 확인
```bash
# Windows
nslookup data-hub.hansikdang.net

# macOS/Linux
dig data-hub.hansikdang.net
```

**성공 예시:**
```
data-hub.hansikdang.net
Address: 35.190.XXX.XXX
```

---

## 🔒 Step 4: SSL/TLS 자동 설정 확인

### 4-1. HTTPS 활성화 대기
DNS 전파가 완료되면 Replit이 자동으로:
1. Let's Encrypt SSL 인증서 발급
2. HTTPS 자동 활성화 (보통 5-10분 소요)

### 4-2. HTTPS 작동 확인
브라우저에서 접속:
```
https://data-hub.hansikdang.net/health
```

**성공 응답:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-28T12:00:00Z"
}
```

### 4-3. 인증서 확인
브라우저 주소창의 자물쇠 아이콘 클릭:
- **발급자**: Let's Encrypt
- **유효 기간**: 90일 (자동 갱신)

---

## 🧪 Step 5: 최종 테스트

### 5-1. API 엔드포인트 테스트
```bash
# 1. 헬스 체크
curl https://data-hub.hansikdang.net/health

# 2. 인증 필요 엔드포인트
curl https://data-hub.hansikdang.net/status \
  -H "X-API-Key: YOUR_API_KEY"
```

### 5-2. 브라우저 접속 테스트
https://data-hub.hansikdang.net 접속 시:
- ✅ HTTPS 자물쇠 표시
- ✅ "Not Found" 또는 JSON 응답 (정상)
- ❌ SSL 오류 → DNS 전파 미완료 또는 설정 오류

---

## 🆘 문제 해결

### 문제 1: "DNS_PROBE_FINISHED_NXDOMAIN" 오류
**원인**: DNS 레코드가 아직 전파되지 않음

**해결:**
1. DNS 레코드 설정 재확인
2. 30분-2시간 더 대기
3. DNS 캐시 초기화:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # macOS
   sudo dscacheutil -flushcache
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

### 문제 2: "ERR_SSL_VERSION_OR_CIPHER_MISMATCH" 오류
**원인**: SSL 인증서가 아직 발급되지 않음

**해결:**
1. DNS 전파가 완료되었는지 확인 (dnschecker.org)
2. Replit Publish 페이지에서 SSL 상태 확인
3. 10-30분 더 대기 후 재시도

### 문제 3: A Record는 작동하지만 TXT Record가 전파 안 됨
**원인**: TXT 레코드 이름 오류

**해결:**
1. TXT 레코드 이름 확인: `_replit-challenge.data-hub` (정확히 일치해야 함)
2. 도메인 등록 업체마다 형식이 다를 수 있음:
   - Cloudflare: `_replit-challenge.data-hub`
   - GoDaddy: `_replit-challenge.data-hub`
   - 가비아: `_replit-challenge.data-hub.hansikdang.net`

### 문제 4: 모든 설정이 정확하지만 연결 안 됨
**원인**: Replit의 Custom Domain 승인 대기

**해결:**
1. Replit Publish 페이지로 이동
2. Custom Domain 섹션에서 **"Verify"** 또는 **"Check DNS"** 버튼 클릭
3. 상태가 "Verified"로 변경될 때까지 대기

---

## 📞 추가 지원

DNS 연결 후에도 문제가 지속되면:

1. **Replit Support 문의**: https://replit.com/support
2. **도메인 등록 업체 고객센터**: DNS 레코드 설정 지원 요청
3. **DNS 전파 상태 재확인**: https://dnschecker.org

---

## ✅ 최종 체크리스트

- [ ] Replit에서 Custom Domain에 `data-hub.hansikdang.net` 입력
- [ ] Replit이 제공한 A Record IP 주소 복사
- [ ] Replit이 제공한 TXT Record 값 복사
- [ ] 도메인 등록 업체에서 A Record 추가
- [ ] 도메인 등록 업체에서 TXT Record 추가
- [ ] DNS 전파 확인 (dnschecker.org)
- [ ] HTTPS 작동 확인 (https://data-hub.hansikdang.net)
- [ ] API 엔드포인트 테스트 통과

**축하합니다! 서브도메인 연결이 완료되었습니다! 🎉**
