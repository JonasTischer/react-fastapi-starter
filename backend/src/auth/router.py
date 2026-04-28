from typing import cast

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi_users import exceptions, schemas
from fastapi_users.router.common import ErrorCode

from src.core.config import settings
from .service import (
    fastapi_users,
    auth_backend,
    oauth_auth_backend,
    google_oauth_client,
    get_user_manager,
    current_active_user,
    UserManager,
)
from .models import User
from .schemas import UserRead, UserCreate, UserUpdate

router = APIRouter()

# Include authentication and user management routes
router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/jwt",
    tags=["auth"],
)
router.include_router(
    fastapi_users.get_reset_password_router(),
    tags=["auth"],
)


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    tags=["auth"],
    name="register:register",
)
async def register(
    request: Request,
    user_create: UserCreate,
    user_manager: UserManager = Depends(get_user_manager),
) -> UserRead:
    try:
        created_user = await user_manager.create(
            cast(schemas.BaseUserCreate, user_create), safe=True, request=request
        )
    except exceptions.UserAlreadyExists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorCode.REGISTER_USER_ALREADY_EXISTS,
        )
    except exceptions.InvalidPasswordException as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": ErrorCode.REGISTER_INVALID_PASSWORD,
                "reason": error.reason,
            },
        )

    return UserRead.model_validate(created_user)


@router.get("/users/me", response_model=UserRead, tags=["users"])
async def current_user(user: User = Depends(current_active_user)) -> User:
    return user


@router.patch("/users/me", response_model=UserRead, tags=["users"])
async def update_current_user(
    request: Request,
    payload: UserUpdate,
    user: User = Depends(current_active_user),
    user_manager: UserManager = Depends(get_user_manager),
) -> UserRead:
    try:
        updated_user = await user_manager.update(
            cast(schemas.BaseUserUpdate, payload), user, safe=True, request=request
        )
    except exceptions.UserAlreadyExists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorCode.UPDATE_USER_EMAIL_ALREADY_EXISTS,
        )
    except exceptions.InvalidPasswordException as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": ErrorCode.UPDATE_USER_INVALID_PASSWORD,
                "reason": error.reason,
            },
        )

    return UserRead.model_validate(updated_user)


if google_oauth_client is not None:
    router.include_router(
        fastapi_users.get_oauth_router(
            google_oauth_client,
            oauth_auth_backend,
            settings.ACCESS_SECRET_KEY,
            associate_by_email=True,
            is_verified_by_default=True,
        ),
        prefix="/google",
        tags=["auth"],
    )
