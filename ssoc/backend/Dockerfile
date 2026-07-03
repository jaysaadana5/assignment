# Backend image for the SSOC site (FastAPI + MongoDB).
# Serves both the JSON API under /api and the static frontend (frontend/public).
FROM python:3.11-slim

WORKDIR /app

# System deps kept minimal; add build tools only if a wheel needs compiling.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first for better layer caching.
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy the application code and the static frontend it serves.
COPY backend /app/backend
COPY frontend/public /app/frontend/public

ENV SERVE_STATIC=true \
    STATIC_DIR=/app/frontend/public \
    PYTHONUNBUFFERED=1

EXPOSE 8000

WORKDIR /app/backend
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
