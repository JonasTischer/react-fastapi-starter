import uuid

from pydantic import ConfigDict, EmailStr
from fastapi_users import schemas


class UserRead(schemas.BaseUser[uuid.UUID]):
    pass


class UserCreate(schemas.CreateUpdateDictModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str


class UserUpdate(schemas.CreateUpdateDictModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr | None = None
    password: str | None = None
