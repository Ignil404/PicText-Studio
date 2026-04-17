from __future__ import annotations

import base64
import io
import re
import uuid
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from constants import FONT_REGISTRY
from repositories.render_history_repository import RenderHistoryRepository
from repositories.template_repository import TemplateRepository
from schemas import HistoryEntry, RenderRequest, RenderResponse, TextBlock

# Patterns to strip from SVG before rendering (XSS prevention)
_SVG_DANGEROUS = re.compile(
    r"<\s*(script|object|embed|iframe|form|input|textarea)"
    r"|on\w+\s*="  # event handlers: onclick=, onload=, etc.
    r"|javascript\s*:"  # javascript: URIs
    r"|<!ENTITY|SYSTEM|<!DOCTYPE[^>]*ENTITY",  # XXE
    re.IGNORECASE | re.DOTALL,
)


class RenderError(Exception):
    """Raised when image rendering fails."""


def _resolve_image_source(image_path: str) -> Image.Image:
    """Open image from file path or data URI.

    SECURITY: SVG data URIs are sanitised before rendering via cairosvg.
    Dangerous elements (<script>, event handlers, javascript: URIs, XXE)
    are stripped to prevent SVG-based XSS.
    """
    if image_path.startswith("data:"):
        # Decode base64 data URI
        header, encoded = image_path.split(",", 1)
        raw = base64.b64decode(encoded)

        # SVG → sanitise then rasterise via cairosvg
        if "svg" in header:
            try:
                svg_text = raw.decode("utf-8", errors="replace")
                # Strip dangerous patterns
                svg_text = _SVG_DANGEROUS.sub("", svg_text)

                import cairosvg

                png_bytes = cairosvg.svg2png(
                    bytestring=svg_text.encode("utf-8"),
                    output_width=1080,
                    output_height=1080,
                )
                return Image.open(io.BytesIO(png_bytes)).convert("RGBA")
            except ImportError:
                # Fallback: try PIL directly (won't work for SVG, but let Pillow try)
                pass

        return Image.open(io.BytesIO(raw)).convert("RGBA")
    else:
        return Image.open(image_path).convert("RGBA")


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

    def _load_font(
        self,
        font_family: str,
        font_size: int,
        *,
        bold: bool = False,
        italic: bool = False,
    ) -> ImageFont.FreeTypeFont:
        filename = FONT_REGISTRY.get(font_family)
        if filename is None:
            raise RenderError(f"Unknown font family: {font_family!r}")

        # Handle bold variant: prefer explicit bold font file
        if bold and font_family == "Roboto":
            filename = "Roboto-Bold.ttf"
        # Italic handling: apply style flag if supported
        # (Pillow doesn't auto-synthesize italic; we use the base font)

        font_path = self._font_dir / filename
        if not font_path.exists():
            raise RenderError(f"Font file not found: {font_path}")
        return ImageFont.truetype(str(font_path), font_size)

    @staticmethod
    def _percent_to_pixel(pct: float, dimension: int) -> float:
        """Convert percentage coordinate to pixel value."""
        return (pct / 100) * dimension

    @staticmethod
    def _text_align_to_anchor(text_align: str | None) -> str:
        """Map text_align value to Pillow anchor string."""
        if text_align == "center":
            return "mm"
        if text_align == "right":
            return "rm"
        return "lm"

    async def render_image(self, request: RenderRequest) -> RenderResponse:
        template = await self._template_repo.get_by_id(request.template_id)
        if template is None:
            raise RenderError(f"Template not found: {request.template_id}")

        try:
            img = _resolve_image_source(template.image_path)
            draw = ImageDraw.Draw(img)

            for block in request.text_blocks:
                font = self._load_font(
                    block.font_family,
                    block.font_size,
                    bold=block.bold,
                    italic=block.italic,
                )
                px = self._percent_to_pixel(block.x, img.width)
                py = self._percent_to_pixel(block.y, img.height)
                anchor = self._text_align_to_anchor(block.text_align)

                draw.text(
                    (px, py),
                    block.text,
                    font=font,
                    fill=block.color,
                    anchor=anchor,
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
        history_record = await self._history_repo.create(
            session_id=request.session_id,
            template_id=request.template_id,
            text_blocks=text_blocks_data,
            image_path=image_url,
            owner_id=request.owner_id,
        )

        return RenderResponse(image_url=image_url, render_history_id=history_record.id)

    async def get_history(self, session_id: str) -> list[HistoryEntry]:
        records = await self._history_repo.get_by_session(session_id)
        if not records:
            return []

        template_ids = {record.template_id for record in records}
        templates = await self._template_repo.get_by_ids(template_ids)
        name_map = {t.id: t.name for t in templates}

        return [
            HistoryEntry(
                id=record.id,
                template_id=record.template_id,
                template_name=name_map.get(record.template_id, ""),
                text_blocks=[
                    tb if isinstance(tb, TextBlock) else TextBlock.model_validate(tb)
                    for tb in record.text_blocks
                ],
                image_url=record.image_path,
                created_at=record.created_at,
            )
            for record in records
        ]

    async def get_history_by_user(self, user_id: uuid.UUID) -> list[HistoryEntry]:
        """Get all renders owned by an authenticated user."""
        records = await self._history_repo.get_by_owner(user_id)
        if not records:
            return []

        template_ids = {record.template_id for record in records}
        templates = await self._template_repo.get_by_ids(template_ids)
        name_map = {t.id: t.name for t in templates}

        return [
            HistoryEntry(
                id=record.id,
                template_id=record.template_id,
                template_name=name_map.get(record.template_id, ""),
                text_blocks=[
                    tb if isinstance(tb, TextBlock) else TextBlock.model_validate(tb)
                    for tb in record.text_blocks
                ],
                image_url=record.image_path,
                created_at=record.created_at,
            )
            for record in records
        ]
