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
1. Create the env files, install dependencies (frontend + backend), and set up
   pre-commit hooks — all in one step:
   ```bash
   just setup
   ```
   This copies `backend/.env` and `frontend/.env.local` from their `.example`
   templates if they don't exist yet. Adjust secrets in `backend/.env` as needed.
2. Start Postgres (if you are not running a local instance already):
   ```bash
   just docker-up-db
   ```
3. Apply database migrations:
   ```bash
   just migrate
   ```
4. Run the stack:
   ```bash
   just dev
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
# Generate strong secrets (or use your own):
just gen-secrets
export ACCESS_SECRET_KEY=...           # each >= 32 chars
export RESET_PASSWORD_SECRET_KEY=...
export VERIFICATION_SECRET_KEY=...
docker compose -f docker-compose.prod.yml up --build --wait
```

The frontend is served on `http://localhost:8080` and the API on `http://localhost:8000`.

> **Note:** Production sets `COOKIE_SECURE=true`, so browsers only send the auth cookie over HTTPS. Front the stack with a TLS terminator (Caddy, Traefik, or your cloud load balancer) and set `VITE_API_BASE_URL`, `CORS_ORIGINS`, and `FRONTEND_URL` to your real `https://` origins.

### What's already hardened
- **Rate limiting** — `slowapi` applies a global per-IP default (`RATE_LIMIT_DEFAULT`) plus a stricter limit on `/auth/register`. Tune via `RATE_LIMIT_*`; set `RATE_LIMIT_ENABLED=false` to disable (used by the test/e2e suites).
- **Security headers** — the Nginx frontend sends `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`. Tighten the CSP `connect-src` to your real API/Sentry origins.
- **Error tracking** — set `SENTRY_DSN` (backend) and `VITE_SENTRY_DSN` (frontend) to stream errors to Sentry. Both are no-ops when unset.
- **Health & readiness** — `GET /health` is a liveness probe; `GET /health/ready` checks the database (`SELECT 1`). The prod compose healthcheck uses readiness.
- **Workers** — the prod backend runs `uvicorn --workers ${WEB_CONCURRENCY:-2}` (migrations run once on startup via `prestart.sh`). Set `WEB_CONCURRENCY` to roughly your CPU count.
- **Error boundary** — a render error in any route shows a recovery screen (and reports to Sentry) instead of a blank page.

### Email verification
The verification flow is **scaffolded but off by default**: routes are guarded by `current_active_user` (active, not necessarily verified), and `on_after_register` does not send a verification email — so registration works out of the box without a configured SMTP server. To require verified emails:
1. Include `fastapi_users.get_verify_router(...)` in `backend/src/auth/router.py`.
2. Call `await self.request_verify(user, request)` from `on_after_register` in `backend/src/auth/service.py` (sends the email).
3. Swap the route dependency to `current_active_verified_user`.

### Database — backups & connection pooling
- **Pooling** is configurable per worker via `DB_POOL_SIZE`, `DB_MAX_OVERFLOW`, and `DB_POOL_PRE_PING` (pre-ping recycles stale connections — recommended on). Size the pool to your worker count and database `max_connections`.
- **Backups** — the compose Postgres uses a named volume; for production use a managed Postgres with automated backups, or schedule `pg_dump`:
  ```bash
  docker compose exec db pg_dump -U postgres mydatabase > backup_$(date +%F).sql
  ```
- **Migrations** run automatically on container start in production (`prestart.sh`); locally use `just migrate`.
