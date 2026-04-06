"""Integration tests for history API endpoint."""

import uuid
from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient


@pytest.mark.asyncio
async def test_get_history_returns_renders_for_session(client: TestClient):
    session_id = "test-session-1"
    record = MagicMock()
    record.id = uuid.uuid4()
    record.template_id = uuid.uuid4()
    record.text_blocks = [{"text": "Hello"}]
    record.image_path = "/rendered/test.png"
    record.created_at = datetime.now(UTC)

    with patch("routers.history.RenderService") as mock_service_cls:
        mock_service = MagicMock()
        mock_service.get_history = AsyncMock(
            return_value=[
                {
                    "id": record.id,
                    "template_id": record.template_id,
                    "template_name": "",
                    "text_blocks": record.text_blocks,
                    "image_url": record.image_path,
                    "created_at": record.created_at.isoformat(),
                }
            ]
        )
        mock_service_cls.return_value = mock_service

        response = client.get(f"/api/history/{session_id}")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["image_url"] == "/rendered/test.png"


@pytest.mark.asyncio
async def test_get_history_returns_empty_for_unknown_session(client: TestClient):
    with patch("routers.history.RenderService") as mock_service_cls:
        mock_service = MagicMock()
        mock_service.get_history = AsyncMock(return_value=[])
        mock_service_cls.return_value = mock_service

        response = client.get("/api/history/unknown-session-id")

        assert response.status_code == 200
        data = response.json()
        assert data == []
