from typing import cast

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import HTMLResponse

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


@router.get("/shared/{share_id}/embed")
async def get_shared_image_embed(share_id: str) -> HTMLResponse:
    """Get shared image for embed without authentication."""
    service = SharedImageService()
    data = await service.get_by_share_id(share_id)

    if data is None:
        return HTMLResponse(
            content="<html><body><h1>Image not found</h1></body></html>",
            status_code=404,
        )

    image_url = data.image_url
    if not image_url.startswith("http"):
        API_BASE_URL = "http://localhost:8000"
        image_url = f"{API_BASE_URL}{image_url}"

    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f5f5f5;
    }}
    img {{
      max-width: 100%;
      max-height: 100vh;
      object-fit: contain;
    }}
  </style>
</head>
<body>
  <img src="{image_url}" alt="Shared image" />
</body>
</html>"""
    return HTMLResponse(content=html)


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
        author_id=data.author_id,
        author_name=data.author_name or "Аноним",
        author_avatar=data.author_avatar,
    )
