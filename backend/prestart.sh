#!/usr/bin/env bash
# Production entrypoint: apply database migrations, then start the server.
# Dependencies live on the PATH via /app/.venv/bin (set in Dockerfile.prod),
# so we call alembic/uvicorn directly rather than through `uv run`.
set -euo pipefail

echo "Applying database migrations..."
alembic upgrade head

echo "Starting Uvicorn (production, no reload)..."
exec uvicorn src.main:app --host 0.0.0.0 --port 8000
