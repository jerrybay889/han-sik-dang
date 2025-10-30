# 🔄 Data Hub → 메인 시스템 동기화 클라이언트

## 개요

Data Hub에서 수집/정제한 레스토랑 데이터를 메인 시스템(hansikdang)으로 전송하는 클라이언트 예제입니다.

---

## 🎯 API 엔드포인트

```
POST https://hansikdang.replit.app/api/sync/restaurants
```

**인증**: `X-API-Key` 헤더 (DATA_COLLECTION_API_KEY)

---

## 📦 요청 형식

### Request Headers
```json
{
  "Content-Type": "application/json",
  "X-API-Key": "<DATA_COLLECTION_API_KEY>"
}
```

### Request Body
```json
{
  "restaurants": [
    {
      "name": "광장시장 마약김밥",
      "name_en": "Gwangjang Market Drug Gimbap",
      "category": "한식",
      "cuisine": "분식",
      "district": "종로구",
      "address": "서울 종로구 창경궁로 88 광장시장",
      "latitude": 37.5702,
      "longitude": 126.9999,
      "description": "광장시장 대표 맛집. 중독성 강한 김밥으로 유명",
      "description_en": "Famous for addictive gimbap at Gwangjang Market",
      "price_range": 1,
      "image_url": "https://...",
      "open_hours": "매일 09:00-20:00",
      "phone": "02-1234-5678",
      "city": "서울",
      "district_detail": "을지로/종로",
      
      "naver_place_id": "1234567890",
      "naver_rating": 4.8,
      "naver_review_count": 8234,
      
      "google_place_id": "ChIJabcd1234",
      "google_rating": 4.2,
      "google_review_count": 43596,
      
      "popularity_score": 62.3
    }
  ]
}
```

---

## ✅ 응답 형식

### 성공 (200 OK)
```json
{
  "message": "Sync completed",
  "results": {
    "success": ["광장시장 마약김밥"],
    "updated": [],
    "failed": []
  },
  "summary": {
    "total": 1,
    "success": 1,
    "updated": 0,
    "failed": 0
  }
}
```

### 실패 예시
```json
{
  "message": "Sync completed",
  "results": {
    "success": [],
    "updated": [],
    "failed": [
      {
        "name": "테스트 식당",
        "error": "Missing required field: address"
      }
    ]
  },
  "summary": {
    "total": 1,
    "success": 0,
    "updated": 0,
    "failed": 1
  }
}
```

---

## 🐍 Python 클라이언트 예제

### `data-hub/src/clients/main_system_sync.py`

