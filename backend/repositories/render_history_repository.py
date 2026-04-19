from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from models import RenderHistory


class RenderHistoryRepository:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    async def create(
        self,
        template_id: uuid.UUID,
        text_blocks: list[dict[str, object]],
        image_path: str,
        session_id: str | None = None,
        owner_id: uuid.UUID | None = None,
        sticker_blocks: list[dict[str, object]] | None = None,
        shape_blocks: list[dict[str, object]] | None = None,
    ) -> RenderHistory:
        async with self._session_factory() as session:
            record = RenderHistory(
                session_id=session_id,
                owner_id=owner_id,
                template_id=template_id,
                text_blocks=text_blocks,
                sticker_blocks=sticker_blocks or [],
                shape_blocks=shape_blocks or [],
                image_path=image_path,
            )
            session.add(record)
            await session.commit()
            await session.refresh(record)
            return record

    async def get_by_session(self, session_id: str) -> list[RenderHistory]:
        async with self._session_factory() as session:
            stmt = (
                select(RenderHistory)
                .where(
                    RenderHistory.session_id == session_id,
                    RenderHistory.owner_id.is_(None),
                )
                .order_by(RenderHistory.created_at.desc())
            )
            result = await session.execute(stmt)
            return list(result.scalars().all())

    async def get_by_owner(self, owner_id: uuid.UUID) -> list[RenderHistory]:
        async with self._session_factory() as session:
            stmt = (
                select(RenderHistory)
                .where(RenderHistory.owner_id == owner_id)
                .order_by(RenderHistory.created_at.desc())
            )
            result = await session.execute(stmt)
            return list(result.scalars().all())
