# Backend Dockerfile for FastAPI/uvicorn
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps (optional: gcc for psycopg2-binary not required; keep minimal)
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

# Copy application
COPY app /app/app
COPY alembic.ini /app/alembic.ini

EXPOSE 8000

# The command is provided by docker-compose.yml (uvicorn with --reload)


