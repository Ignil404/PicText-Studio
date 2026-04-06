from __future__ import annotations

import uuid
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from constants import FONT_REGISTRY
from repositories.render_history_repository import RenderHistoryRepository
from repositories.template_repository import TemplateRepository
from schemas import HistoryEntry, RenderRequest, RenderResponse, TextBlock


class RenderError(Exception):
    """Raised when image rendering fails."""


class RenderService:
    def __init__(
        self,
        template_repo: TemplateRepository,
        history_repo: RenderHistoryRepository,
        font_dir: str = "/fonts",
        output_dir: str = "rendered_images",
    ) -> None:
        self._template_repo = template_repo
        self._history_repo = history_repo
        self._font_dir = Path(font_dir)
        self._output_dir = Path(output_dir)
        self._output_dir.mkdir(parents=True, exist_ok=True)

    def _load_font(self, font_family: str, font_size: int) -> ImageFont.FreeTypeFont:
        filename = FONT_REGISTRY.get(font_family)
        if filename is None:
            raise RenderError(f"Unknown font family: {font_family!r}")
        font_path = self._font_dir / filename
        if not font_path.exists():
            raise RenderError(f"Font file not found: {font_path}")
        return ImageFont.truetype(str(font_path), font_size)

    async def render_image(self, request: RenderRequest) -> RenderResponse:
        template = await self._template_repo.get_by_id(request.template_id)
        if template is None:
            raise RenderError(f"Template not found: {request.template_id}")

        try:
            img = Image.open(template.image_path).convert("RGBA")
            draw = ImageDraw.Draw(img)

            for block in request.text_blocks:
                font = self._load_font(block.font_family, block.font_size)
                draw.text(
                    (block.x, block.y),
                    block.text,
                    font=font,
                    fill=block.color,
                )

            file_ext = request.format
            filename = f"{uuid.uuid4()}.{file_ext}"
            output_path = self._output_dir / filename

            if file_ext == "jpeg":
                img = img.convert("RGB")
                img.save(str(output_path), "JPEG")
            else:
                img.save(str(output_path), "PNG")

        except RenderError:
            raise
        except Exception as exc:
            raise RenderError(f"Rendering failed: {exc}") from exc

        image_url = f"/api/rendered/{filename}"

        text_blocks_data = [b.model_dump() for b in request.text_blocks]
        await self._history_repo.create(
            session_id=request.session_id,
            template_id=request.template_id,
            text_blocks=text_blocks_data,
            image_path=str(output_path),
        )

        return RenderResponse(image_url=image_url)

    async def get_history(self, session_id: str) -> list[HistoryEntry]:
        records = await self._history_repo.get_by_session(session_id)
        return [
            HistoryEntry(
                id=record.id,
                template_id=record.template_id,
                template_name="",  # not stored in history record
                text_blocks=[
                    tb if isinstance(tb, TextBlock) else TextBlock.model_validate(tb)
                    for tb in record.text_blocks
                ],
                image_url=record.image_path,
                created_at=record.created_at,
            )
            for record in records
        ]
