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
    """원본 스크래핑 데이터 (정제 전) - Phase 1 업그레이드"""
    __tablename__ = "raw_restaurant_data"
    
    id = Column(String, primary_key=True)  # UUID
    source = Column(String, nullable=False)  # 'naver' or 'google'
    source_id = Column(String, nullable=False)  # 네이버/구글 ID
    source_url = Column(String)
    place_id = Column(String)  # ✅ Phase 1: PlaceID 추가
    
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
        Index('idx_raw_place_id', 'place_id'),  # ✅ Phase 1: PlaceID 인덱스
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
    """정제된 레스토랑 데이터 (한식당 형식) - Phase 1 업그레이드"""
    __tablename__ = "processed_restaurants"
    
    id = Column(String, primary_key=True)  # UUID
    mapping_id = Column(String)  # RestaurantMapping FK
    naver_place_id = Column(String)  # ✅ Phase 1: 네이버 PlaceID
    google_place_id = Column(String)  # ✅ Phase 1: 구글 PlaceID
    
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
    
    # 인기지수 (Phase 2: 인기지수 시스템)
    popularity_score = Column(Float, default=0.0)  # 0-100
    popularity_tier = Column(String, default='new_or_limited')  # top_rated, highly_popular, popular, average, new_or_limited
    
    # 이미지
    image_url = Column(String)
    image_urls = Column(JSON)  # 추가 이미지들
    
    # 메뉴 (간단한 목록)
    menu_summary = Column(JSON)  # [{"name": "냉면", "price": "9000"}]
    
    # ✅ Phase 1: 실제 리뷰 데이터
    reviews = Column(JSON)  # [{"author": "김**", "rating": 5, "comment": "맛있어요"}]
    
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
        Index('idx_processed_naver_place_id', 'naver_place_id'),  # ✅ Phase 1
        Index('idx_processed_google_place_id', 'google_place_id'),  # ✅ Phase 1
        Index('idx_processed_popularity', 'popularity_score'),  # ✅ Phase 2: 인기지수
        Index('idx_processed_popularity_tier', 'popularity_tier'),  # ✅ Phase 2: 인기등급
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


# DuplicateGroup moved to end of file (Stage A MVP version)


class MergeHistory(Base):
    """레스토랑 병합 이력"""
    __tablename__ = "merge_history"
    
    id = Column(String, primary_key=True)  # UUID
    
    # 병합 정보
    duplicate_group_id = Column(String, nullable=False)  # DuplicateGroup FK
    master_id = Column(String, nullable=False)  # 최종 대표 레스토랑
    merged_ids = Column(JSON, nullable=False)  # 병합된 레스토랑 ID 목록
    
    # 병합 상세
    merge_reason = Column(String)  # 병합 사유
    similarity_details = Column(JSON)  # 유사도 상세 정보
    
    # 병합 전 데이터 백업
    merged_data = Column(JSON)  # 병합된 레스토랑의 원본 데이터
    
    # 자동/수동 병합
    merge_type = Column(String, default='auto')  # auto, manual
    merged_by = Column(String)  # 'system', 'admin', 'api'
    
    # 메타데이터
    merged_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 인덱스
    __table_args__ = (
        Index('idx_merge_master', 'master_id'),
        Index('idx_merge_group', 'duplicate_group_id'),
        Index('idx_merge_date', 'merged_at'),
        Index('idx_merge_type', 'merge_type'),
    )


