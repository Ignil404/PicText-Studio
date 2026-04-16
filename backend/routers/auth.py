"""Auth router — registration, login, refresh, logout, profile, session migration."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from jose import ExpiredSignatureError, JWTError

from database import async_session_factory
from dependencies import get_current_user
from models import User
from repositories.user_repository import UserRepository
from schemas import (
    LoginRequest,
    MigrateSessionRequest,
    RegisterRequest,
    TokenResponse,
    UserInfo,
)
from services.auth_service import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
current_user_dependency = Depends(get_current_user)

REFRESH_TOKEN_COOKIE_NAME = "refresh_token"
REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60  # 7 days in seconds


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=False,  # Set True in production with HTTPS
        samesite="lax",
        max_age=REFRESH_TOKEN_MAX_AGE,
        path="/",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=REFRESH_TOKEN_COOKIE_NAME, path="/")


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, response: Response) -> UserInfo:
    """Register a new user with email and password."""
    repo = UserRepository(async_session_factory)
    existing = await repo.get_by_email(body.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    hashed_pw = get_password_hash(body.password)
    user = await repo.create(email=body.email, hashed_password=hashed_pw)

    refresh_token = create_refresh_token(user.id)
    _set_refresh_cookie(response, refresh_token)

    return UserInfo(
        id=user.id,
        email=user.email,
        created_at=user.created_at,
        render_count=0,
    )


@router.post("/login")
async def login(body: LoginRequest, response: Response) -> TokenResponse:
    """Authenticate user and issue JWT tokens."""
    repo = UserRepository(async_session_factory)
    user = await repo.get_by_email(body.email)
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(user.id, role=user.role)
    refresh_token = create_refresh_token(user.id)
    _set_refresh_cookie(response, refresh_token)

    return TokenResponse(access_token=access_token, role=user.role)


@router.post("/refresh")
async def refresh(
    response: Response,
    refresh_token: str | None = Cookie(alias=REFRESH_TOKEN_COOKIE_NAME, default=None),
) -> TokenResponse:
    """Refresh an expired access token using a valid refresh token."""
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided",
        )

    try:
        payload = decode_token(refresh_token, expected_type="refresh")
    except ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        ) from exc
    except (JWTError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        ) from exc

    user_id = uuid.UUID(payload["sub"])
    repo = UserRepository(async_session_factory)
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    new_access_token = create_access_token(user_id, role=user.role)
    new_refresh_token = create_refresh_token(user_id)

    _set_refresh_cookie(response, new_refresh_token)
    return TokenResponse(access_token=new_access_token, role=user.role)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> None:
    """Log out the user by clearing the refresh token cookie."""
    _clear_refresh_cookie(response)


@router.get("/me")
async def get_me(user: User = current_user_dependency) -> UserInfo:
    """Get current authenticated user's profile info."""
    repo = UserRepository(async_session_factory)
    render_count = await repo.count_renders_by_user(user.id)
    return UserInfo(
        id=user.id,
        email=user.email,
        role=user.role,
        created_at=user.created_at,
        render_count=render_count,
    )


@router.post("/migrate-session")
async def migrate_session(
    body: MigrateSessionRequest,
    user: User = current_user_dependency,
) -> dict[str, int]:
    """Migrate guest renders from a session to the authenticated user."""
    from sqlalchemy import update

    from models import RenderHistory

    async with async_session_factory() as session:
        stmt = (
            update(RenderHistory)
            .where(
                RenderHistory.session_id == body.session_id,
                RenderHistory.owner_id.is_(None),
            )
            .values(owner_id=user.id)
        )
        result = await session.execute(stmt)
        await session.commit()
        migrated_count = result.rowcount or 0

    return {"migrated_count": migrated_count}
