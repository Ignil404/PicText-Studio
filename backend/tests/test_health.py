"""Tests for the GET /api/health endpoint."""

from unittest.mock import MagicMock

from httpx import AsyncClient


async def test_health_success(async_client: AsyncClient) -> None:
    """When PostgreSQL and Redis are available, GET /api/health returns 200."""
    response = await async_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "dl2026-backend"
    assert "postgres" in data
    assert "redis" in data


async def test_health_db_down(mock_db: MagicMock, async_client: AsyncClient) -> None:
    """When the database is unavailable, GET /api/health returns 503."""
    response = await async_client.get("/api/health")
    assert response.status_code == 503
    data = response.json()
    assert data["service"] == "dl2026-backend"
    assert "postgres" in data
    assert "error" in data["postgres"]
