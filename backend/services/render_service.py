from __future__ import annotations

import base64
import io
import re
import uuid
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont

from constants import FONT_REGISTRY, RESOLUTION_MAP
from repositories.render_history_repository import RenderHistoryRepository
from repositories.template_repository import TemplateRepository
from schemas import (
    ExportZipRequest,
    ExportZipResponse,
    HistoryEntry,
    RenderRequest,
    RenderResponse,
    ShapeBlock,
    StickerBlock,
    TextBlock,
)

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

    def _draw_emoji(self, draw: ImageDraw.Draw, img: Image.Image, dec: dict) -> None:
        """Draw emoji decoration on image."""
        try:
            x = dec.get("x", 0) * img.width
            y = dec.get("y", 0) * img.height
            size = dec.get("size", 48)
            value = dec.get("value", "")
            opacity = dec.get("opacity", 1.0)
            rotation = dec.get("rotation", 0)

            # Use a system font for emoji (try to find one with emoji support)
            try:
                emoji_font = ImageFont.truetype(
                    "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf", size
                )
            except OSError:
                try:
                    emoji_font = ImageFont.truetype(
                        "/System/Library/Fonts/Apple Color Emoji.ttc", size
                    )
                except OSError:
                    emoji_font = ImageFont.load_default()

            # Save context for rotation
            if rotation:
                # Create temporary image for rotated emoji
                temp = Image.new("RGBA", (size * 2, size * 2), (0, 0, 0, 0))
                temp_draw = ImageDraw.Draw(temp)
                temp_draw.text(
                    (size, size),
                    value,
                    font=emoji_font,
                    anchor="mm",
                    fill=(255, 255, 255, int(255 * opacity)),
                )
                temp = temp.rotate(rotation, expand=True)
                # Paste onto main image
                img.paste(temp, (int(x - temp.width / 2), int(y - temp.height / 2)), temp)
            else:
                draw.text(
                    (x, y),
                    value,
                    font=emoji_font,
                    anchor="mm",
                    fill=(255, 255, 255, int(255 * opacity)),
                )
        except Exception:
            # Skip emoji if font not available
            pass

    def _draw_sticker(self, draw: ImageDraw.Draw, sticker: StickerBlock) -> None:
        """Draw sticker (emoji) on image."""
        try:
            x = self._percent_to_pixel(sticker.x, draw.im.width)
            y = self._percent_to_pixel(sticker.y, draw.im.height)
            size = sticker.size

            # Use a system font for emoji
            try:
                emoji_font = ImageFont.truetype(
                    "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf", size
                )
            except OSError:
                try:
                    emoji_font = ImageFont.truetype(
                        "/System/Library/Fonts/Apple Color Emoji.ttc", size
                    )
                except OSError:
                    emoji_font = ImageFont.load_default()

            draw.text(
                (x, y),
                sticker.emoji,
                font=emoji_font,
                anchor="mm",
                fill=(255, 255, 255),
            )
        except Exception:
            pass

    def _draw_shape(self, draw: ImageDraw.Draw, shape: ShapeBlock) -> None:
        """Draw shape on image."""
        try:
            x = self._percent_to_pixel(shape.x, draw.im.width)
            y = self._percent_to_pixel(shape.y, draw.im.height)
            width = shape.width
            height = shape.height
            color = shape.color
            stroke_width = shape.stroke_width
            filled = shape.filled

            # Parse color (support #RRGGBB only for now)
            r = int(color[1:3], 16) if color.startswith("#") else 0
            g = int(color[3:5], 16) if len(color) >= 5 else 0
            b = int(color[5:7], 16) if len(color) >= 7 else 0

            if shape.type == "rectangle":
                if width and height:
                    bbox = [x, y, x + width, y + height]
                    if filled:
                        draw.rectangle(bbox, fill=(r, g, b))
                    else:
                        draw.rectangle(bbox, outline=(r, g, b), width=stroke_width)

            elif shape.type == "circle":
                if width and height:
                    bbox = [x - width / 2, y - height / 2, x + width / 2, y + height / 2]
                    if filled:
                        draw.ellipse(bbox, fill=(r, g, b))
                    else:
                        draw.ellipse(bbox, outline=(r, g, b), width=stroke_width)

            elif shape.type == "line":
                if width and height:
                    draw.line([x, y, x + width, y + height], fill=(r, g, b), width=stroke_width)

            elif shape.type == "arrow":
                if width and height:
                    draw.line([x, y, x + width, y + height], fill=(r, g, b), width=stroke_width)
                    # Arrow head
                    angle = 0.5
                    arrow_size = max(stroke_width * 3, 8)
                    end_x, end_y = x + width, y + height
                    import math

                    dx = width
                    dy = height
                    length = math.sqrt(dx * dx + dy * dy) if (dx * dx + dy * dy) > 0 else 1
                    dx, dy = dx / length, dy / length
                    # Left wing
                    lx = end_x - arrow_size * (dx * math.cos(angle) + dy * math.sin(angle))
                    ly = end_y - arrow_size * (dy * math.cos(angle) - dx * math.sin(angle))
                    # Right wing
                    rx = end_x - arrow_size * (dx * math.cos(angle) - dy * math.sin(angle))
                    ry = end_y - arrow_size * (dy * math.cos(angle) + dx * math.sin(angle))
                    draw.polygon(
                        [(end_x, end_y), (lx, ly), (rx, ry)],
                        fill=(r, g, b) if filled else None,
                        outline=(r, g, b),
                    )

        except Exception:
            pass

    def _draw_text_stroke(
        self,
        draw: ImageDraw.Draw,
        x: float,
        y: float,
        text: str,
        font: ImageFont.FreeTypeFont,
        color: str,
        width: int,
        anchor: str,
    ) -> None:
        """Draw text outline/stroke."""
        for dx in range(-width, width + 1):
            for dy in range(-width, width + 1):
                if dx == 0 and dy == 0:
                    continue
                draw.text((x + dx, y + dy), text, font=font, fill=color, anchor=anchor)

    @staticmethod
    def _wrap_text(
        draw: ImageDraw.Draw, text: str, font: ImageFont.FreeTypeFont, max_width: float
    ) -> list[str]:
        """Wrap text to fit within max_width."""
        words = text.split()
        lines = []
        current_line = []

        for word in words:
            test_line = " ".join(current_line + [word])
            bbox = draw.textbbox((0, 0), test_line, font=font)
            if bbox and bbox[2] - bbox[0] <= max_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(" ".join(current_line))
                current_line = [word]

        if current_line:
            lines.append(" ".join(current_line))

        return lines if lines else [text]

    async def render_image(self, request: RenderRequest) -> RenderResponse:
        template = await self._template_repo.get_by_id(request.template_id)
        if template is None:
            raise RenderError(f"Template not found: {request.template_id}")

        try:
            img = _resolve_image_source(template.image_path)

            # Use template's native resolution to preserve proportions
            target_w, target_h = template.width, template.height
            if request.resolution != "native" and request.resolution:
                # Scale if requested but keep aspect ratio
                req_w, req_h = RESOLUTION_MAP.get(
                    request.resolution, (template.width, template.height)
                )
                scale = max(req_w / target_w, req_h / target_h)
                if scale > 1:
                    target_w, target_h = int(target_w * scale), int(target_h * scale)
                    img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
            elif (img.width, img.height) != (target_w, target_h):
                img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)

            # Apply filters
            if request.brightness != 1.0:
                enhancer: ImageEnhance.ImageEnhancer = ImageEnhance.Brightness(img)
                img = enhancer.enhance(request.brightness)
            if request.contrast != 1.0:
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(request.contrast)
            if request.saturation != 1.0:
                enhancer = ImageEnhance.Color(img)
                img = enhancer.enhance(request.saturation)

            draw = ImageDraw.Draw(img)

            # Draw decorations (emoji) - safely handle missing decorations attribute
            decorations = getattr(template, "decorations", None) or []
            if decorations:
                for dec in decorations:
                    if isinstance(dec, dict) and dec.get("type") == "emoji":
                        self._draw_emoji(draw, img, dec)

            # Draw sticker blocks
            for sticker in request.sticker_blocks:
                self._draw_sticker(draw, sticker)

            # Draw shape blocks
            for shape in request.shape_blocks:
                self._draw_shape(draw, shape)

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

                # Get text block properties (shadow, stroke)
                text_shadow = getattr(block, "shadow", False)
                stroke_color = getattr(block, "stroke_color", None)
                stroke_width = getattr(block, "stroke_width", 2)

                # Calculate wrapped text lines
                max_width_px = getattr(block, "max_width", 0.8) * img.width
                lines = self._wrap_text(draw, block.text, font, max_width_px)
                line_height = block.font_size * 1.3
                start_y = py - ((len(lines) - 1) * line_height) / 2

                for i, line in enumerate(lines):
                    line_y = start_y + i * line_height

                    # Draw shadow if enabled
                    if text_shadow:
                        shadow_offset = 3
                        draw.text(
                            (px + shadow_offset, line_y + shadow_offset),
                            line,
                            font=font,
                            fill=(0, 0, 0, 128),  # Semi-transparent black
                            anchor=anchor,
                        )

                    # Draw stroke if enabled
                    if stroke_color:
                        self._draw_text_stroke(
                            draw, px, line_y, line, font, stroke_color, stroke_width, anchor
                        )

                    # Draw main text
                    draw.text(
                        (px, line_y),
                        line,
                        font=font,
                        fill=block.color,
                        anchor=anchor,
                    )

            file_ext = request.format
            filename = f"{uuid.uuid4()}.{file_ext}"
            output_path = self._output_dir / filename

            if file_ext == "jpeg":
                img = img.convert("RGB")
                img.save(str(output_path), "JPEG", quality=request.quality)
            elif file_ext == "webp":
                img = img.convert("RGBA")
                img.save(str(output_path), "WEBP", quality=request.quality)
            else:
                img.save(str(output_path), "PNG")

        except RenderError:
            raise
        except Exception as exc:
            raise RenderError(f"Rendering failed: {exc}") from exc

        image_url = f"/api/rendered/{filename}"

        text_blocks_data = [b.model_dump() for b in request.text_blocks]
        sticker_blocks_data = [b.model_dump() for b in request.sticker_blocks]
        shape_blocks_data = [b.model_dump() for b in request.shape_blocks]
        history_record = await self._history_repo.create(
            session_id=request.session_id,
            template_id=request.template_id,
            text_blocks=text_blocks_data,
            sticker_blocks=sticker_blocks_data,
            shape_blocks=shape_blocks_data,
            image_path=image_url,
            owner_id=request.owner_id,
        )

        return RenderResponse(image_url=image_url, render_history_id=history_record.id)

    async def export_zip(
        self,
        request: ExportZipRequest,
    ) -> ExportZipResponse:

        template = await self._template_repo.get_by_id(request.template_id)
        if template is None:
            raise RenderError(f"Template not found: {request.template_id}")

        base_uuid = str(uuid.uuid4())
        zip_filename = f"{base_uuid}.zip"
        zip_path = self._output_dir / zip_filename

        try:
            img = _resolve_image_source(template.image_path)
            target_w, target_h = RESOLUTION_MAP.get(request.resolution, (1920, 1080))
            if (img.width, img.height) != (target_w, target_h):
                img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)

            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                for fmt in request.formats:
                    ext = fmt if fmt != "jpeg" else "jpg"
                    img_fmt = fmt.upper() if fmt != "jpeg" else "JPEG"

                    mem_buf = io.BytesIO()
                    if fmt == "jpeg":
                        img_conv = img.convert("RGB")
                        img_conv.save(mem_buf, img_fmt, quality=request.quality)
                    elif fmt == "webp":
                        img_conv = img.convert("RGBA")
                        img_conv.save(mem_buf, img_fmt, quality=request.quality)
                    else:
                        img.save(mem_buf, img_fmt)

                    mem_buf.seek(0)
                    zf.writestr(f"image.{ext}", mem_buf.read())

        except RenderError:
            raise
        except Exception as exc:
            raise RenderError(f"ZIP export failed: {exc}") from exc

        download_url = f"/api/rendered/{zip_filename}"
        return ExportZipResponse(download_url=download_url)

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
