"""Integration tests for render API endpoints."""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from dependencies import get_current_user_optional
from main import app
from models import User

pytestmark = pytest.mark.integration


@pytest.mark.asyncio
async def test_render_valid_request_returns_200(client: TestClient):
    with patch("routers.render.RenderService") as mock_service_cls:
        mock_service = MagicMock()
        mock_service.render_image = AsyncMock(
            return_value=MagicMock(image_url="/api/rendered/test-image.png")
        )
        mock_service_cls.return_value = mock_service

        request_body = {
            "session_id": "test-session-1",
            "template_id": str(uuid.uuid4()),
            "text_blocks": [
                {
                    "id": "t1",
                    "text": "Hello World",
                    "x": 50,
                    "y": 50,
                    "font_family": "Impact",
                    "font_size": 40,
                    "color": "#000000",
                }
            ],
            "format": "png",
        }
        response = client.post("/api/render", json=request_body)

        assert response.status_code == 200
        data = response.json()
        assert "image_url" in data


@pytest.mark.asyncio
async def test_render_invalid_body_returns_422(client: TestClient):
    # Missing required fields: session_id, template_id, text_blocks
    response = client.post("/api/render", json={"invalid": "body"})

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_render_nonexistent_template_returns_404(client: TestClient):
    from services.render_service import RenderError

    with patch("routers.render.RenderService") as mock_service_cls:
        mock_service = MagicMock()
        mock_service.render_image = AsyncMock(
            side_effect=RenderError("Template not found: 00000000-0000-0000-0000-000000000000")
        )
        mock_service_cls.return_value = mock_service

        request_body = {
            "session_id": "test-session",
            "template_id": str(uuid.uuid4()),
            "text_blocks": [],
            "format": "png",
        }
        response = client.post("/api/render", json=request_body)

        assert response.status_code == 404


@pytest.mark.asyncio
async def test_render_invalid_format_returns_422(client: TestClient):
    request_body = {
        "session_id": "test-session",
        "template_id": str(uuid.uuid4()),
        "text_blocks": [],
        "format": "gif",  # Invalid — only png and jpeg allowed
    }
    response = client.post("/api/render", json=request_body)

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_render_authenticated_request_sets_owner_id(client: TestClient):
    user = User(
        id=uuid.uuid4(),
        email="owner@example.com",
        hashed_password="hashed",
    )

    app.dependency_overrides[get_current_user_optional] = lambda: user
    try:
        with patch("routers.render.RenderService") as mock_service_cls:
            mock_service = MagicMock()
            mock_service.render_image = AsyncMock(
                return_value=MagicMock(image_url="/api/rendered/test-image.png")
            )
            mock_service_cls.return_value = mock_service

            request_body = {
                "template_id": str(uuid.uuid4()),
                "text_blocks": [],
                "format": "png",
            }
            response = client.post("/api/render", json=request_body)

            assert response.status_code == 200
            forwarded_request = mock_service.render_image.await_args.args[0]
            assert forwarded_request.owner_id == user.id
            assert forwarded_request.session_id is None
    finally:
        app.dependency_overrides.pop(get_current_user_optional, None)
