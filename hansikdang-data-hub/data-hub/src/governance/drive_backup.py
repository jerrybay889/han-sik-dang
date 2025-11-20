"""
Google Drive Backup Manager - 일일 데이터 백업 시스템
"""
import os
import uuid
import csv
import json
import requests
from io import StringIO
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone, timedelta
from loguru import logger
from sqlalchemy.orm import Session
from sqlalchemy import func
from googleapiclient.discovery import build
from googleapiclient.http import MediaInMemoryUpload
from google.oauth2.credentials import Credentials

from ..database.models import ProcessedRestaurant, QualityMetrics, BackupHistory, MergeHistory


class DriveBackupManager:
    """
    Google Drive 백업 관리자
    매일 수집된 레스토랑 데이터를 CSV로 변환하여 Google Drive에 저장
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.root_folder_name = "hansikdang-data"
        self.access_token = None
        self.drive_service = None
    
    def _get_access_token(self) -> str:
        """Replit Google Drive 통합에서 access token 가져오기"""
        hostname = os.getenv('REPLIT_CONNECTORS_HOSTNAME')
        x_replit_token = os.getenv('REPL_IDENTITY')
        
        if x_replit_token:
            x_replit_token = f'repl {x_replit_token}'
        else:
            x_replit_token = os.getenv('WEB_REPL_RENEWAL')
            if x_replit_token:
                x_replit_token = f'depl {x_replit_token}'
        
        if not x_replit_token:
            raise ValueError('X_REPLIT_TOKEN not found for repl/depl')
        
        url = f'https://{hostname}/api/v2/connection?include_secrets=true&connector_names=google-drive'
        headers = {
            'Accept': 'application/json',
            'X_REPLIT_TOKEN': x_replit_token
        }
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        items = data.get('items', [])
        
        if not items:
            raise ValueError('Google Drive not connected')
        
        connection_settings = items[0]
        access_token = connection_settings.get('settings', {}).get('access_token')
        
        if not access_token:
            oauth = connection_settings.get('settings', {}).get('oauth', {})
            access_token = oauth.get('credentials', {}).get('access_token')
        
        if not access_token:
            raise ValueError('Access token not found')
        
        return access_token
    
    def _get_drive_service(self):
        """Google Drive API 서비스 객체 생성"""
        if self.drive_service:
            return self.drive_service
        
        access_token = self._get_access_token()
        
        credentials = Credentials(token=access_token)
        self.drive_service = build('drive', 'v3', credentials=credentials)
        
        return self.drive_service
    
    def _find_or_create_folder(self, folder_name: str, parent_id: Optional[str] = None) -> str:
        """폴더 찾기 또는 생성"""
        service = self._get_drive_service()
        
        query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        if parent_id:
            query += f" and '{parent_id}' in parents"
        
        results = service.files().list(
            q=query,
            spaces='drive',
            fields='files(id, name)'
        ).execute()
        
        files = results.get('files', [])
        
        if files:
            return files[0]['id']
        
        file_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        
        if parent_id:
            file_metadata['parents'] = [parent_id]
        
        folder = service.files().create(
            body=file_metadata,
            fields='id'
        ).execute()
        
        logger.info(f"📁 Created folder: {folder_name} (ID: {folder['id']})")
        
        return folder['id']
    
    def _prepare_folder_structure(self, backup_date: datetime) -> str:
        """폴더 구조 준비: /hansikdang-data/2025-11/"""
        root_folder_id = self._find_or_create_folder(self.root_folder_name)
        
        year_month = backup_date.strftime('%Y-%m')
        month_folder_id = self._find_or_create_folder(year_month, parent_id=root_folder_id)
        
        return month_folder_id
    
    def _generate_csv_data(self, backup_date: str) -> tuple[str, Dict[str, Any]]:
        """CSV 데이터 생성 및 통계 계산"""
        backup_day = datetime.strptime(backup_date, '%Y-%m-%d')
        next_day = backup_day + timedelta(days=1)
        
        restaurants = self.db.query(ProcessedRestaurant).filter(
            ProcessedRestaurant.created_at >= backup_day,
            ProcessedRestaurant.created_at < next_day
        ).all()
        
        total_merged = self.db.query(MergeHistory).filter(
            MergeHistory.merged_at >= backup_day,
            MergeHistory.merged_at < next_day
        ).count()
        
        quality_metrics = self.db.query(QualityMetrics).filter(
            QualityMetrics.measured_at >= backup_day,
            QualityMetrics.measured_at < next_day
        ).all()
        
        avg_quality = 0
        if quality_metrics:
            avg_quality = sum(m.overall_quality_score for m in quality_metrics) / len(quality_metrics)
        
        output = StringIO()
        writer = csv.writer(output)
        
        writer.writerow([
            'id', 'name', 'address', 'phone', 'category',
            'naver_place_id', 'naver_rating', 'naver_reviews',
            'google_rating', 'google_reviews',
            'description', 'latitude', 'longitude',
            'created_at', 'synced_to_hansikdang'
        ])
        
        for r in restaurants:
            writer.writerow([
                r.id,
                r.name,
                r.address,
                r.phone or '',
                r.category or '',
                r.naver_place_id or '',
                r.naver_rating or '',
                r.naver_review_count or '',
                r.google_rating or '',
                r.google_review_count or '',
                r.description or '',
                r.latitude or '',
                r.longitude or '',
                r.created_at.isoformat() if r.created_at else '',
                r.synced_to_hansikdang or False
            ])
        
        stats = {
            'total_records': len(restaurants),
            'new_records': len(restaurants),
            'duplicate_removed': total_merged,
            'average_quality_score': round(avg_quality, 2)
        }
        
        return output.getvalue(), stats
    
    def _upload_to_drive(
        self,
        csv_content: str,
        file_name: str,
        folder_id: str
    ) -> Dict[str, Any]:
        """Google Drive에 CSV 파일 업로드"""
        service = self._get_drive_service()
        
        file_metadata = {
            'name': file_name,
            'parents': [folder_id]
        }
        
        media = MediaInMemoryUpload(
            csv_content.encode('utf-8'),
            mimetype='text/csv',
            resumable=True
        )
        
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, size, webViewLink'
        ).execute()
        
        logger.info(f"✅ Uploaded to Google Drive: {file_name} (ID: {file['id']})")
        
        return {
            'file_id': file['id'],
            'file_name': file['name'],
            'file_size_bytes': int(file.get('size', 0)),
            'web_view_link': file.get('webViewLink', '')
        }
    
    def backup_daily(
        self,
        backup_date: Optional[str] = None,
        backup_type: str = 'daily',
        max_retries: int = 3
    ) -> BackupHistory:
        """
        일일 백업 실행
        
        Args:
            backup_date: 백업 날짜 (YYYY-MM-DD, None이면 어제)
            backup_type: 백업 유형 ('daily', 'weekly', 'manual')
            max_retries: 최대 재시도 횟수
            
        Returns:
            BackupHistory: 백업 이력 레코드
        """
        if not backup_date:
            yesterday = datetime.now(timezone.utc) - timedelta(days=1)
            backup_date = yesterday.strftime('%Y-%m-%d')
        
        backup_id = str(uuid.uuid4())
        started_at = datetime.now(timezone.utc)
        
        logger.info(f"🔄 Starting {backup_type} backup for {backup_date}")
        
        backup_history = BackupHistory(
            id=backup_id,
            backup_date=backup_date,
            backup_type=backup_type,
            file_name='',
            status='started',
            started_at=started_at,
            retry_count=0
        )
        
        self.db.add(backup_history)
        self.db.commit()
        
        retry_count = 0
        last_error = None
        
        while retry_count < max_retries:
            try:
                csv_content, stats = self._generate_csv_data(backup_date)
                
                backup_datetime = datetime.strptime(backup_date, '%Y-%m-%d')
                folder_id = self._prepare_folder_structure(backup_datetime)
                
                day = backup_datetime.strftime('%d')
                file_name = f"{day}-collection.csv"
                
                upload_result = self._upload_to_drive(csv_content, file_name, folder_id)
                
                completed_at = datetime.now(timezone.utc)
                execution_time = int((completed_at - started_at).total_seconds())
                
                month = backup_datetime.strftime('%Y-%m')
                file_path = f"/{self.root_folder_name}/{month}/{file_name}"
                
                backup_history.file_name = file_name
                backup_history.file_path = file_path
                backup_history.drive_file_id = upload_result['file_id']
                backup_history.file_size_bytes = upload_result['file_size_bytes']
                backup_history.total_records = stats['total_records']
                backup_history.new_records = stats['new_records']
                backup_history.duplicate_removed = stats['duplicate_removed']
                backup_history.average_quality_score = stats['average_quality_score']
                backup_history.status = 'success'
                backup_history.completed_at = completed_at
                backup_history.execution_time_seconds = execution_time
                backup_history.retry_count = retry_count
                
                self.db.commit()
                
                logger.info(f"✅ Backup completed successfully: {file_path}")
                logger.info(f"   Records: {stats['total_records']}, Duplicates removed: {stats['duplicate_removed']}")
                logger.info(f"   Avg quality: {stats['average_quality_score']}, Time: {execution_time}s")
                
                return backup_history
                
            except Exception as e:
                retry_count += 1
                last_error = str(e)
                logger.error(f"❌ Backup attempt {retry_count} failed: {e}")
                
                if retry_count < max_retries:
                    logger.info(f"   Retrying in 5 seconds...")
                    import time
                    time.sleep(5)
        
        completed_at = datetime.now(timezone.utc)
        execution_time = int((completed_at - started_at).total_seconds())
        
        backup_history.status = 'failed'
        backup_history.error_message = last_error
        backup_history.retry_count = retry_count
        backup_history.completed_at = completed_at
        backup_history.execution_time_seconds = execution_time
        
        self.db.commit()
        
        logger.error(f"❌ Backup failed after {retry_count} attempts: {last_error}")
        
        return backup_history
    
    def get_backup_status(self) -> Dict[str, Any]:
        """최근 백업 상태 조회"""
        latest = self.db.query(BackupHistory).order_by(
            BackupHistory.completed_at.desc()
        ).first()
        
        if not latest:
            return {
                'status': 'no_backups',
                'message': '백업 이력이 없습니다'
            }
        
        return {
            'status': latest.status,
            'backup_date': latest.backup_date,
            'backup_type': latest.backup_type,
            'file_path': latest.file_path,
            'total_records': latest.total_records,
            'file_size_mb': round(latest.file_size_bytes / 1024 / 1024, 2) if latest.file_size_bytes else 0,
            'completed_at': latest.completed_at.isoformat() if latest.completed_at else None,
            'execution_time_seconds': latest.execution_time_seconds,
            'error_message': latest.error_message if latest.status == 'failed' else None
        }
    
    def get_backup_history(self, days: int = 7) -> List[Dict[str, Any]]:
        """최근 백업 이력 조회"""
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        
        backups = self.db.query(BackupHistory).filter(
            BackupHistory.completed_at >= cutoff
        ).order_by(BackupHistory.completed_at.desc()).all()
        
        return [
            {
                'backup_date': b.backup_date,
                'backup_type': b.backup_type,
                'status': b.status,
                'file_path': b.file_path,
                'total_records': b.total_records,
                'file_size_mb': round(b.file_size_bytes / 1024 / 1024, 2) if b.file_size_bytes else 0,
                'completed_at': b.completed_at.isoformat() if b.completed_at else None
            }
            for b in backups
        ]
