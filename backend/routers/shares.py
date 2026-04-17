from typing import cast

from fastapi import APIRouter, HTTPException, status

from schemas import (
    CreateShareRequest,
    SharedImageResponse,
    ShareResponse,
    TextBlock,
)
from services.shared_image_service import SharedImageService

router = APIRouter(tags=["shared"])


@router.post("/api/shared", response_model=ShareResponse, status_code=status.HTTP_201_CREATED)
async def create_share(
    request: CreateShareRequest,
    owner_id: str | None = None,
    session_id: str | None = None,
) -> ShareResponse:
    """Create a shareable link for a rendered image."""
    service = SharedImageService()

    owner_uuid = None
    if owner_id:
        try:
            import uuid as uuid_module

            owner_uuid = uuid_module.UUID(owner_id)
        except ValueError:
            pass

    try:
        shared_image, share_id = await service.create_share(
            render_history_id=request.render_history_id,
            owner_id=owner_uuid,
            session_id=session_id,
        )
        return ShareResponse(
            share_id=share_id,
            url=f"/shared/{share_id}",
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        ) from e


@router.get("/api/shared/{share_id}", response_model=SharedImageResponse)
async def get_shared_image(share_id: str) -> SharedImageResponse:
    """Get a shared image by its share ID."""
    service = SharedImageService()

    data = await service.get_by_share_id(share_id)

    if data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared image not found",
        )

    return SharedImageResponse(
        template_id=data.template_id,
        text_blocks=cast(list[TextBlock | dict[str, object]], data.text_blocks),
        image_url=data.image_url,
        created_at=data.created_at,
    )
