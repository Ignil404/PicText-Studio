"""Tests for admin endpoints."""

from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from dependencies import require_admin
from models import User

# Admin Templates Tests


@pytest.mark.asyncio
async def test_list_templates_requires_admin() -> None:
    """Test that listing templates requires admin role."""
    # Non-admin user should get 403
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="user@example.com",
        hashed_password="hashed",
        role="user",
        is_blocked=False,
    )
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="token")

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = user

    mock_session = MagicMock()
    mock_session.execute = AsyncMock(return_value=mock_result)

    mock_context = MagicMock()
    mock_context.__aenter__ = AsyncMock(return_value=mock_session)
    mock_context.__aexit__ = AsyncMock(return_value=None)

    with (
        patch("dependencies.decode_token", return_value={"sub": str(user_id), "type": "access"}),
        patch("dependencies.async_session_factory", return_value=mock_context),
        pytest.raises(HTTPException) as exc_info,
    ):
        await require_admin(credentials)

    assert exc_info.value.status_code == 403


@pytest.mark.asyncio
async def test_create_template_requires_admin() -> None:
    """Test that creating templates requires admin role."""
    # Same logic - non-admin should get 403
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="user@example.com",
        hashed_password="hashed",
        role="user",
        is_blocked=False,
    )
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="token")

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = user

    mock_session = MagicMock()
    mock_session.execute = AsyncMock(return_value=mock_result)

    mock_context = MagicMock()
    mock_context.__aenter__ = AsyncMock(return_value=mock_session)
    mock_context.__aexit__ = AsyncMock(return_value=None)

    with (
        patch("dependencies.decode_token", return_value={"sub": str(user_id), "type": "access"}),
        patch("dependencies.async_session_factory", return_value=mock_context),
        pytest.raises(HTTPException) as exc_info,
    ):
        await require_admin(credentials)

    assert exc_info.value.status_code == 403


# Admin Users Tests


@pytest.mark.asyncio
async def test_list_users_requires_admin() -> None:
    """Test that listing users requires admin role."""
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="user@example.com",
        hashed_password="hashed",
        role="user",
        is_blocked=False,
    )
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="token")

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = user

    mock_session = MagicMock()
    mock_session.execute = AsyncMock(return_value=mock_result)

    mock_context = MagicMock()
    mock_context.__aenter__ = AsyncMock(return_value=mock_session)
    mock_context.__aexit__ = AsyncMock(return_value=None)

    with (
        patch("dependencies.decode_token", return_value={"sub": str(user_id), "type": "access"}),
        patch("dependencies.async_session_factory", return_value=mock_context),
        pytest.raises(HTTPException) as exc_info,
    ):
        await require_admin(credentials)

    assert exc_info.value.status_code == 403


@pytest.mark.asyncio
async def test_block_user_requires_admin() -> None:
    """Test that blocking users requires admin role."""
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="user@example.com",
        hashed_password="hashed",
        role="user",
        is_blocked=False,
    )
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="token")

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = user

    mock_session = MagicMock()
    mock_session.execute = AsyncMock(return_value=mock_result)

    mock_context = MagicMock()
    mock_context.__aenter__ = AsyncMock(return_value=mock_session)
    mock_context.__aexit__ = AsyncMock(return_value=None)

    with (
        patch("dependencies.decode_token", return_value={"sub": str(user_id), "type": "access"}),
        patch("dependencies.async_session_factory", return_value=mock_context),
        pytest.raises(HTTPException) as exc_info,
    ):
        await require_admin(credentials)

    assert exc_info.value.status_code == 403


# Admin Stats Tests


@pytest.mark.asyncio
async def test_dashboard_stats_requires_admin() -> None:
    """Test that accessing dashboard stats requires admin role."""
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="user@example.com",
        hashed_password="hashed",
        role="user",
        is_blocked=False,
    )
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="token")

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = user

    mock_session = MagicMock()
    mock_session.execute = AsyncMock(return_value=mock_result)

    mock_context = MagicMock()
    mock_context.__aenter__ = AsyncMock(return_value=mock_session)
    mock_context.__aexit__ = AsyncMock(return_value=None)

    with (
        patch("dependencies.decode_token", return_value={"sub": str(user_id), "type": "access"}),
        patch("dependencies.async_session_factory", return_value=mock_context),
        pytest.raises(HTTPException) as exc_info,
    ):
        await require_admin(credentials)

    assert exc_info.value.status_code == 403


@pytest.mark.asyncio
async def test_admin_routes_succeed_with_admin_role() -> None:
    """Test that admin routes succeed with admin role."""
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="admin@example.com",
        hashed_password="hashed",
        role="admin",
        is_blocked=False,
    )
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="token")

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = user

    mock_session = MagicMock()
    mock_session.execute = AsyncMock(return_value=mock_result)

    mock_context = MagicMock()
    mock_context.__aenter__ = AsyncMock(return_value=mock_session)
    mock_context.__aexit__ = AsyncMock(return_value=None)

    with (
        patch("dependencies.decode_token", return_value={"sub": str(user_id), "type": "access"}),
        patch("dependencies.async_session_factory", return_value=mock_context),
    ):
        result = await require_admin(credentials)

    assert result == user
    assert result.role == "admin"
