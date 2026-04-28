## Next.js FastAPI Template


The Next.js FastAPI Template provides a solid foundation for scalable, high-performance web applications, following clean architecture and best practices. It simplifies development by integrating FastAPI, Pydantic, and Next.js with TypeScript and Zod, ensuring end-to-end type safety and schema validation between frontend and backend.

The FastAPI backend supports fully asynchronous operations, optimizing database queries, API routes, and test execution for better performance. The whole stack runs locally with `just dev` or in containers via `docker compose up`.

### Key features
✔ End-to-end type safety – Automatically generated typed clients from the OpenAPI schema ensure seamless API contracts between frontend and backend.

✔ Hot-reload updates – The client updates automatically when backend routes change, keeping FastAPI and Next.js in sync.

✔ Versatile foundation – Designed for MVPs and production-ready applications, with a pre-configured authentication system and API layer.

✔ Production-ready authentication – Pre-configured fastapi-users with HTTPOnly-cookie JWT auth, Google OAuth, password reset, and a shadcn/ui dashboard you can build on immediately.

## Technology stack
This template features a carefully selected set of technologies to ensure efficiency, scalability, and ease of use:

- Zod + TypeScript – Type safety and schema validation across the stack.
- fastapi-users – Complete authentication system with:
    - Secure password hashing
    - JWT authentication
- Email-based password recovery
- shadcn/ui – Prebuilt React components with Tailwind CSS.
- OpenAPI-fetch – Fully typed client generation from the OpenAPI schema.
- UV – Simplified dependency management and packaging.
- Docker Compose – Consistent environments for development and production.
- Pre-commit hooks – Automated code linting, formatting, and validation before commits.
- PostgreSQL with SQLAlchemy and Alembic – Robust database management and migrations.
- Pytest and Playwright – Comprehensive testing for backend and end-to-end scenarios.
- GitHub Actions – CI/CD pipelines for automated testing and deployment.
- Just - Command runner – Simplified task execution with a `Justfile`.

## Getting Started

## First-Time Setup
1. Copy environment templates and adjust secrets as needed:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.local.example frontend/.env.local
   ```
2. Install backend and frontend dependencies and setup precommit hooks:
   ```bash
   just setup
   ```
3. Start Postgres (if you are not running a local instance already):
   ```bash
   just docker-up-db
   ```

## Daily Development Flow
1. Launch the stack:
   - `just start-backend` – FastAPI with hot reload (uv + uvicorn)
   - `just start-frontend` – Next.js dev server (`pnpm` script)
   - `just dev` – Convenience command that kicks off both (stop with `Ctrl+C`)
2. Regenerate the typed API client whenever backend schemas or routes change:
   ```bash
   just generate-client
   ```
3. Keep the database schema up to date:
   ```bash
   just migrate                # Apply Alembic migrations locally
   just create-migration MESSAGE="add scenarios table"   # Generate a new migration
   ```


## Common Commands
**Quality checks**
- `just typecheck` – Next.js TypeScript project type checking
- `just lint` – Ruff (Python) + ESLint (frontend) with autofix
- `just format` – Format validation (no writes)

**Testing**
- `just test-backend` – Backend pytest suite
- `just test-e2e` – Frontend Playwright end-to-end tests
- `just test` – Backend pytest followed by frontend unit tests

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

You can override the frontend URL Playwright uses by exporting `PLAYWRIGHT_BASE_URL` or the port via `PLAYWRIGHT_WEB_PORT`.



*Disclaimer: This project is not affiliated with Vercel.*
