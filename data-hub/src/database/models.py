"""
SQLAlchemy Database Models for Restaurant Data Hub
"""
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, DateTime, Text, Boolean, JSON, Index
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()


class RawRestaurantData(Base):
    """원본 스크래핑 데이터 (정제 전)"""
    __tablename__ = "raw_restaurant_data"
    
    id = Column(String, primary_key=True)  # UUID
    source = Column(String, nullable=False)  # 'naver' or 'google'
    source_id = Column(String, nullable=False)  # 네이버/구글 ID
    source_url = Column(String)
    
    # 기본 정보 (JSON으로 저장)
    raw_data = Column(JSON, nullable=False)
    
    # 메타데이터
    scraped_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default='pending')  # pending, processing, processed, failed
    error_message = Column(Text)
    
    # 인덱스
    __table_args__ = (
        Index('idx_raw_source_id', 'source', 'source_id'),
        Index('idx_raw_status', 'status'),
        Index('idx_raw_scraped_at', 'scraped_at'),
    )


class RestaurantMapping(Base):
    """네이버 ↔ 구글 ID 매핑 테이블"""
    __tablename__ = "restaurant_mapping"
    
    id = Column(String, primary_key=True)  # UUID
    naver_id = Column(String, unique=True)
    naver_url = Column(String)
    google_place_id = Column(String, unique=True)
    google_url = Column(String)
    
    # 매칭 신뢰도
    confidence_score = Column(Float, default=0.0)  # 0-1
    matched_by = Column(String)  # 'ai', 'manual', 'exact'
    
    # 메타데이터
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 인덱스
    __table_args__ = (
        Index('idx_mapping_naver', 'naver_id'),
        Index('idx_mapping_google', 'google_place_id'),
    )


class ProcessedRestaurant(Base):
    """정제된 레스토랑 데이터 (한식당 형식)"""
    __tablename__ = "processed_restaurants"
    
    id = Column(String, primary_key=True)  # UUID
    mapping_id = Column(String)  # RestaurantMapping FK
    
    # 기본 정보
    name = Column(String, nullable=False)
    name_en = Column(String)
    category = Column(String, default='한식')
    cuisine = Column(String)  # 육류, 냉면, 분식 등
    
    # 위치 정보
    district = Column(String)  # 강남구, 종로구 등
    address = Column(String)
    address_en = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    
    # 상세 정보
    description = Column(Text)
    description_en = Column(Text)
    price_range = Column(String)  # 저렴, 보통, 비쌈
    phone = Column(String)
    website = Column(String)
    
    # 운영 정보
    open_hours = Column(JSON)  # {"mon": "09:00-22:00", ...}
    last_order = Column(String)
    break_time = Column(String)
    closed_days = Column(JSON)  # ["일요일"]
    parking = Column(Boolean)
    
    # 평가 정보
    rating = Column(Float)
    review_count = Column(Integer, default=0)
    naver_rating = Column(Float)
    naver_review_count = Column(Integer, default=0)
    google_rating = Column(Float)
    google_review_count = Column(Integer, default=0)
    
    # 이미지
    image_url = Column(String)
    image_urls = Column(JSON)  # 추가 이미지들
    
    # 메뉴 (간단한 목록)
    menu_summary = Column(JSON)  # [{"name": "냉면", "price": "9000"}]
    
    # 품질 점수
    quality_score = Column(Integer, default=0)  # 0-100
    quality_details = Column(JSON)  # 점수 세부 내역
    
    # 상태
    sync_status = Column(String, default='pending')  # pending, synced, failed
    synced_to_hansikdang = Column(Boolean, default=False)
    synced_at = Column(DateTime(timezone=True))
    
    # 메타데이터
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 인덱스
    __table_args__ = (
        Index('idx_processed_district', 'district'),
        Index('idx_processed_cuisine', 'cuisine'),
        Index('idx_processed_quality', 'quality_score'),
        Index('idx_processed_sync', 'sync_status'),
    )


class ScrapingTarget(Base):
    """스크래핑 타겟 (키워드, 지역 등)"""
    __tablename__ = "scraping_targets"
    
    id = Column(String, primary_key=True)  # UUID
    
    # 타겟 정보
    keyword = Column(String, nullable=False)  # "강남 냉면"
    region = Column(String)  # "강남구"
    cuisine_type = Column(String)  # "냉면"
    
    # 옵션
    min_rating = Column(Float)
    min_reviews = Column(Integer)
    
    # 우선순위
    priority = Column(Integer, default=5)  # 1-10
    
    # 상태
    status = Column(String, default='active')  # active, paused, completed
    last_scraped = Column(DateTime(timezone=True))
    total_found = Column(Integer, default=0)
    
    # 생성 방법
    created_by = Column(String)  # 'ai', 'manual', 'auto'
    
    # 메타데이터
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 인덱스
    __table_args__ = (
        Index('idx_target_status', 'status'),
        Index('idx_target_priority', 'priority'),
    )


class ScrapingLog(Base):
    """스크래핑 실행 로그"""
    __tablename__ = "scraping_logs"
    
    id = Column(String, primary_key=True)  # UUID
    target_id = Column(String)
    
    # 실행 정보
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    status = Column(String)  # running, completed, failed
    
    # 결과
    total_scraped = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    
    # 상세
    error_details = Column(JSON)
    
    # 인덱스
    __table_args__ = (
        Index('idx_log_started', 'started_at'),
        Index('idx_log_status', 'status'),
    )


class SyncLog(Base):
    """한식당 동기화 로그"""
    __tablename__ = "sync_logs"
    
    id = Column(String, primary_key=True)  # UUID
    
    # 동기화 정보
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    status = Column(String)  # running, completed, failed
    
    # 결과
    total_sent = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    
    # 상세
    error_details = Column(JSON)
    
    # 인덱스
    __table_args__ = (
        Index('idx_sync_started', 'started_at'),
        Index('idx_sync_status', 'status'),
    )
