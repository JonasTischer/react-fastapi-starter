import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.models import User
from src.auth.service import current_active_user
from src.core.database import get_async_session

from .models import Item
from .schemas import ItemCreate, ItemRead, ItemUpdate

router = APIRouter()


@router.get("", response_model=list[ItemRead])
async def list_items(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> list[Item]:
    result = await session.execute(select(Item).where(Item.user_id == user.id))
    return list(result.scalars().all())


@router.post("", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
async def create_item(
    payload: ItemCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> Item:
    item = Item(**payload.model_dump(), user_id=user.id)
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item


@router.patch("/{item_id}", response_model=ItemRead)
async def update_item(
    item_id: uuid.UUID,
    payload: ItemUpdate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> Item:
    item = await _get_owned_item(session, item_id, user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await session.commit()
    await session.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> None:
    item = await _get_owned_item(session, item_id, user.id)
    await session.delete(item)
    await session.commit()


async def _get_owned_item(
    session: AsyncSession, item_id: uuid.UUID, user_id: uuid.UUID
) -> Item:
    result = await session.execute(
        select(Item).where(Item.id == item_id, Item.user_id == user_id)
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )
    return item