class QualityMetrics(Base):
    """데이터 품질 메트릭"""
    __tablename__ = "quality_metrics"
    
    id = Column(String, primary_key=True)  # UUID
    
    # 대상 정보
    restaurant_id = Column(String)  # ProcessedRestaurant FK
    data_type = Column(String, nullable=False)  # 'restaurant', 'batch', 'system'
    
    # 7가지 품질 지표
    completeness_score = Column(Float, default=0.0)  # 완전성 (0-100)
    accuracy_score = Column(Float, default=0.0)  # 정확성 (0-100)
    consistency_score = Column(Float, default=0.0)  # 일관성 (0-100)
    timeliness_score = Column(Float, default=0.0)  # 적시성 (0-100)
    validity_score = Column(Float, default=0.0)  # 유효성 (0-100)
    uniqueness_score = Column(Float, default=0.0)  # 고유성 (0-100)
    relevance_score = Column(Float, default=0.0)  # 관련성 (0-100)
    
    # 종합 품질 점수
    overall_quality_score = Column(Float, default=0.0)  # 0-100
    quality_grade = Column(String)  # A, B, C, D, F
    
    # 상세 정보
    issues = Column(JSON)  # 발견된 문제 목록
    recommendations = Column(JSON)  # 개선 권장사항
    
    # 메타데이터
    measured_at = Column(DateTime(timezone=True), server_default=func.now())
    measured_by = Column(String, default='system')
    
    # 인덱스
    __table_args__ = (
        Index('idx_quality_restaurant', 'restaurant_id'),
        Index('idx_quality_type', 'data_type'),
        Index('idx_quality_score', 'overall_quality_score'),
        Index('idx_quality_measured', 'measured_at'),
    )


class DataLineage(Base):
    """데이터 계보 추적"""
    __tablename__ = "data_lineage"
    
    id = Column(String, primary_key=True)  # UUID
    
    # 데이터 식별
    entity_id = Column(String, nullable=False)  # Restaurant ID
    entity_type = Column(String, nullable=False)  # 'restaurant'
    
    # 변환 정보
    operation = Column(String, nullable=False)  # 'scraped', 'processed', 'merged', 'synced'
    operation_status = Column(String)  # 'success', 'failed', 'partial'
    
    # 소스 추적
    source_system = Column(String)  # 'naver', 'google', 'gemini', 'system'
    source_id = Column(String)  # 원본 데이터 ID
    
    # 변환 상세
    input_data = Column(JSON)  # 변환 전 데이터 (샘플)
    output_data = Column(JSON)  # 변환 후 데이터 (샘플)
    transformation_rules = Column(JSON)  # 적용된 규칙
    
    # 품질 영향
    quality_before = Column(Float)  # 변환 전 품질 점수
    quality_after = Column(Float)  # 변환 후 품질 점수
    quality_delta = Column(Float)  # 품질 변화량
    
    # 메타데이터
    executed_at = Column(DateTime(timezone=True), server_default=func.now())
    executed_by = Column(String)  # 'system', 'scheduler', 'api'
    execution_time_ms = Column(Integer)  # 실행 시간 (밀리초)
    
    # 인덱스
    __table_args__ = (
        Index('idx_lineage_entity', 'entity_id'),
        Index('idx_lineage_operation', 'operation'),
        Index('idx_lineage_source', 'source_system'),
        Index('idx_lineage_executed', 'executed_at'),
    )


class SystemHealth(Base):
    """시스템 건강 상태"""
    __tablename__ = "system_health"
    
    id = Column(String, primary_key=True)  # UUID
    
    # 시스템 구성 요소
    component = Column(String, nullable=False)  # 'scraper', 'processor', 'sync', 'api', 'database'
    component_status = Column(String, nullable=False)  # 'healthy', 'degraded', 'down'
    
    # 성능 메트릭
    response_time_ms = Column(Integer)  # 응답 시간 (밀리초)
    throughput = Column(Integer)  # 처리량 (개/시간)
    error_rate = Column(Float)  # 오류율 (%)
    success_rate = Column(Float)  # 성공률 (%)
    
    # 리소스 사용
    cpu_usage = Column(Float)  # CPU 사용률 (%)
    memory_usage = Column(Float)  # 메모리 사용률 (%)
    disk_usage = Column(Float)  # 디스크 사용률 (%)
    
    # 작업 통계
    total_operations = Column(Integer, default=0)
    successful_operations = Column(Integer, default=0)
    failed_operations = Column(Integer, default=0)
    
    # 알림 정보
    alerts = Column(JSON)  # 발생한 알림 목록
    last_alert_at = Column(DateTime(timezone=True))
    
    # 상세 정보
    details = Column(JSON)  # 추가 상세 정보
    
    # 메타데이터
    measured_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 인덱스
    __table_args__ = (
        Index('idx_health_component', 'component'),
        Index('idx_health_status', 'component_status'),
        Index('idx_health_measured', 'measured_at'),
    )


