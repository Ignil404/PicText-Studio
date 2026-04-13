"""Tests for rate limiting on POST /api/render."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient

from routers import render as render_module


@pytest.fixture(autouse=True)
def clear_rate_limit_bucket():
    """Clear the in-memory rate limit bucket before/after each test."""
    render_module._RENDER_BUCKET.clear()
    yield
    render_module._RENDER_BUCKET.clear()


async def test_rate_limit_allows_normal_usage(async_client: AsyncClient) -> None:
    """First 30 renders per session should succeed."""
    mock_resp = MagicMock(image_url="/api/rendered/test.png")
    with (
        patch("routers.render.TemplateRepository") as mock_repo,
        patch("routers.render.RenderHistoryRepository"),
        patch("routers.render.RenderService") as mock_svc,
    ):
        mock_repo.return_value.get_by_id = AsyncMock(
            return_value=MagicMock(image_path="data:image/png;base64,test")
        )
        mock_svc.return_value.render_image = AsyncMock(return_value=mock_resp)

        for i in range(30):
            resp = await async_client.post(
                "/api/render",
                json={
                    "template_id": "10000000-0001-0001-0001-000000000001",
                    "session_id": "test-session",
                    "text_blocks": [],
                    "format": "png",
                },
            )
            assert resp.status_code != 429, f"Request {i + 1} was rate limited unexpectedly"


async def test_rate_limit_blocks_excess(async_client: AsyncClient) -> None:
    """31st render per session should be blocked."""
    mock_resp = MagicMock(image_url="/api/rendered/test.png")
    with (
        patch("routers.render.TemplateRepository") as mock_repo,
        patch("routers.render.RenderHistoryRepository"),
        patch("routers.render.RenderService") as mock_svc,
    ):
        mock_repo.return_value.get_by_id = AsyncMock(
            return_value=MagicMock(image_path="data:image/png;base64,test")
        )
        mock_svc.return_value.render_image = AsyncMock(return_value=mock_resp)

        for _ in range(30):
            await async_client.post(
                "/api/render",
                json={
                    "template_id": "10000000-0001-0001-0001-000000000001",
                    "session_id": "test-session",
                    "text_blocks": [],
                    "format": "png",
                },
            )

        resp = await async_client.post(
            "/api/render",
            json={
                "template_id": "10000000-0001-0001-0001-000000000001",
                "session_id": "test-session",
                "text_blocks": [],
                "format": "png",
            },
        )
        assert resp.status_code == 429
        assert "Rate limit" in resp.json()["detail"]


async def test_rate_limit_per_session(async_client: AsyncClient) -> None:
    """Different sessions have independent rate limits."""
    mock_resp = MagicMock(image_url="/api/rendered/test.png")
    with (
        patch("routers.render.TemplateRepository") as mock_repo,
        patch("routers.render.RenderHistoryRepository"),
        patch("routers.render.RenderService") as mock_svc,
    ):
        mock_repo.return_value.get_by_id = AsyncMock(
            return_value=MagicMock(image_path="data:image/png;base64,test")
        )
        mock_svc.return_value.render_image = AsyncMock(return_value=mock_resp)

        # Exhaust session A
        for _ in range(30):
            await async_client.post(
                "/api/render",
                json={
                    "template_id": "10000000-0001-0001-0001-000000000001",
                    "session_id": "session-A",
                    "text_blocks": [],
                    "format": "png",
                },
            )

        # Session A should be limited
        resp_a = await async_client.post(
            "/api/render",
            json={
                "template_id": "10000000-0001-0001-0001-000000000001",
                "session_id": "session-A",
                "text_blocks": [],
                "format": "png",
            },
        )
        assert resp_a.status_code == 429

        # Session B should still work
        resp_b = await async_client.post(
            "/api/render",
            json={
                "template_id": "10000000-0001-0001-0001-000000000001",
                "session_id": "session-B",
                "text_blocks": [],
                "format": "png",
            },
        )
        assert resp_b.status_code != 429