```python
import httpx
import os
from typing import List, Dict, Any
from loguru import logger

class MainSystemSyncClient:
    """메인 시스템 동기화 클라이언트"""
    
    def __init__(self):
        self.base_url = os.getenv("MAIN_SYSTEM_URL", "https://hansikdang.replit.app")
        self.api_key = os.getenv("DATA_COLLECTION_API_KEY")
        
        if not self.api_key:
            raise ValueError("DATA_COLLECTION_API_KEY not set in environment")
    
    async def sync_restaurants(self, restaurants: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        레스토랑 데이터를 메인 시스템에 동기화
        
        Args:
            restaurants: 레스토랑 데이터 리스트 (ProcessedRestaurant 형식)
        
        Returns:
            동기화 결과 (success, updated, failed)
        """
        url = f"{self.base_url}/api/sync/restaurants"
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": self.api_key
        }
        
        payload = {
            "restaurants": restaurants
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                
                result = response.json()
                
                logger.info(f"Sync completed: {result['summary']}")
                
                return result
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error during sync: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during sync: {e}")
            raise

    def format_restaurant_for_sync(self, processed: Any) -> Dict[str, Any]:
        """
        ProcessedRestaurant 객체를 동기화 형식으로 변환
        
        Args:
            processed: ProcessedRestaurant SQLAlchemy 객체
        
        Returns:
            API 요청 형식
        """
        return {
            "name": processed.name,
            "name_en": processed.name_en,
            "category": processed.category,
            "cuisine": processed.cuisine_type,
            "district": processed.district,
            "address": processed.address,
            "latitude": processed.latitude,
            "longitude": processed.longitude,
            "description": processed.description_ko,
            "description_en": processed.description_en,
            "price_range": processed.price_range,
            "image_url": processed.primary_image_url,
            "open_hours": processed.open_hours,
            "phone": processed.phone,
            "city": processed.city,
            "district_detail": processed.district_detail,
            
            "naver_place_id": processed.naver_place_id,
            "naver_rating": processed.naver_rating,
            "naver_review_count": processed.naver_review_count,
            
            "google_place_id": processed.google_place_id,
            "google_rating": processed.google_rating,
            "google_review_count": processed.google_review_count,
            
            "popularity_score": processed.popularity_score,
        }


# 사용 예시
async def main():
    from sqlalchemy.orm import Session
    from src.models import ProcessedRestaurant
    from src.database import get_db
    
    client = MainSystemSyncClient()
    
    # 1. 동기화할 레스토랑 조회 (예: 최근 24시간 업데이트)
    with get_db() as db:
        restaurants = db.query(ProcessedRestaurant).filter(
            ProcessedRestaurant.updated_at >= datetime.now() - timedelta(days=1)
        ).all()
        
        # 2. 형식 변환
        sync_data = [client.format_restaurant_for_sync(r) for r in restaurants]
        
        # 3. 동기화 실행
        result = await client.sync_restaurants(sync_data)
        
        logger.info(f"✅ Success: {result['summary']['success']}")
        logger.info(f"🔄 Updated: {result['summary']['updated']}")
        logger.info(f"❌ Failed: {result['summary']['failed']}")
        
        # 4. 실패 항목 로깅
        for failed in result['results']['failed']:
            logger.error(f"Failed to sync: {failed['name']} - {failed['error']}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

---

## 🚀 CLI 명령어 추가

### `data-hub/src/cli.py`에 추가

```python
@app.command()
def sync_to_main(
    limit: int = 100,
    recent_hours: int = 24
):
    """
    최근 업데이트된 레스토랑을 메인 시스템에 동기화
    
    Args:
        limit: 최대 동기화 개수
        recent_hours: 최근 몇 시간 내 업데이트만 동기화
    """
    import asyncio
    from datetime import datetime, timedelta
    from sqlalchemy.orm import Session
    from src.models import ProcessedRestaurant
    from src.database import get_db
    from src.clients.main_system_sync import MainSystemSyncClient
    
    async def sync():
        client = MainSystemSyncClient()
        
        with get_db() as db:
            cutoff = datetime.now() - timedelta(hours=recent_hours)
            
            restaurants = db.query(ProcessedRestaurant).filter(
                ProcessedRestaurant.updated_at >= cutoff
            ).limit(limit).all()
            
            if not restaurants:
                console.print("[yellow]No restaurants to sync[/yellow]")
                return
            
            console.print(f"[cyan]Found {len(restaurants)} restaurants to sync[/cyan]")
            
            sync_data = [client.format_restaurant_for_sync(r) for r in restaurants]
            result = await client.sync_restaurants(sync_data)
            
            console.print(f"\n[green]✅ Success: {result['summary']['success']}[/green]")
            console.print(f"[blue]🔄 Updated: {result['summary']['updated']}[/blue]")
            console.print(f"[red]❌ Failed: {result['summary']['failed']}[/red]")
            
            if result['results']['failed']:
                console.print("\n[red]Failed items:[/red]")
                for failed in result['results']['failed']:
                    console.print(f"  - {failed['name']}: {failed['error']}")
    
    asyncio.run(sync())
```

---

## 📝 사용 방법

### 1. 환경 변수 설정
```bash
# data-hub/.env
DATA_COLLECTION_API_KEY=<32-byte-hex-key>
MAIN_SYSTEM_URL=https://hansikdang.replit.app
```

### 2. CLI 실행
```bash
# 최근 24시간 업데이트된 레스토랑 100개 동기화
python -m src.cli sync-to-main

