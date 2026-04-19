from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator

# ─── Auth schemas ─────────────────────────────────────────────────────


class RegisterRequest(BaseModel):
    email: str
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str = "user"


class UserInfo(BaseModel):
    id: uuid.UUID
    email: str
    role: str = "user"
    created_at: datetime
    render_count: int = 0


class MigrateSessionRequest(BaseModel):
    session_id: str


# ─── Existing schemas ─────────────────────────────────────────────────
class TextZone(BaseModel):
    id: str
    x: float
    y: float
    font_family: str
    font_size: int
    color: str
    width: float | None = None
    height: float | None = None
    default_text: str = ""
    label: str = ""
    shadow: bool = False


# Template response matches frontend Template type
class TemplateResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str = ""
    category: str
    imageUrl: str
    width: int
    height: int
    textZones: list[TextZone]
    is_active: bool = True

    @classmethod
    def from_model(cls, template: Any) -> TemplateResponse:
        text_zones = template.text_zones if isinstance(template.text_zones, list) else []
        is_active = getattr(template, "is_active", None)
        if is_active is None:
            is_active = True
        return cls(
            id=template.id,
            name=template.name,
            slug=getattr(template, "slug", ""),
            category=template.category,
            imageUrl=template.image_path,
            width=template.width,
            height=template.height,
            textZones=[TextZone(**z) if isinstance(z, dict) else z for z in text_zones],
            is_active=is_active,
        )


# Blocks for render request
class TextBlock(BaseModel):
    id: str
    text: str
    x: float
    y: float
    font_family: str
    font_size: int
    color: str
    bold: bool = False
    italic: bool = False
    text_align: str | None = None  # "left" | "center" | "right", default left


class StickerBlock(BaseModel):
    id: str
    emoji: str
    x: float
    y: float
    size: int = 48


class ShapeBlock(BaseModel):
    id: str
    type: str = "rectangle"  # "rectangle" | "circle" | "line" | "arrow"
    x: float
    y: float
    width: float | None = None
    height: float | None = None
    color: str = "#000000"
    filled: bool = False
    stroke_width: int = 2


# Full render request
class RenderRequest(BaseModel):
    session_id: str | None = None
    template_id: uuid.UUID
    text_blocks: list[TextBlock]
    sticker_blocks: list[StickerBlock] = []
    shape_blocks: list[ShapeBlock] = []
    format: str = Field(pattern=r"^(png|jpeg|webp)$", default="png")
    quality: int = Field(default=85, ge=1, le=100)
    resolution: str = Field(default="hd", pattern=r"^(sd|hd|4k)$")
    brightness: float = Field(default=1.0, ge=0.5, le=2.0)
    contrast: float = Field(default=1.0, ge=0.5, le=2.0)
    saturation: float = Field(default=1.0, ge=0.0, le=2.0)
    # Set by the router for authenticated renders
    owner_id: uuid.UUID | None = None


# Render response
class RenderResponse(BaseModel):
    image_url: str
    render_history_id: uuid.UUID | None = None


# Multi-format export request
class ExportZipRequest(BaseModel):
    session_id: str | None = None
    template_id: uuid.UUID
    text_blocks: list[TextBlock]
    formats: list[str] = Field(default=["png"], min_length=1)
    quality: int = Field(default=85, ge=1, le=100)
    resolution: str = Field(default="hd", pattern=r"^(sd|hd|4k)$")
    owner_id: uuid.UUID | None = None


# ZIP export response
class ExportZipResponse(BaseModel):
    download_url: str


# History entry
class HistoryEntry(BaseModel):
    id: uuid.UUID
    template_id: uuid.UUID
    template_name: str
    text_blocks: list[TextBlock | dict[str, object]]
    sticker_blocks: list[StickerBlock | dict[str, object]] = []
    shape_blocks: list[ShapeBlock | dict[str, object]] = []
    image_url: str
    created_at: datetime


# ─── Shared images schemas ────────────────────────────────────────────────


class CreateShareRequest(BaseModel):
    render_history_id: uuid.UUID


class RemixRequest(BaseModel):
    render_history_id: uuid.UUID
    new_text_blocks: list[TextBlock]
    template_id: uuid.UUID


class ShareResponse(BaseModel):
    share_id: str
    url: str


class SharedImageResponse(BaseModel):
    template_id: uuid.UUID
    text_blocks: list[TextBlock | dict[str, object]]
    image_url: str
    created_at: datetime
    author_id: uuid.UUID | None = None
    author_name: str | None = None
    author_avatar: str | None = None
