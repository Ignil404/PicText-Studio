"""User repository — CRUD operations for User model."""

from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from models import RenderHistory, User


class UserRepository:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    async def create(self, email: str, hashed_password: str) -> User:
        """Create a new user."""
        async with self._session_factory() as session:
            user = User(email=email, hashed_password=hashed_password)
            session.add(user)
            await session.commit()
            await session.refresh(user)
            return user

    async def get_by_email(self, email: str) -> User | None:
        """Find a user by email address."""
        async with self._session_factory() as session:
            stmt = select(User).where(User.email == email)
            result = await session.execute(stmt)
            return result.scalar_one_or_none()

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        """Find a user by ID."""
        async with self._session_factory() as session:
            stmt = select(User).where(User.id == user_id)
            result = await session.execute(stmt)
            return result.scalar_one_or_none()

    async def count_renders_by_user(self, user_id: uuid.UUID) -> int:
        """Count total renders owned by a user."""
        async with self._session_factory() as session:
            stmt = (
                select(func.count())
                .select_from(RenderHistory)
                .where(RenderHistory.owner_id == user_id)
            )
            result = await session.execute(stmt)
            return result.scalar_one() or 0
