
import os

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context
from database import Base  # noqa: F401
from models import RenderHistory, Template  # noqa: F401

# `config` is injected by alembic at runtime via env.py invocation context
config = context.config

# Override alembic.ini URL with DATABASE_URL from environment (Docker-safe)
DB_URL = os.getenv("DATABASE_URL")
if DB_URL:
    config.set_main_option("sqlalchemy.url", DB_URL)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=Base.metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=Base.metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode using async engine.

    Uses greenlet under the hood via SQLAlchemy's async support.
    Alembic runs migrations synchronously within the greenlet context.
    """
    connectable = create_async_engine(
        config.get_main_option("sqlalchemy.url"),
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    import asyncio

    asyncio.run(run_migrations_online())
