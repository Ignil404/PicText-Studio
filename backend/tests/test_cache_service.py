"""Unit tests for CacheService using fakeredis."""

import pytest
from fakeredis import FakeAsyncRedis

from services.cache_service import CacheService


@pytest.fixture
def cache_service(monkeypatch):
    """Patch CacheService to use fakeredis instead of real Redis."""
    monkeypatch.setenv("REDIS_URL", "redis://localhost:6379/0")
    service = CacheService()
    # Inject fakeredis client directly to bypass connection logic
    service._client = FakeAsyncRedis()
    return service


@pytest.mark.asyncio
async def test_set_and_get(cache_service):
    await cache_service.set("test_key", {"data": "value"}, ttl=60)
    result = await cache_service.get("test_key")
    assert result == {"data": "value"}


@pytest.mark.asyncio
async def test_get_returns_none_for_missing_key(cache_service):
    result = await cache_service.get("nonexistent")
    assert result is None


@pytest.mark.asyncio
async def test_invalidate_removes_key(cache_service):
    await cache_service.set("to_delete", "value")
    await cache_service.invalidate("to_delete")
    result = await cache_service.get("to_delete")
    assert result is None


@pytest.mark.asyncio
async def test_set_with_default_ttl(cache_service):
    await cache_service.set("ttl_test", 42)
    result = await cache_service.get("ttl_test")
    assert result == 42


@pytest.mark.asyncio
async def test_invalidate_nonexistent_key_no_error(cache_service):
    await cache_service.invalidate("does_not_exist")
