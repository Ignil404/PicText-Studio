"""Unit tests for TemplateService with mocked repository and cache."""

import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from models import Template
from repositories.template_repository import TemplateRepository
from services.cache_service import CacheService
from services.template_service import TemplateService


def _make_template_obj(**overrides) -> Template:
    defaults = {
        "id": uuid.uuid4(),
        "name": "Test",
        "slug": "test-template",
        "category": "reaction",
        "image_path": "/images/test.png",
        "width": 600,
        "height": 600,
        "text_zones": {},
        "is_active": True,
    }
    return Template(**{**defaults, **overrides})


@pytest.fixture
def mock_repo() -> TemplateRepository:
    return MagicMock(spec=TemplateRepository)


@pytest.fixture
def mock_cache() -> CacheService:
    return MagicMock(spec=CacheService)


@pytest.fixture
def service(mock_repo, mock_cache) -> TemplateService:
    return TemplateService(template_repo=mock_repo, cache=mock_cache)


@pytest.mark.asyncio
async def test_get_all_returns_templates_from_repo_when_cache_miss(service, mock_repo, mock_cache):
    mock_cache.get = AsyncMock(return_value=None)
    t = _make_template_obj()
    mock_repo.get_all = AsyncMock(return_value=[t])
    mock_cache.set = AsyncMock()

    result = await service.get_all()

    assert len(result) == 1
    assert result[0]["name"] == "Test"
    mock_repo.get_all.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_all_returns_cached_value_when_hit(service, mock_cache):
    cached = [{"id": "cached", "name": "Cached Template"}]
    mock_cache.get = AsyncMock(return_value=cached)

    result = await service.get_all()

    assert result == cached


@pytest.mark.asyncio
async def test_get_by_id_returns_template_from_repo_when_cache_miss(service, mock_repo, mock_cache):
    tid = uuid.uuid4()
    mock_cache.get = AsyncMock(return_value=None)
    t = _make_template_obj(id=tid)
    mock_repo.get_by_id = AsyncMock(return_value=t)
    mock_cache.set = AsyncMock()

    result = await service.get_by_id(tid)

    assert result is not None
    # id is UUID (not string) in TemplateResponse schema
    assert result["id"] == tid


@pytest.mark.asyncio
async def test_get_by_id_returns_none_for_missing(service, mock_repo, mock_cache):
    tid = uuid.uuid4()
    mock_cache.get = AsyncMock(return_value=None)
    mock_repo.get_by_id = AsyncMock(return_value=None)

    result = await service.get_by_id(tid)

    assert result is None


@pytest.mark.asyncio
async def test_get_by_id_returns_cached_value_when_hit(service, mock_cache):
    tid = uuid.uuid4()
    cached = {"id": str(tid), "name": "Cached"}
    mock_cache.get = AsyncMock(return_value=cached)

    result = await service.get_by_id(tid)

    assert result == cached


@pytest.mark.asyncio
async def test_get_categories_returns_from_cache_when_hit(service, mock_cache):
    mock_cache.get = AsyncMock(return_value=["classic", "reaction"])

    result = await service.get_categories()

    assert result == ["classic", "reaction"]


@pytest.mark.asyncio
async def test_get_categories_returns_from_repo_when_cache_miss(service, mock_repo, mock_cache):
    mock_cache.get = AsyncMock(return_value=None)
    mock_repo.get_categories = AsyncMock(return_value=["classic", "reaction"])
    mock_cache.set = AsyncMock()

    result = await service.get_categories()

    assert result == ["classic", "reaction"]


@pytest.mark.asyncio
async def test_invalidate_all_cache_invalidates_keys(service, mock_cache):
    mock_cache.invalidate = AsyncMock()

    await service.invalidate_all_cache()

    assert mock_cache.invalidate.call_count == 2
