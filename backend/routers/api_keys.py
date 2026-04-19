import secrets
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select

from database import async_session_factory
from dependencies import get_current_user
from models import ApiKey, User

router = APIRouter(tags=["api-keys"])


class ApiKeyCreateRequest(BaseModel):
    name: str
    rate_limit: int = 100


class ApiKeyResponse(BaseModel):
    id: uuid.UUID
    name: str
    key: str
    rate_limit: int
    is_active: bool
    created_at: str


class ApiKeyListResponse(BaseModel):
    keys: list[ApiKeyResponse]


def _generate_key() -> str:
    """Generate a secure API key."""
    return "pt_" + secrets.token_urlsafe(32)


@router.post("/api/keys", response_model=ApiKeyResponse)
async def create_api_key(
    request: ApiKeyCreateRequest,
    user: User = Depends(get_current_user),
) -> ApiKeyResponse:
    """Create a new API key for the authenticated user."""
    key = _generate_key()

    async with async_session_factory() as session:
        api_key = ApiKey(
            user_id=user.id,
            key=key,
            name=request.name,
            rate_limit=request.rate_limit,
        )
        session.add(api_key)
        await session.commit()
        await session.refresh(api_key)

        return ApiKeyResponse(
            id=api_key.id,
            name=api_key.name,
            key=api_key.key,
            rate_limit=api_key.rate_limit,
            is_active=api_key.is_active,
            created_at=api_key.created_at.isoformat(),
        )


@router.get("/api/keys", response_model=ApiKeyListResponse)
async def list_api_keys(
    user: User = Depends(get_current_user),
) -> ApiKeyListResponse:
    """List all API keys for the authenticated user."""
    async with async_session_factory() as session:
        result = await session.execute(
            select(ApiKey).where(ApiKey.user_id == user.id)
        )
        keys = result.scalars().all()

        return ApiKeyListResponse(
            keys=[
                ApiKeyResponse(
                    id=k.id,
                    name=k.name,
                    key=k.key[:12] + "..." if len(k.key) > 12 else k.key,
                    rate_limit=k.rate_limit,
                    is_active=k.is_active,
                    created_at=k.created_at.isoformat(),
                )
                for k in keys
            ]
        )


@router.delete("/api/keys/{key_id}")
async def delete_api_key(
    key_id: str,
    user: User = Depends(get_current_user),
) -> dict:
    """Delete an API key."""
    try:
        key_uuid = uuid.UUID(key_id)
    except ValueError as err:
        raise HTTPException(status_code=400, detail="Invalid key ID") from err

    async with async_session_factory() as session:
        result = await session.execute(
            select(ApiKey).where(
                ApiKey.id == key_uuid,
                ApiKey.user_id == user.id,
            )
        )
        key = result.scalar_one_or_none()
        if not key:
            raise HTTPException(status_code=404, detail="API key not found")

        await session.delete(key)
        await session.commit()

        return {"deleted": True}
