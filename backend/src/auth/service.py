import logging
import re
import uuid

from typing import Optional

from fastapi import Depends, Request
from fastapi_users import (
    BaseUserManager,
    FastAPIUsers,
    UUIDIDMixin,
    InvalidPasswordException,
)

from fastapi_users.authentication import (
    AuthenticationBackend,
    CookieTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase
from httpx_oauth.clients.google import GoogleOAuth2

from src.core.config import settings
from src.core.database import get_user_db
from src.shared.email import send_reset_password_email
from .models import User
from .schemas import UserCreate

AUTH_URL_PATH = "auth"

logger = logging.getLogger(__name__)

google_oauth_client = (
    GoogleOAuth2(
        settings.GOOGLE_OAUTH_CLIENT_ID or "",
        settings.GOOGLE_OAUTH_CLIENT_SECRET or "",
        scopes=["openid", "email", "profile"],
    )
    if settings.GOOGLE_OAUTH_ENABLED
    else None
)


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.RESET_PASSWORD_SECRET_KEY
    verification_token_secret = settings.VERIFICATION_SECRET_KEY

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        logger.info("User %s has registered.", user.id)

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        await send_reset_password_email(user, token)

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        logger.info("Verification requested for user %s.", user.id)

    async def validate_password(
        self,
        password: str,
        user: UserCreate | User,
    ) -> None:
        errors = []

        if len(password) < 8:
            errors.append("Password should be at least 8 characters.")
        if user.email in password:
            errors.append("Password should not contain e-mail.")
        if not any(char.isupper() for char in password):
            errors.append("Password should contain at least one uppercase letter.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password should contain at least one special character.")

        if errors:
            raise InvalidPasswordException(reason=errors)


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


class RedirectCookieTransport(CookieTransport):
    """Custom cookie transport that redirects to frontend after OAuth login."""

    async def get_login_response(self, token: str):
        response = await super().get_login_response(token)
        # For OAuth callbacks, redirect to frontend after setting cookie
        response.status_code = 307
        response.headers["Location"] = f"{settings.FRONTEND_URL}/auth-callback"
        return response


cookie_transport = CookieTransport(
    cookie_name="access_token",
    cookie_max_age=settings.ACCESS_TOKEN_EXPIRE_SECONDS,
    cookie_httponly=True,
    cookie_secure=settings.COOKIE_SECURE,
    cookie_samesite=settings.COOKIE_SAMESITE,
)

# OAuth-specific cookie transport with redirect
oauth_cookie_transport = RedirectCookieTransport(
    cookie_name="access_token",
    cookie_max_age=settings.ACCESS_TOKEN_EXPIRE_SECONDS,
    cookie_httponly=True,
    cookie_secure=settings.COOKIE_SECURE,
    cookie_samesite=settings.COOKIE_SAMESITE,
)


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(
        secret=settings.ACCESS_SECRET_KEY,
        lifetime_seconds=settings.ACCESS_TOKEN_EXPIRE_SECONDS,
    )


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)

# OAuth-specific auth backend with redirect
oauth_auth_backend = AuthenticationBackend(
    name="oauth-jwt",
    transport=oauth_cookie_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])

current_active_user = fastapi_users.current_user(active=True)
