import sentry_sdk
from fastapi import Depends, FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi_pagination import add_pagination
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.router import router as auth_router
from src.core.config import settings
from src.core.database import get_async_session
from src.core.limiter import limiter
from src.items.router import router as items_router
from src.shared.utils import simple_generate_unique_route_id

# Initialize Sentry before the app is created. No-op when SENTRY_DSN is unset,
# so local/dev/test runs are unaffected.
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
    )

app = FastAPI(
    generate_unique_id_function=simple_generate_unique_route_id,
    openapi_url=settings.OPENAPI_URL,
)

# Rate limiting (slowapi): the global default (settings.RATE_LIMIT_DEFAULT) is
# enforced on every route by SlowAPIMiddleware; sensitive endpoints add stricter
# per-route limits via @limiter.limit(...).
app.state.limiter = limiter
# slowapi's handler narrows `exc` to RateLimitExceeded, which doesn't match
# Starlette's broader ExceptionHandler signature — safe to ignore.
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # ty: ignore[invalid-argument-type]
app.add_middleware(SlowAPIMiddleware)

# CORS credentials are required for HTTP-only auth cookies to be sent on
# cross-origin browser requests. SameSite=lax reduces CSRF exposure for this
# starter's default localhost setup; stricter production deployments should add
# explicit CSRF protection for unsafe cross-site methods.
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.CORS_ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    """Liveness probe — the process is up. Does not touch the database."""
    return {"status": "ok"}


@app.get("/health/ready", tags=["health"])
async def health_ready(
    session: AsyncSession = Depends(get_async_session),
) -> JSONResponse:
    """Readiness probe — verifies the database is reachable (SELECT 1)."""
    try:
        await session.execute(text("SELECT 1"))
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "unavailable", "database": "unreachable"},
        )
    return JSONResponse(content={"status": "ok", "database": "ok"})


app.include_router(auth_router, prefix="/auth")
app.include_router(items_router, prefix="/items", tags=["items"])

add_pagination(app)
