"""Integration tests for templates API endpoints."""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient


def _make_template_data(**overrides) -> dict:
    defaults = {
        "id": uuid.uuid4(),
        "name": "Test Template",
        "category": "reaction",
        "imageUrl": "/images/test.png",
        "width": 600,
        "height": 600,
        "textZones": [],
    }
    return {**defaults, **overrides}


@pytest.mark.asyncio
async def test_get_templates_returns_list(client: TestClient):
    template_data = [_make_template_data(name="Template A"), _make_template_data(name="Template B")]
    with (
        patch("routers.templates.CacheService") as mock_cache_cls,
        patch("routers.templates.TemplateRepository") as mock_repo_cls,
        patch("routers.templates.TemplateService") as mock_service_cls,
    ):
        mock_cache = MagicMock()
        mock_cache.get = AsyncMock(return_value=None)
        mock_cache_cls.return_value = mock_cache
        mock_repo = MagicMock()
        mock_repo_cls.return_value = mock_repo
        mock_service = MagicMock()
        mock_service.get_all = AsyncMock(return_value=template_data)
        mock_service_cls.return_value = mock_service

        response = client.get("/api/templates/")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["name"] == "Template A"


@pytest.mark.asyncio
async def test_get_single_template_returns_200(client: TestClient):
    tid = uuid.uuid4()
    template_data = _make_template_data(id=tid)
    with (
        patch("routers.templates.CacheService") as mock_cache_cls,
        patch("routers.templates.TemplateRepository") as mock_repo_cls,
        patch("routers.templates.TemplateService") as mock_service_cls,
    ):
        mock_cache = MagicMock()
        mock_cache.get = AsyncMock(return_value=None)
        mock_cache_cls.return_value = mock_cache
        mock_repo = MagicMock()
        mock_repo_cls.return_value = mock_repo
        mock_service = MagicMock()
        mock_service.get_by_id = AsyncMock(return_value=template_data)
        mock_service_cls.return_value = mock_service

        response = client.get(f"/api/templates/{tid}")

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Template"


@pytest.mark.asyncio
async def test_get_single_template_returns_404_for_nonexistent(client: TestClient):
    tid = uuid.uuid4()
    with (
        patch("routers.templates.CacheService") as mock_cache_cls,
        patch("routers.templates.TemplateRepository") as mock_repo_cls,
        patch("routers.templates.TemplateService") as mock_service_cls,
    ):
        mock_cache = MagicMock()
        mock_cache.get = AsyncMock(return_value=None)
        mock_cache_cls.return_value = mock_cache
        mock_repo = MagicMock()
        mock_repo_cls.return_value = mock_repo
        mock_service = MagicMock()
        mock_service.get_by_id = AsyncMock(return_value=None)
        mock_service_cls.return_value = mock_service

        response = client.get(f"/api/templates/{tid}")

        assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_categories_returns_list(client: TestClient):
    with (
        patch("routers.templates.CacheService") as mock_cache_cls,
        patch("routers.templates.TemplateRepository") as mock_repo_cls,
        patch("routers.templates.TemplateService") as mock_service_cls,
    ):
        mock_cache = MagicMock()
        mock_cache.get = AsyncMock(return_value=None)
        mock_cache_cls.return_value = mock_cache
        mock_repo = MagicMock()
        mock_repo_cls.return_value = mock_repo
        mock_service = MagicMock()
        mock_service.get_categories = AsyncMock(return_value=["classic", "reaction"])
        mock_service_cls.return_value = mock_service

        response = client.get("/api/templates/categories")

        assert response.status_code == 200
        data = response.json()
        assert data == ["classic", "reaction"]


@pytest.mark.asyncio
async def test_get_template_invalid_uuid_returns_422(client: TestClient):
    response = client.get("/api/templates/not-a-uuid")

    assert response.status_code == 422
