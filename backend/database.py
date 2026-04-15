import os
import sys
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

# noqa: F401 — ensure models are imported so metadata is populated
from models import Base  # noqa: F401

__all__ = ["Base", "engine", "async_session_factory", "get_session", "DATABASE_URL"]

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")

# Use NullPool for test env to avoid asyncpg event loop conflicts with pytest
is_testing = "pytest" in sys.modules or os.getenv("TESTING") == "1"
pool_class = NullPool if is_testing else None

engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True, poolclass=pool_class)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session
