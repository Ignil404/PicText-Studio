"""Admin users router — user management for administrators."""

from __future__ import annotations

import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func, select

from database import async_session_factory
from dependencies import require_admin
from models import RenderHistory, User

router = APIRouter(
    prefix="/api/admin/users",
    tags=["admin-users"],
    dependencies=[Depends(require_admin)],
)


class UserListItem(BaseModel):
    """User item in list response."""

    id: uuid.UUID
    email: str
    role: str
    is_blocked: bool
    created_at: datetime
    avatar_url: str | None = None


class UserListResponse(BaseModel):
    """Paginated list of users."""

    items: list[UserListItem]
    total: int
    page: int
    page_size: int


class UserDetailResponse(BaseModel):
    """Detailed user information."""

    id: uuid.UUID
    email: str
    role: str
    is_blocked: bool
    created_at: datetime
    render_count: int
    recent_renders: list[dict[str, Any]]


class BlockUserResponse(BaseModel):
    """Response after blocking/unblocking a user."""

    id: uuid.UUID
    is_blocked: bool
    message: str


def _get_user_avatar_url(user_id: uuid.UUID) -> str | None:
    """Check if user has avatar and return URL."""
    uploads_dir = Path(__file__).parent.parent.parent / "uploads" / "profile-images"
    for ext in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
        avatar_path = uploads_dir / f"{user_id.hex}{ext}"
        if avatar_path.exists():
            return f"/api/uploads/{user_id.hex}{ext}"
    return None


@router.get("", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str | None = Query(None, description="Search by email"),
) -> UserListResponse:
    """List users with pagination and email search."""
    async with async_session_factory() as session:
        # Build base query
        query = select(User)
        count_query = select(func.count()).select_from(User)

        # Apply search filter
        if search:
            search_pattern = f"%{search}%"
            query = query.where(User.email.ilike(search_pattern))
            count_query = count_query.where(User.email.ilike(search_pattern))

        # Get total count
        count_result = await session.execute(count_query)
        total = count_result.scalar_one()

        # Apply pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        # Execute query
        result = await session.execute(query)
        users = result.scalars().all()

        return UserListResponse(
            items=[
                UserListItem(
                    id=u.id,
                    email=u.email,
                    role=u.role,
                    is_blocked=u.is_blocked,
                    created_at=u.created_at,
                    avatar_url=_get_user_avatar_url(u.id),
                )
                for u in users
            ],
            total=total,
            page=page,
            page_size=page_size,
        )


@router.get("/{user_id}", response_model=UserDetailResponse)
async def get_user(user_id: uuid.UUID) -> UserDetailResponse:
    """Get detailed information about a specific user."""
    async with async_session_factory() as session:
        # Get user
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Count renders
        count_result = await session.execute(
            select(func.count()).select_from(RenderHistory).where(RenderHistory.owner_id == user_id)
        )
        render_count = count_result.scalar_one() or 0

        # Get recent renders (last 5)
        renders_result = await session.execute(
            select(RenderHistory)
            .where(RenderHistory.owner_id == user_id)
            .order_by(RenderHistory.created_at.desc())
            .limit(5)
        )
        recent_renders = []
        for render in renders_result.scalars().all():
            recent_renders.append(
                {
                    "id": str(render.id),
                    "template_id": str(render.template_id),
                    "created_at": render.created_at.isoformat(),
                    "image_path": render.image_path,
                }
            )

        return UserDetailResponse(
            id=user.id,
            email=user.email,
            role=user.role,
            is_blocked=user.is_blocked,
            created_at=user.created_at,
            render_count=render_count,
            recent_renders=recent_renders,
        )


@router.post("/{user_id}/block", response_model=BlockUserResponse)
async def block_user(user_id: uuid.UUID) -> BlockUserResponse:
    """Block a user account."""
    async with async_session_factory() as session:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        if user.is_blocked:
            return BlockUserResponse(
                id=user.id,
                is_blocked=True,
                message="User is already blocked",
            )

        user.is_blocked = True
        await session.commit()

        # TODO: Invalidate all refresh tokens for this user
        # This requires storing token metadata or using a token blacklist

        return BlockUserResponse(
            id=user.id,
            is_blocked=True,
            message="User has been blocked",
        )


@router.post("/{user_id}/unblock", response_model=BlockUserResponse)
async def unblock_user(user_id: uuid.UUID) -> BlockUserResponse:
    """Unblock a user account."""
    async with async_session_factory() as session:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        if not user.is_blocked:
            return BlockUserResponse(
                id=user.id,
                is_blocked=False,
                message="User is not blocked",
            )

        user.is_blocked = False
        await session.commit()

        return BlockUserResponse(
            id=user.id,
            is_blocked=False,
            message="User has been unblocked",
        )
