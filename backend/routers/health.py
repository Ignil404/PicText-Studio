import json as _json
import os as _os

import redis
from fastapi import APIRouter, Response

from database import engine
from logger import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["health"])


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
            status["postgres"] = "ok"
        logger.info("PostgreSQL connection successful")
    except Exception as exc:
        status["postgres"] = f"error: {exc}"
        healthy = False
        logger.error("PostgreSQL connection failed", error=str(exc))

    # Check Redis connectivity
    try:
        redis_url = _os.getenv("REDIS_URL", "redis://redis:6379/0")
        client = redis.from_url(redis_url)
        client.ping()
        client.close()
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
