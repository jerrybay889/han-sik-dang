# Restaurant Data Hub Dockerfile
# Google Cloud Run 배포용

FROM python:3.11-slim

WORKDIR /app

# 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Playwright 브라우저 설치 (필요 시)
# RUN playwright install chromium

# 소스 코드 복사
COPY . .

# 환경 변수
ENV PYTHONUNBUFFERED=1

# 포트 노출
EXPOSE 8000

# 서버 실행
CMD ["python", "-m", "src.api.main"]
