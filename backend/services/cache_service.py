from __future__ import annotations

import json
import logging
import os
import uuid

import redis.asyncio as aioredis

logger = logging.getLogger(__name__)


class _UUIDEncoder(json.JSONEncoder):
    def default(self, obj: object) -> str:
        if isinstance(obj, uuid.UUID):
            return str(obj)
        return super().default(obj)


class CacheService:
    """Thin Redis wrapper with graceful degradation on connection failure."""

    def __init__(self) -> None:
        redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
        self._client: aioredis.Redis | None = None
        self._url = redis_url

    async def _get_client(self) -> aioredis.Redis | None:
        if self._client is None:
            try:
                self._client = aioredis.from_url(self._url)
                await self._client.ping()
            except aioredis.ConnectionError as exc:
                logger.warning("Redis connection failed: %s", exc)
                return None
        return self._client

    async def get(self, key: str) -> object | None:
        client = await self._get_client()
        if client is None:
            return None
        try:
            value = await client.get(key)
        except aioredis.ConnectionError as exc:
            logger.warning("Redis get failed for key '%s': %s", key, exc)
            return None
        if value is None:
            return None
        return json.loads(value)  # type: ignore[no-any-return]

    async def set(self, key: str, value: object, ttl: int = 600) -> None:
        client = await self._get_client()
        if client is None:
            return
        try:
            await client.set(key, json.dumps(value, cls=_UUIDEncoder), ex=ttl)
        except aioredis.ConnectionError as exc:
            logger.warning("Redis set failed for key '%s': %s", key, exc)

    async def invalidate(self, key: str) -> None:
        client = await self._get_client()
        if client is None:
            return
        try:
            await client.delete(key)
        except aioredis.ConnectionError as exc:
            logger.warning("Redis delete failed for key '%s': %s", key, exc)
