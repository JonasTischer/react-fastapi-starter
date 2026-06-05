"""Shared slowapi rate limiter.

Keyed by client IP. The global default (settings.RATE_LIMIT_DEFAULT) is applied
to every route via SlowAPIMiddleware in main.py; sensitive endpoints add stricter
per-route limits with `@limiter.limit(...)`. Set RATE_LIMIT_ENABLED=false to turn
limiting off entirely (used by the test/e2e suites).
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

from src.core.config import settings

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[settings.RATE_LIMIT_DEFAULT],
    enabled=settings.RATE_LIMIT_ENABLED,
)
