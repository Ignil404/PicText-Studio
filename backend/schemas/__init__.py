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


# Full render request
class RenderRequest(BaseModel):
    session_id: str | None = None
    template_id: uuid.UUID
    text_blocks: list[TextBlock]
    format: str = Field(pattern=r"^(png|jpeg)$", default="png")
    # Set by the router for authenticated renders
    owner_id: uuid.UUID | None = None


# Render response
class RenderResponse(BaseModel):
    image_url: str


# History entry
class HistoryEntry(BaseModel):
    id: uuid.UUID
    template_id: uuid.UUID
    template_name: str
    text_blocks: list[TextBlock | dict[str, object]]
    image_url: str
    created_at: datetime