# 최근 1시간, 50개만
python -m src.cli sync-to-main --limit=50 --recent-hours=1

# 전체 동기화 (주의!)
python -m src.cli sync-to-main --limit=1000 --recent-hours=99999
```

### 3. Python 스크립트
```python
from src.clients.main_system_sync import MainSystemSyncClient
import asyncio

async def quick_sync():
    client = MainSystemSyncClient()
    
    result = await client.sync_restaurants([
        {
            "name": "테스트 식당",
            "name_en": "Test Restaurant",
            "category": "한식",
            "cuisine": "한식",
            "district": "강남구",
            "address": "서울 강남구 테스트로 123",
            "latitude": 37.5,
            "longitude": 127.0,
            "naver_rating": 4.5,
            "naver_review_count": 100,
            "google_rating": 4.3,
            "google_review_count": 50,
            "popularity_score": 45.2,
        }
    ])
    
    print(result)

asyncio.run(quick_sync())
```

---

## ⚙️ 자동화 스케줄러 (선택)

### `data-hub/src/schedulers/auto_sync.py`

```python
import schedule
import time
import asyncio
from loguru import logger
from src.clients.main_system_sync import MainSystemSyncClient
from src.database import get_db
from src.models import ProcessedRestaurant
from datetime import datetime, timedelta

async def sync_job():
    """매 30분마다 자동 동기화"""
    try:
        client = MainSystemSyncClient()
        
        with get_db() as db:
            cutoff = datetime.now() - timedelta(minutes=30)
            
            restaurants = db.query(ProcessedRestaurant).filter(
                ProcessedRestaurant.updated_at >= cutoff
            ).all()
            
            if not restaurants:
                logger.info("No new restaurants to sync")
                return
            
            sync_data = [client.format_restaurant_for_sync(r) for r in restaurants]
            result = await client.sync_restaurants(sync_data)
            
            logger.info(f"Auto sync completed: {result['summary']}")
            
    except Exception as e:
        logger.error(f"Auto sync failed: {e}")

def run_scheduler():
    """스케줄러 실행"""
    schedule.every(30).minutes.do(lambda: asyncio.run(sync_job()))
    
    logger.info("🚀 Auto sync scheduler started (every 30 minutes)")
    
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    run_scheduler()
```

---

## 🔒 보안

- API Key는 **절대** 코드에 하드코딩하지 않습니다
- 환경 변수로만 관리합니다
- HTTPS 사용 필수
- Rate Limiting: 분당 60회 요청 제한

---

## ✅ 동기화 로직

### 기존 레스토랑 판별 기준
1. **이름 검색**: `storage.searchRestaurants(name)`
2. **주소 매칭**: `address` 완전 일치

### 업데이트 vs 신규 생성
- **매칭 성공** → `updateRestaurantRatings()` (평점/리뷰수만 업데이트)
- **매칭 실패** → `createRestaurant()` (신규 생성)

---

## 📊 예상 사용 시나리오

### Phase 3 완료 후
```bash
# 1. 네이버 웹파싱 완료 (163개)
python -m src.cli enrich-naver-places --limit=163

# 2. 메인 시스템 동기화
python -m src.cli sync-to-main --limit=163

# 결과:
# ✅ Updated: 163 (모든 레스토랑 네이버 평점 업데이트)
# ❌ Failed: 0
```

### 일일 운영
```bash
# 매일 새벽 2시 - 자동 실행
# cron: 0 2 * * * cd data-hub && python -m src.cli sync-to-main --recent-hours=24
```

---

## 🎯 완료!

이제 Data Hub와 메인 시스템이 완벽하게 연결되었습니다! 🚀

**다음 단계**:
1. Phase 3 웹파싱 완료
2. 네이버 평점 163개 수집
3. 메인 시스템 동기화
4. **인기지수 42.6점 → 55-60점 달성!**
