# Variables
BACKEND_DIR := "backend"
FRONTEND_DIR := "frontend"
DOCKER_COMPOSE := "docker compose"

# Help
help:
    @echo "Available commands:"
    @just --list

#
setup: ## Create env files, install deps (frontend + backend), and install pre-commit hooks
    #!/usr/bin/env bash
    set -euo pipefail
    echo "==> Creating env files (if missing)"
    if [ ! -f {{BACKEND_DIR}}/.env ]; then
        cp {{BACKEND_DIR}}/.env.example {{BACKEND_DIR}}/.env
        echo "    created {{BACKEND_DIR}}/.env"
    else
        echo "    {{BACKEND_DIR}}/.env already exists"
    fi
    if [ ! -f {{FRONTEND_DIR}}/.env.local ]; then
        cp {{FRONTEND_DIR}}/.env.local.example {{FRONTEND_DIR}}/.env.local
        echo "    created {{FRONTEND_DIR}}/.env.local"
    else
        echo "    {{FRONTEND_DIR}}/.env.local already exists"
    fi
    echo "==> Installing frontend dependencies"
    (cd {{FRONTEND_DIR}} && pnpm install)
    echo "==> Installing backend dependencies + pre-commit hooks"
    (cd {{BACKEND_DIR}} && uv sync --all-extras --dev && uv run pre-commit install -c ../.pre-commit-config.yaml)
    echo ""
    echo "✅ Setup complete. Next steps:"
    echo "   just docker-up-db   # start Postgres"
    echo "   just migrate        # apply database migrations"
    echo "   just dev            # run backend + frontend"

gen-secrets: ## Print strong secret values (openssl rand) for backend/.env
    #!/usr/bin/env bash
    echo "# Copy these into backend/.env (each is a fresh 32-byte hex secret):"
    echo "ACCESS_SECRET_KEY=$(openssl rand -hex 32)"
    echo "RESET_PASSWORD_SECRET_KEY=$(openssl rand -hex 32)"
    echo "VERIFICATION_SECRET_KEY=$(openssl rand -hex 32)"

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

typecheck: ## Run type checking for frontend (tsc) and backend (ty)
    cd {{FRONTEND_DIR}} && pnpm run typecheck
    cd {{BACKEND_DIR}} && uv run ty check .

typecheck-frontend: ## Run TypeScript type checking (frontend only)
    cd {{FRONTEND_DIR}} && pnpm run typecheck

typecheck-backend: ## Run ty type checking (backend only)
    cd {{BACKEND_DIR}} && uv run ty check .

# Development commands
dev: ## Start both backend and frontend servers concurrently (Ctrl+C stops both)
    #!/usr/bin/env bash
    set -euo pipefail

    if [ ! -d "{{FRONTEND_DIR}}/node_modules" ] || [ ! -f "{{BACKEND_DIR}}/.env" ]; then
        echo "❌ Project not set up yet. Run 'just setup' first." >&2
        echo "   (missing {{FRONTEND_DIR}}/node_modules and/or {{BACKEND_DIR}}/.env)" >&2
        exit 1
    fi

    echo "Starting backend and frontend servers..."

    terminate_tree() {
        local pid="$1"
        local signal="${2:-TERM}"
        local child

        while read -r child; do
            [ -n "$child" ] && terminate_tree "$child" "$signal"
        done < <(pgrep -P "$pid" 2>/dev/null || true)

        kill "-$signal" "$pid" 2>/dev/null || true
    }

    wait_for_exit() {
        local pid="$1"
        for _ in $(seq 1 30); do
            kill -0 "$pid" 2>/dev/null || return 0
            sleep 0.1
        done
        return 1
    }

    cleanup() {
        trap - INT TERM EXIT

        terminate_tree "$BACKEND_PID" TERM
        terminate_tree "$FRONTEND_PID" TERM

        wait_for_exit "$BACKEND_PID" || terminate_tree "$BACKEND_PID" KILL
        wait_for_exit "$FRONTEND_PID" || terminate_tree "$FRONTEND_PID" KILL

        wait 2>/dev/null || true
    }

    (cd {{BACKEND_DIR}} && ./start.sh) &
    BACKEND_PID=$!
    (cd {{FRONTEND_DIR}} && ./start.sh) &
    FRONTEND_PID=$!
    trap cleanup EXIT
    trap 'cleanup; exit 0' INT TERM
    wait "$BACKEND_PID" "$FRONTEND_PID"

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
    VOLUME_NAME="app_db"
    if [ -n "{{BRANCH}}" ]; then
        VOLUME_NAME="app_db_{{BRANCH}}"
    fi
    echo "Starting db with volume: ${VOLUME_NAME}"
    DB_VOLUME_NAME="${VOLUME_NAME}" {{DOCKER_COMPOSE}} up -d db

docker-up-test-db: ## Start the test database
  {{DOCKER_COMPOSE}} up -d db_test

docker-migrate: ## Run database migrations using Alembic
    {{DOCKER_COMPOSE}} run --rm backend uv run alembic upgrade head

docker-create-migration MESSAGE="": ## Create a new migration. Usage: just create-migration MESSAGE="add scenarios table"
    {{DOCKER_COMPOSE}} run --rm backend uv run alembic revision --autogenerate -m "{{MESSAGE}}"
