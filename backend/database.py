import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# noqa: F401 — ensure models are imported so metadata is populated
from models import Base  # noqa: F401

__all__ = ["Base", "engine", "async_session_factory", "get_session", "DATABASE_URL"]

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://postgres:postgres@postgres:5432/dl2026"
)

engine = create_async_engine(DATABASE_URL, echo=False)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session
