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
    author_id: uuid.UUID | None = None
    author_name: str | None = None
    author_avatar: str | None = None


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
        from models import User

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

            author_id = None
            author_name = None
            author_avatar = None
            if render.owner_id:
                result = await session.execute(
                    select(User).where(User.id == render.owner_id)
                )
                user = result.scalar_one_or_none()
                if user:
                    author_id = user.id
                    author_name = user.name or user.email.split("@")[0]
                    author_avatar = user.avatar_url

            return SharedImageData(
                template_id=render.template_id,
                text_blocks=render.text_blocks,
                image_url=render.image_path,
                created_at=render.created_at,
                author_id=author_id,
                author_name=author_name,
                author_avatar=author_avatar,
            )
