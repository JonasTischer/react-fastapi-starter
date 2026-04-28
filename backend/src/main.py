from fastapi import FastAPI
from fastapi_pagination import add_pagination
from fastapi.middleware.cors import CORSMiddleware

from src.auth.router import router as auth_router
from src.items.router import router as items_router
from src.shared.utils import simple_generate_unique_route_id
from src.core.config import settings

app = FastAPI(
    generate_unique_id_function=simple_generate_unique_route_id,
    openapi_url=settings.OPENAPI_URL,
)

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

app.include_router(auth_router, prefix="/auth")
app.include_router(items_router, prefix="/items", tags=["items"])

add_pagination(app)
