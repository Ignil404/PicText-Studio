"""Tests for auth dependencies."""

from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from jose import ExpiredSignatureError

from dependencies import get_current_user
from models import User


@pytest.mark.asyncio
async def test_get_current_user_valid_token_returns_user() -> None:
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="user@example.com",
        hashed_password="hashed",
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
        result = await get_current_user(credentials)

    assert result == user


@pytest.mark.asyncio
async def test_get_current_user_missing_header_raises_401() -> None:
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(None)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Not authenticated"


@pytest.mark.asyncio
async def test_get_current_user_expired_token_raises_401() -> None:
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="expired")

    with (
        patch("dependencies.decode_token", side_effect=ExpiredSignatureError()),
        pytest.raises(HTTPException) as exc_info,
    ):
        await get_current_user(credentials)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Token expired"
