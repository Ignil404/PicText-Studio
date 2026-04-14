"""Auth service — JWT token operations and password hashing."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any, cast

from jose import jwt

from auth_config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    REFRESH_TOKEN_EXPIRE_DAYS,
    SECRET_KEY,
    pwd_context,
)


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    return cast(str, pwd_context.hash(password))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    return cast(bool, pwd_context.verify(plain_password, hashed_password))


def _create_token(data: dict[str, Any], expires_delta: timedelta) -> str:
    """Create a JWT token with the given payload and expiration."""
    to_encode = data.copy()
    expire = datetime.now(UTC) + expires_delta
    to_encode.update({"exp": expire})
    return cast(str, jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM))


def create_access_token(user_id: uuid.UUID) -> str:
    """Create a short-lived JWT access token."""
    return _create_token(
        {"sub": str(user_id), "type": "access"},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(user_id: uuid.UUID) -> str:
    """Create a long-lived JWT refresh token."""
    return _create_token(
        {"sub": str(user_id), "type": "refresh"},
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )


def decode_token(token: str, expected_type: str | None = None) -> dict[str, Any]:
    """Decode and validate a JWT token.

    Raises:
        ExpiredSignatureError: If the token is expired.
        JWTError: If the token is otherwise invalid.
        ValueError: If the token type doesn't match expected_type.
    """
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    if expected_type and payload.get("type") != expected_type:
        raise ValueError(f"Invalid token type: expected {expected_type}, got {payload.get('type')}")
    return cast(dict[str, Any], payload)