class BackupHistory(Base):
    """Google Drive 백업 이력"""
    __tablename__ = "backup_history"
    
    id = Column(String, primary_key=True)  # UUID
    
    # 백업 정보
    backup_date = Column(String, nullable=False)  # YYYY-MM-DD
    backup_type = Column(String, nullable=False)  # 'daily', 'weekly', 'manual'
    
    # 파일 정보
    file_name = Column(String, nullable=False)  # 07-collection.csv
    file_path = Column(String)  # /hansikdang-data/2025-11/07-collection.csv
    drive_file_id = Column(String)  # Google Drive 파일 ID
    file_size_bytes = Column(Integer)  # 파일 크기 (바이트)
    
    # 데이터 통계
    total_records = Column(Integer, default=0)  # 백업된 레스토랑 수
    new_records = Column(Integer, default=0)  # 당일 신규 수집
    duplicate_removed = Column(Integer, default=0)  # 중복 제거된 수
    average_quality_score = Column(Float)  # 평균 품질 점수
    
    # 백업 상태
    status = Column(String, nullable=False)  # 'success', 'failed', 'partial'
    error_message = Column(String)  # 에러 메시지
    retry_count = Column(Integer, default=0)  # 재시도 횟수
    
    # 메타데이터
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    execution_time_seconds = Column(Integer)  # 실행 시간 (초)
    
    # 인덱스
    __table_args__ = (
        Index('idx_backup_date', 'backup_date'),
        Index('idx_backup_type', 'backup_type'),
        Index('idx_backup_status', 'status'),
        Index('idx_backup_completed', 'completed_at'),
    )


class CollectionConfig(Base):
    """수집 설정 관리 - Stage A MVP"""
    __tablename__ = "collection_configs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)  # 설정명
    regions = Column(JSON)  # 다중 지역 [{"sido": "서울", "gugun": "강남구", "dong": "역삼동"}]
    keywords = Column(JSON)  # 다중 키워드 ["갈비", "한우", "숯불"]
    source = Column(String, default='both')  # google/naver/both
    status = Column(String, default='active')  # active/paused/pending/rejected
    monthly_cost = Column(Float, default=0.0)  # 월간 예상 비용
    is_active = Column(Boolean, default=True)  # 활성화 여부
    
    # 메타데이터
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 인덱스
    __table_args__ = (
        Index('idx_collection_status', 'status'),
        Index('idx_collection_active', 'is_active'),
    )


class DuplicateGroup(Base):
    """중복 그룹 관리 - Stage A MVP"""
    __tablename__ = "duplicate_groups"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    restaurant_ids = Column(JSON)  # 중복된 레스토랑 ID 목록 ["id1", "id2"]
    match_type = Column(String, default='exact')  # exact/fuzzy/geo
    similarity_score = Column(Float, default=100.0)  # 유사도 점수 (0-100)
    status = Column(String, default='pending')  # pending/merged/separated/ignored
    resolved_by = Column(String)  # 처리한 사람
    
    # 메타데이터
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True))
    
    # 인덱스
    __table_args__ = (
        Index('idx_duplicate_status', 'status'),
        Index('idx_duplicate_type', 'match_type'),
    )


class QualityScore(Base):
    """데이터 품질 점수 - Stage A MVP"""
    __tablename__ = "quality_scores"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    restaurant_id = Column(String, nullable=False)  # FK to ProcessedRestaurant
    
    # 품질 지표
    completeness_score = Column(Float, default=0.0)  # 필수정보 완성도 (0-100)
    phone_valid = Column(Boolean, default=False)  # 전화번호 유효성
    address_complete = Column(Boolean, default=False)  # 주소 완성도
    coordinates_valid = Column(Boolean, default=False)  # 좌표 정확도
    total_score = Column(Float, default=0.0)  # 종합 점수 (0-100)
    
    # 메타데이터
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 인덱스
    __table_args__ = (
        Index('idx_quality_restaurant', 'restaurant_id'),
        Index('idx_quality_total', 'total_score'),
    )
