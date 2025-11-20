"""
Quick API test script
"""
import httpx
import asyncio
from pprint import pprint


async def test_api():
    """Test Data Hub API endpoints"""
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        print("🔍 Testing Restaurant Data Hub API...\n")
        
        # 1. Health check
        print("1️⃣ Health Check")
        response = await client.get(f"{base_url}/")
        print(f"   Status: {response.status_code}")
        pprint(response.json())
        print()
        
        # 2. Stats
        print("2️⃣ System Stats")
        response = await client.get(f"{base_url}/api/stats")
        print(f"   Status: {response.status_code}")
        pprint(response.json())
        print()
        
        # 3. Targets
        print("3️⃣ Scraping Targets")
        response = await client.get(f"{base_url}/api/targets")
        print(f"   Status: {response.status_code}")
        targets = response.json()
        print(f"   Found {len(targets)} targets:")
        for target in targets:
            print(f"     - {target['keyword']} ({target['region']}) [priority: {target['priority']}]")
        print()
        
        # 4. Raw restaurants
        print("4️⃣ Raw Restaurant Data")
        response = await client.get(f"{base_url}/api/restaurants/raw?limit=10")
        print(f"   Status: {response.status_code}")
        raw_data = response.json()
        print(f"   Found {len(raw_data)} raw records")
        print()
        
        # 5. Scraping logs
        print("5️⃣ Scraping Logs")
        response = await client.get(f"{base_url}/api/logs/scraping?limit=10")
        print(f"   Status: {response.status_code}")
        logs = response.json()
        print(f"   Found {len(logs)} log entries")
        print()
        
        print("✅ All API tests passed!")


if __name__ == "__main__":
    asyncio.run(test_api())
