from collections.abc import AsyncGenerator, Generator
from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient

from main import app


@pytest.fixture
def test_app() -> FastAPI:
    """Return the FastAPI application instance for testing."""
    return app


@pytest.fixture
def client(test_app: FastAPI) -> TestClient:
    """Synchronous test client using starlette TestClient."""
    return TestClient(test_app)


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Async HTTPX client for testing async FastAPI endpoints."""
    transport = ASGITransport(app=app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def mock_db() -> Generator[MagicMock, None, None]:
    """Mock the database engine to simulate DB unavailability."""
    mock_engine = MagicMock()

    class FailingCtx:
        async def __aenter__(self) -> None:
            raise Exception("connection refused")

        async def __aexit__(self, *args: object) -> None:
            pass

    mock_engine.begin.return_value = FailingCtx()
    with patch("routers.health.engine", mock_engine):
        yield mock_engine


@pytest.fixture
def mock_redis_down() -> Generator[MagicMock, None, None]:
    """Mock Redis to simulate it being unavailable."""
    mock_redis = MagicMock()
    mock_redis.from_url.return_value.ping.side_effect = ConnectionError("Connection refused")
    with patch("routers.health.redis", mock_redis):
        yield mock_redis
