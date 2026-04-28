# Variables
BACKEND_DIR := "backend"
FRONTEND_DIR := "frontend"
DOCKER_COMPOSE := "docker compose"

# Help
help:
    @echo "Available commands:"
    @just --list

#
setup: ## Setup the project
    cd {{FRONTEND_DIR}} && pnpm install
    cd {{BACKEND_DIR}} && uv sync --all-extras --dev
    cd {{BACKEND_DIR}} && uv run pre-commit install -c ../.pre-commit-config.yaml

# Backend commands
start-backend: ## Start the backend server with FastAPI and hot reload
	cd {{BACKEND_DIR}} && ./start.sh

test-backend *ARGS: ## Run all backend tests (unit + integration)
    cd {{BACKEND_DIR}} && uv run pytest -m "not integration" {{ARGS}}
    cd {{BACKEND_DIR}} && uv run pytest -m integration {{ARGS}}

test-unit *ARGS: ## Run backend unit tests (excludes integration)
    cd {{BACKEND_DIR}} && uv run pytest -m "not integration" {{ARGS}}

test-integration *ARGS: ## Run backend integration tests only
    cd {{BACKEND_DIR}} && uv run pytest -m integration {{ARGS}}

migrate: ## Run database migrations locally (without Docker)
    cd {{BACKEND_DIR}} && uv run alembic upgrade head

create-migration MESSAGE="": ## Create a new migration locally. Usage: just create-migration-local MESSAGE="add scenarios table"
    cd {{BACKEND_DIR}} && uv run alembic revision --autogenerate -m "{{MESSAGE}}"

check-migrations: ## Check for multiple alembic heads (fails if more than one head exists)
    #!/usr/bin/env bash
    cd {{BACKEND_DIR}}
    HEAD_COUNT=$(uv run alembic heads | wc -l | tr -d ' ')
    if [ "$HEAD_COUNT" -gt 1 ]; then
        echo "❌ ERROR: Multiple alembic heads detected:"
        uv run alembic heads
        echo ""
        echo "To fix this, run: uv run alembic merge -m 'merge migrations' heads"
        exit 1
    else
        echo "✅ Migration check passed: Single head detected"
        uv run alembic heads
    fi

# Frontend commands
start-frontend: ## Start the frontend server with pnpm and hot reload
    cd {{FRONTEND_DIR}} && ./start.sh

typecheck: ## Run type checking for frontend and backend
    cd {{FRONTEND_DIR}} && pnpm run typecheck
    cd {{BACKEND_DIR}} && uv run ty check .

typecheck-frontend: ## Run TypeScript type checking (frontend only)
    cd {{FRONTEND_DIR}} && pnpm run typecheck

typecheck-backend: ## Run ty type checking (backend only)
    cd {{BACKEND_DIR}} && uv run ty check .

# Development commands
dev: ## Start both backend and frontend servers concurrently
    @echo "Starting backend and frontend servers..."
    cd {{FRONTEND_DIR}} && ./start.sh & cd {{BACKEND_DIR}} && ./start.sh

dev-conductor: ## Start backend/frontend using Conductor env (workspace ports/db)
    ./scripts/conductor-run.sh

lint: ## Run linting for both backend and frontend
    cd {{BACKEND_DIR}} && uv run ruff check . --fix
    cd {{FRONTEND_DIR}} && pnpm run lint:fix

lint-check: ## Check linting without fixing (matches pre-commit)
    cd {{BACKEND_DIR}} && uv run ruff check .
    cd {{FRONTEND_DIR}} && pnpm biome lint ./src

format: ## Run formatting for both backend and frontend
    cd {{BACKEND_DIR}} && uv run ruff format .
    cd {{FRONTEND_DIR}} && pnpm run format

format-check: ## Check formatting without fixing (matches pre-commit)
    cd {{BACKEND_DIR}} && uv run ruff format --check .
    cd {{FRONTEND_DIR}} && pnpm biome format ./src

test: ## Run tests for both backend and frontend
    cd {{BACKEND_DIR}} && uv run pytest -m "not integration"
    cd {{BACKEND_DIR}} && uv run pytest -m integration
    cd {{FRONTEND_DIR}} && pnpm run test

test-e2e: ## Run E2E tests only (backend must be running)
    cd {{FRONTEND_DIR}} && pnpm run test:e2e

generate-client: ## Generate OpenAPI schema and regenerate frontend client
	@echo "Generating OpenAPI schema..."
	cd {{BACKEND_DIR}} && uv run python -m commands.generate_openapi_schema
	@echo "Regenerating frontend client..."
	cd {{FRONTEND_DIR}} && pnpm run generate-client

## Docker commands
docker-up-db BRANCH="": ## Start the database (optionally per-branch volume via BRANCH)
    #!/usr/bin/env bash
    set -euo pipefail
    VOLUME_NAME="whispa_db"
    if [ -n "{{BRANCH}}" ]; then
        VOLUME_NAME="whispa_db_{{BRANCH}}"
    fi
    echo "Starting db with volume: ${VOLUME_NAME}"
    DB_VOLUME_NAME="${VOLUME_NAME}" {{DOCKER_COMPOSE}} up -d db

docker-up-test-db: ## Start the test database
  {{DOCKER_COMPOSE}} up -d db_test

docker-migrate: ## Run database migrations using Alembic
    {{DOCKER_COMPOSE}} run --rm backend uv run alembic upgrade head

docker-create-migration MESSAGE="": ## Create a new migration. Usage: just create-migration MESSAGE="add scenarios table"
    {{DOCKER_COMPOSE}} run --rm backend uv run alembic revision --autogenerate -m "{{MESSAGE}}"
