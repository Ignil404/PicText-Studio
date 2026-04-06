"""Tests for the GET /api/health endpoint."""

from unittest.mock import AsyncMock, MagicMock, patch

from httpx import AsyncClient


async def test_health_success(async_client: AsyncClient) -> None:
    """When PostgreSQL and Redis are available, GET /api/health returns 200."""
    # Mock DB engine
    mock_engine = MagicMock()

    class OkCtx:
        async def __aenter__(self):
            mock_conn = MagicMock()
            mock_conn.execute = AsyncMock(return_value=None)
            return mock_conn

        async def __aexit__(self, *args):
            pass

    mock_engine.begin.return_value = OkCtx()

    # Mock Redis
    mock_redis_client = MagicMock()
    mock_redis_client.ping.return_value = True
    mock_redis_client.close.return_value = None

    with patch("routers.health.engine", mock_engine), patch("routers.health.redis") as mock_redis:
        mock_redis.from_url.return_value = mock_redis_client

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
