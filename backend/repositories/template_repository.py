from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from models import Template


class TemplateRepository:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    async def get_all(self) -> list[Template]:
        async with self._session_factory() as session:
            stmt = select(Template).order_by(Template.created_at.asc())
            result = await session.execute(stmt)
            return list(result.scalars().all())

    async def get_by_id(self, template_id: uuid.UUID) -> Template | None:
        async with self._session_factory() as session:
            stmt = select(Template).where(Template.id == template_id)
            result = await session.execute(stmt)
            return result.scalar_one_or_none()

    async def get_categories(self) -> list[str]:
        async with self._session_factory() as session:
            stmt = select(Template.category).distinct().order_by(Template.category.asc())
            result = await session.execute(stmt)
            return list(result.scalars().all())
