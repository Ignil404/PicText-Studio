import json as _json
import os as _os
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import APIRouter, Response
from sqlalchemy import text

from database import engine
from logger import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["health"])

_redis_client: aioredis.Redis | None = None


def get_redis() -> aioredis.Redis:
    """Get or create shared Redis client (lazy init)."""
    global _redis_client
    if _redis_client is None:
        redis_url = _os.getenv("REDIS_URL", "redis://redis:6379/0")
        _redis_client = aioredis.from_url(redis_url, decode_responses=True)
    return _redis_client


@asynccontextmanager
async def temp_redis():
    """Create a short-lived Redis client for health checks (auto-cleanup)."""
    redis_url = _os.getenv("REDIS_URL", "redis://redis:6379/0")
    client = aioredis.from_url(redis_url, decode_responses=True)
    try:
        yield client
    finally:
        await client.aclose()


@router.get("/health")
async def health() -> Response:
    """Check service connectivity: PostgreSQL and Redis.

    Returns 200 when all dependencies are available, 503 when any are down.
    """
    logger.info("Performing health check")
    status: dict[str, str] = {"service": "dl2026-backend"}
    healthy = True

    # Check PostgreSQL connectivity
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        status["postgres"] = "ok"
        logger.info("PostgreSQL connection successful")
    except Exception as exc:
        status["postgres"] = f"error: {exc}"
        healthy = False
        logger.error("PostgreSQL connection failed", error=str(exc))

    # Check Redis connectivity (short-lived client — auto-cleanup)
    try:
        async with temp_redis() as client:
            await client.ping()
        status["redis"] = "ok"
        logger.info("Redis connection successful")
    except Exception as exc:
        status["redis"] = f"error: {exc}"
        healthy = False
        logger.error("Redis connection failed", error=str(exc))

    status_code = 200 if healthy else 503
    logger.info("Health check complete", status_code=status_code, checks=status)
    return Response(
        status_code=status_code,
        media_type="application/json",
        content=_json.dumps(status),
    )
