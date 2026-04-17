from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import select

from database import async_session_factory
from models import RenderHistory, SharedImage

try:
    from nanoid import nanoid
except ImportError:
    from .generate_nanoid import generate_nanoid as nanoid


@dataclass
class SharedImageData:
    template_id: uuid.UUID
    text_blocks: list[dict[str, object]]
    image_url: str
    created_at: datetime


class SharedImageService:
    def __init__(self) -> None:
        pass

    async def create_share(
        self,
        render_history_id: uuid.UUID,
        owner_id: uuid.UUID | None = None,
        session_id: str | None = None,
    ) -> tuple[SharedImage, str]:
        """Create a shared image link for a render.

        Returns:
            Tuple of (SharedImage instance, share_id)
        """
        async with async_session_factory() as session:
            result = await session.execute(
                select(RenderHistory).where(RenderHistory.id == render_history_id)
            )
            render = result.scalar_one_or_none()

            if render is None:
                raise ValueError("Render not found")

            if owner_id is not None and render.owner_id != owner_id:
                raise PermissionError("Not authorized to share this render")

            if session_id is not None and render.session_id != session_id:
                raise PermissionError("Not authorized to share this render")

            share_id = nanoid(size=10)

            shared_image = SharedImage(
                render_history_id=render_history_id,
                share_id=share_id,
            )
            session.add(shared_image)
            await session.commit()
            await session.refresh(shared_image)

            return shared_image, share_id

    async def get_by_share_id(self, share_id: str) -> SharedImageData | None:
        """Get shared image data by share ID.

        Returns render data if found, None if not found.
        """
        async with async_session_factory() as session:
            result = await session.execute(
                select(SharedImage).where(SharedImage.share_id == share_id)
            )
            shared_image = result.scalar_one_or_none()

            if shared_image is None:
                return None

            result = await session.execute(
                select(RenderHistory).where(RenderHistory.id == shared_image.render_history_id)
            )
            render = result.scalar_one_or_none()

            if render is None:
                return None

            return SharedImageData(
                template_id=render.template_id,
                text_blocks=render.text_blocks,
                image_url=render.image_path,
                created_at=render.created_at,
            )
