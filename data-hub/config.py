"""
Configuration management for Restaurant Data Hub
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    data_hub_database_url: str = os.getenv(
        "DATA_HUB_DATABASE_URL",
        "postgresql://user:pass@localhost:5432/datahub"
    )
    
    # API Keys
    gemini_api_key: Optional[str] = os.getenv("GEMINI_API_KEY")
    apify_api_token: Optional[str] = os.getenv("APIFY_API_TOKEN")
    outscraper_api_key: Optional[str] = os.getenv("OUTSCRAPER_API_KEY")
    bright_data_proxy_url: Optional[str] = os.getenv("BRIGHT_DATA_PROXY_URL")
    
    # 한식당 연동
    hansikdang_api_url: str = os.getenv(
        "HANSIKDANG_API_URL",
        "http://localhost:5000"
    )
    data_collection_api_key: Optional[str] = os.getenv("DATA_COLLECTION_API_KEY")
    
    # Scraping Settings
    daily_target: int = 333  # 하루 목표 수집 수 (1만개/30일)
    quality_threshold: int = 70  # 품질 점수 임계값
    batch_size: int = 500  # 한식당 동기화 배치 사이즈
    
    # Retry Settings
    max_retries: int = 3
    retry_delay: int = 5  # seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
