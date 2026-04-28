from pathlib import Path
import urllib.parse

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from src.core.config import settings
from src.auth.models import User


def get_email_config():
    if (
        settings.MAIL_USERNAME is None
        or settings.MAIL_PASSWORD is None
        or settings.MAIL_FROM is None
        or settings.MAIL_PORT is None
        or settings.MAIL_SERVER is None
    ):
        raise RuntimeError(
            "Email is not configured. Set MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM, "
            "MAIL_PORT, and MAIL_SERVER in the backend .env."
        )
    return ConnectionConfig(
        MAIL_USERNAME=settings.MAIL_USERNAME,
        MAIL_PASSWORD=settings.MAIL_PASSWORD,  # ty: ignore[invalid-argument-type]  # str coerced to SecretStr
        MAIL_FROM=settings.MAIL_FROM,
        MAIL_PORT=settings.MAIL_PORT,
        MAIL_SERVER=settings.MAIL_SERVER,
        MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
        MAIL_STARTTLS=settings.MAIL_STARTTLS,
        MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
        USE_CREDENTIALS=settings.USE_CREDENTIALS,
        VALIDATE_CERTS=settings.VALIDATE_CERTS,
        TEMPLATE_FOLDER=Path(__file__).parent.parent / "core" / "email_templates",
    )


async def send_reset_password_email(user: User, token: str):
    conf = get_email_config()
    email = user.email
    base_url = f"{settings.FRONTEND_URL}/password-recovery/confirm?"
    params = {"token": token}
    encoded_params = urllib.parse.urlencode(params)
    link = f"{base_url}{encoded_params}"
    message = MessageSchema(
        subject="Password recovery",
        recipients=[email],  # ty: ignore[invalid-argument-type]  # fastapi-mail accepts str
        template_body={"username": email, "link": link},
        subtype=MessageType.html,
    )

    fm = FastMail(conf)
    await fm.send_message(message, template_name="password_reset.html")
