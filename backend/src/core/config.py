from typing import Literal, Set

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # OpenAPI docs
    OPENAPI_URL: str = "/openapi.json"

    # Database
    DATABASE_URL: str
    TEST_DATABASE_URL: str | None = None
    EXPIRE_ON_COMMIT: bool = False

    # User
    ACCESS_SECRET_KEY: str
    RESET_PASSWORD_SECRET_KEY: str
    VERIFICATION_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_SECONDS: int = 28800  # 8 hours

    # Cookie settings
    COOKIE_SECURE: bool = False  # Set to True in production
    COOKIE_SAMESITE: Literal["lax", "strict", "none"] = "lax"

    # Google OAuth
    GOOGLE_OAUTH_ENABLED: bool = False
    GOOGLE_OAUTH_CLIENT_ID: str | None = None
    GOOGLE_OAUTH_CLIENT_SECRET: str | None = None

    # Email
    MAIL_USERNAME: str | None = None
    MAIL_PASSWORD: str | None = None
    MAIL_FROM: str | None = None
    MAIL_SERVER: str | None = None
    MAIL_PORT: int | None = None
    MAIL_FROM_NAME: str = "FastAPI template"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True
    TEMPLATE_DIR: str = "email_templates"

    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"

    # CORS
    CORS_ORIGINS: Set[str]

    # Environment
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    @model_validator(mode="after")
    def validate_auth_settings(self) -> "Settings":
        if self.COOKIE_SAMESITE == "none" and not self.COOKIE_SECURE:
            raise ValueError("COOKIE_SAMESITE=none requires COOKIE_SECURE=true.")

        if self.GOOGLE_OAUTH_ENABLED and (
            not self.GOOGLE_OAUTH_CLIENT_ID or not self.GOOGLE_OAUTH_CLIENT_SECRET
        ):
            raise ValueError(
                "GOOGLE_OAUTH_ENABLED=true requires GOOGLE_OAUTH_CLIENT_ID and "
                "GOOGLE_OAUTH_CLIENT_SECRET."
            )

        if self.ENVIRONMENT.lower() == "production":
            if not self.COOKIE_SECURE:
                raise ValueError("COOKIE_SECURE must be true in production.")

            weak_secrets = [
                name
                for name, value in (
                    ("ACCESS_SECRET_KEY", self.ACCESS_SECRET_KEY),
                    ("RESET_PASSWORD_SECRET_KEY", self.RESET_PASSWORD_SECRET_KEY),
                    ("VERIFICATION_SECRET_KEY", self.VERIFICATION_SECRET_KEY),
                )
                if len(value) < 32
            ]
            if weak_secrets:
                raise ValueError(
                    "Production auth secrets must be at least 32 characters: "
                    + ", ".join(weak_secrets)
                )

        return self


settings = Settings()  # ty: ignore[missing-argument]  # populated from .env
