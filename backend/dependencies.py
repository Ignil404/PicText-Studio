"""FastAPI dependencies for JWT authentication."""

from __future__ import annotations

import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import ExpiredSignatureError, JWTError
from sqlalchemy import select

from database import async_session_factory
from models import User
from services.auth_service import decode_token

security = HTTPBearer(auto_error=False)
security_credentials = Depends(security)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = security_credentials,
) -> User:
    """Extract and validate JWT from Authorization header.

    Use in endpoints that require authentication:
        user: User = Depends(get_current_user)

    Raises:
        401 if token is missing, invalid, or expired.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = decode_token(credentials.credentials, expected_type="access")
    except ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        ) from exc
    except (JWTError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from exc

    user_id = uuid.UUID(payload["sub"])

    async with async_session_factory() as session:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been blocked",
        )

    return user


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = security_credentials,
) -> User | None:
    """Return User if JWT is present and valid, None otherwise.

    Use in endpoints that support both guest and authenticated access:
        user: User | None = Depends(get_current_user_optional)
    """
    if credentials is None:
        return None

    try:
        payload = decode_token(credentials.credentials, expected_type="access")
    except (ExpiredSignatureError, JWTError, ValueError):
        return None

    user_id = uuid.UUID(payload["sub"])

    async with async_session_factory() as session:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

    if user and user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been blocked",
        )

    return user


async def require_admin(
    credentials: HTTPAuthorizationCredentials | None = security_credentials,
) -> User:
    """Require admin role for access.

    Use in admin endpoints:
        dependencies=[Depends(require_admin)]

    Raises:
        401 if token is missing, invalid, or expired.
        403 if user is not an admin.
    """
    user = await get_current_user(credentials)

    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return user
