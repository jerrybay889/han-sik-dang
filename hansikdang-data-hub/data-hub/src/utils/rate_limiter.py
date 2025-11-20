"""
Rate Limiter - API 요청 속도 제한
"""
import asyncio
from collections import deque
from time import time
from loguru import logger


class RateLimiter:
    """
    요청 속도 제한 (1초당 N개)
    
    Usage:
        rate_limiter = RateLimiter(max_requests=10, per_seconds=1)
        await rate_limiter.acquire()  # 요청 전 호출
    """
    
    def __init__(self, max_requests: int, per_seconds: int = 1):
        """
        Args:
            max_requests: 최대 요청 수
            per_seconds: 시간 창 (초)
        """
        self.max_requests = max_requests
        self.per_seconds = per_seconds
        self.requests = deque()
        logger.debug(f"RateLimiter initialized: {max_requests} req/{per_seconds}s")
    
    async def acquire(self):
        """요청 토큰 획득 (필요시 대기)"""
        now = time()
        
        # 오래된 요청 제거
        while self.requests and self.requests[0] < now - self.per_seconds:
            self.requests.popleft()
        
        # 제한 초과 시 대기
        if len(self.requests) >= self.max_requests:
            sleep_time = self.requests[0] + self.per_seconds - now + 0.01
            logger.debug(f"Rate limit reached, sleeping {sleep_time:.2f}s")
            await asyncio.sleep(sleep_time)
            return await self.acquire()
        
        self.requests.append(now)
