import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select

from database import async_session_factory
from dependencies import get_current_user
from models import User, Webhook

router = APIRouter(tags=["webhooks"])


class WebhookCreateRequest(BaseModel):
    url: str
    event: str = "render.created"


class WebhookResponse(BaseModel):
    id: uuid.UUID
    url: str
    event: str
    is_active: bool
    created_at: str


class WebhookListResponse(BaseModel):
    webhooks: list[WebhookResponse]


async def _dispatch_webhook(webhook: Webhook, event: str, data: dict[str, str]) -> bool:
    """Dispatch webhook and return success status."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(webhook.url, json=data)
            return resp.status_code < 400
    except Exception:
        return False


@router.post("/api/webhooks", response_model=WebhookResponse)
async def create_webhook(
    request: WebhookCreateRequest,
    user: User = Depends(get_current_user),
) -> WebhookResponse:
    """Create a new webhook."""
    if request.event not in ("render.created", "render.shared"):
        raise HTTPException(status_code=400, detail="Invalid event type")

    async with async_session_factory() as session:
        webhook = Webhook(
            user_id=user.id,
            url=request.url,
            event=request.event,
        )
        session.add(webhook)
        await session.commit()
        await session.refresh(webhook)

        return WebhookResponse(
            id=webhook.id,
            url=webhook.url,
            event=webhook.event,
            is_active=webhook.is_active,
            created_at=webhook.created_at.isoformat(),
        )


@router.get("/api/webhooks", response_model=WebhookListResponse)
async def list_webhooks(
    user: User = Depends(get_current_user),
) -> WebhookListResponse:
    """List all webhooks for the user."""
    async with async_session_factory() as session:
        result = await session.execute(select(Webhook).where(Webhook.user_id == user.id))
        webhooks = result.scalars().all()

        return WebhookListResponse(
            webhooks=[
                WebhookResponse(
                    id=w.id,
                    url=w.url,
                    event=w.event,
                    is_active=w.is_active,
                    created_at=w.created_at.isoformat(),
                )
                for w in webhooks
            ]
        )


@router.delete("/api/webhooks/{webhook_id}")
async def delete_webhook(
    webhook_id: str,
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Delete a webhook."""
    try:
        wh_uuid = uuid.UUID(webhook_id)
    except ValueError as err:
        raise HTTPException(status_code=400, detail="Invalid webhook ID") from err

    async with async_session_factory() as session:
        result = await session.execute(
            select(Webhook).where(
                Webhook.id == wh_uuid,
                Webhook.user_id == user.id,
            )
        )
        webhook = result.scalar_one_or_none()
        if not webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")

        await session.delete(webhook)
        await session.commit()

        return {"deleted": "true"}


@router.post("/api/webhooks/{webhook_id}/test")
async def test_webhook(
    webhook_id: str,
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Test a webhook."""
    try:
        wh_uuid = uuid.UUID(webhook_id)
    except ValueError as err:
        raise HTTPException(status_code=400, detail="Invalid webhook ID") from err

    async with async_session_factory() as session:
        result = await session.execute(
            select(Webhook).where(
                Webhook.id == wh_uuid,
                Webhook.user_id == user.id,
            )
        )
        webhook = result.scalar_one_or_none()
        if not webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")

        success = await _dispatch_webhook(
            webhook,
            "render.created",
            {"test": "true", "message": "This is a test webhook"},
        )

        return {"success": str(success).lower()}
