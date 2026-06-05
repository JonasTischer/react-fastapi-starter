# React + FastAPI Starter

A modern full-stack starter kit pairing a **React + Vite** single-page app with a fully asynchronous **FastAPI** backend. It follows clean architecture and best practices, and gives you end-to-end type safety: a typed API client is generated from the backend's OpenAPI schema, so the frontend and backend never drift out of sync.

The whole stack runs locally with `just dev` or in containers via `docker compose up`. For production there's a hardened, Nginx-served frontend image and a slim uv-based backend image — see [Production](#production).

### Key features
✔ **End-to-end type safety** – A typed client (`@hey-api/openapi-ts`) is generated from the OpenAPI schema, so API contracts are enforced at compile time.

✔ **Hot-reload everything** – Vite HMR on the frontend, uvicorn `--reload` on the backend, and a watcher that regenerates the typed client whenever backend routes change.

✔ **File-based routing** – TanStack Router with type-safe routes, search params, and an authenticated layout guard.

✔ **Production-ready authentication** – `fastapi-users` with HTTPOnly-cookie JWT auth, Google OAuth, password reset, and a shadcn/ui dashboard you can build on immediately.

## Technology stack

**Frontend**
- React 19 + Vite – Fast SPA dev server and optimized production builds.
- TanStack Router – Type-safe, file-based routing (`src/routes`).
- TanStack Query – Server-state management.
- shadcn/ui + Tailwind CSS v4 – Prebuilt, accessible React components.
- Zod + TypeScript – Schema validation and type safety across the stack.
- `@hey-api/openapi-ts` – Fully typed client generated from the OpenAPI schema.
- Biome – Linting and formatting.
- Vitest + Playwright – Unit and end-to-end testing.

**Backend**
- FastAPI (async) + Pydantic – High-performance, fully typed API.
- fastapi-users – Auth with secure password hashing, JWT, and email-based recovery.
- PostgreSQL + SQLAlchemy + Alembic – Database and migrations.
- uv – Fast Python dependency management.
- Pytest (+ coverage) – Backend test suite.
- ruff + ty – Linting and type checking.

**Tooling**
- Docker Compose – Consistent dev and production environments.
- Pre-commit hooks – Lint, format, typecheck, and client regeneration before commits.
- GitHub Actions – CI for backend, frontend, and E2E.
- Just – Command runner (`justfile`).

## Getting Started

### First-Time Setup
1. Copy environment templates and adjust secrets as needed:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.local.example frontend/.env.local
   ```
2. Install backend and frontend dependencies and set up pre-commit hooks:
   ```bash
   just setup
   ```
3. Start Postgres (if you are not running a local instance already):
   ```bash
   just docker-up-db
   ```
4. Apply database migrations:
   ```bash
   just migrate
   ```

### Daily Development Flow
1. Launch the stack:
   - `just start-backend` – FastAPI with hot reload (uv + uvicorn) on `http://localhost:8000`
   - `just start-frontend` – Vite dev server on `http://localhost:5173`
   - `just dev` – Convenience command that kicks off both (stop with `Ctrl+C`)
2. Regenerate the typed API client whenever backend schemas or routes change (the watcher does this automatically while `start-backend` runs):
   ```bash
   just generate-client
   ```
3. Keep the database schema up to date:
   ```bash
   just migrate                # Apply Alembic migrations locally
   just create-migration MESSAGE="add scenarios table"   # Generate a new migration
   ```

### Default ports
| Service        | URL                     |
| -------------- | ----------------------- |
| Frontend (Vite)| http://localhost:5173   |
| Backend (API)  | http://localhost:8000   |
| API docs       | http://localhost:8000/docs |
| MailHog UI     | http://localhost:8025   |

## Common Commands
**Quality checks**
- `just typecheck` – TypeScript (`tsc`) for the frontend + `ty` for the backend
- `just lint` – Ruff (Python) + Biome (frontend) with autofix
- `just format` – Formatting

**Testing**
- `just test-backend` – Backend pytest suite
- `just test-e2e` – Frontend Playwright end-to-end tests
- `just test` – Backend pytest followed by frontend Vitest unit tests

**Docker workflows**
- `just docker-up-test-db` – Start the test database container
- `just docker-migrate` – Run Alembic migrations inside the backend container
- `just docker-create-migration MESSAGE="..."` – Generate migrations via Docker

Run `just --list` or `just help` for a full catalog of tasks and descriptions.

## End-to-end tests

The Playwright test suite lives under `frontend/e2e` and validates the authentication flow from the browser perspective. To execute the tests locally:

1. Ensure the FastAPI backend is running and reachable at `http://127.0.0.1:8000` (or export `PLAYWRIGHT_API_BASE_URL` with the correct address).
2. Install the Playwright browsers once with `pnpm exec playwright install --with-deps`.
3. From `frontend`, run `pnpm test:e2e`.

Playwright starts the Vite dev server automatically. Override the frontend URL by exporting `PLAYWRIGHT_BASE_URL`, or the port via `PLAYWRIGHT_WEB_PORT` (defaults to `5173`).

## Production

The repo ships optimized production images and a separate compose file:

- **Frontend** (`frontend/Dockerfile.prod`) – builds the Vite app and serves the static `dist/` through Nginx with SPA fallback. `VITE_*` values are inlined at build time, so pass them as build args.
- **Backend** (`backend/Dockerfile.prod`) – installs runtime dependencies with `uv sync --frozen --no-dev`, compiles bytecode, runs as a non-root user, and on startup applies Alembic migrations (`prestart.sh`) before launching uvicorn without `--reload`.

Bring the whole production-like stack up (Postgres + backend + Nginx frontend, with health checks and migrations):

```bash
export ACCESS_SECRET_KEY=...           # each >= 32 chars
export RESET_PASSWORD_SECRET_KEY=...
export VERIFICATION_SECRET_KEY=...
docker compose -f docker-compose.prod.yml up --build --wait
```

The frontend is served on `http://localhost:8080` and the API on `http://localhost:8000`.

> **Note:** Production sets `COOKIE_SECURE=true`, so browsers only send the auth cookie over HTTPS. Front the stack with a TLS terminator (Caddy, Traefik, or your cloud load balancer) and set `VITE_API_BASE_URL`, `CORS_ORIGINS`, and `FRONTEND_URL` to your real `https://` origins.
