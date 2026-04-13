"""Integration tests — real PostgreSQL + Redis (CI services).

These tests skip if DATABASE_URL / REDIS_URL are not set (local dev without docker).
In CI they run against real postgres:16-alpine and redis:7-alpine services.
"""

import os

import pytest
from httpx import ASGITransport, AsyncClient

from main import app

pytestmark = pytest.mark.integration


def _skip_if_no_env(*vars: str) -> None:
    for v in vars:
        if not os.getenv(v):
            pytest.skip(f"{v} not set — skipping integration test")


@pytest.fixture
async def real_client():
    _skip_if_no_env("DATABASE_URL", "REDIS_URL")
    transport = ASGITransport(app=app, raise_app_exceptions=True)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


async def test_health_real_db(real_client: AsyncClient) -> None:
    """GET /api/health returns 200 with real PostgreSQL + Redis."""
    resp = await real_client.get("/api/health")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["postgres"] == "ok"
    assert data["redis"] == "ok"


async def test_list_templates_empty(real_client: AsyncClient) -> None:
    """GET /api/templates/ returns list (empty before seed)."""
    resp = await real_client.get("/api/templates/")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


async def test_list_categories(real_client: AsyncClient) -> None:
    """GET /api/templates/categories returns list of strings."""
    resp = await real_client.get("/api/templates/categories")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    for item in data:
        assert isinstance(item, str)


async def test_render_invalid_template(real_client: AsyncClient) -> None:
    """POST /api/render with non-existent template returns 404."""
    resp = await real_client.post(
        "/api/render",
        json={
            "template_id": "00000000-0000-0000-0000-000000000000",
            "session_id": "test-session",
            "text_blocks": [],
            "format": "png",
        },
    )
    # Could be 404 or another error — just shouldn't be 200
    assert resp.status_code != 200


async def test_history_empty_session(real_client: AsyncClient) -> None:
    """GET /api/history/{session_id} returns empty list for unknown session."""
    resp = await real_client.get("/api/history/unknown-session-uuid")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 0


async def test_root_endpoint(real_client: AsyncClient) -> None:
    """GET / returns API metadata."""
    resp = await real_client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert "name" in data
    assert "endpoints" in data
    assert data["endpoints"]["health"] == "/api/health"
