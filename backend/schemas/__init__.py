from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# Text zones (template layout hints)
class TextZone(BaseModel):
    id: str
    x: float
    y: float
    font_family: str
    font_size: int
    color: str
    width: float | None = None
    height: float | None = None


# Template response matches frontend Template type
class TemplateResponse(BaseModel):
    id: uuid.UUID
    name: str
    category: str
    imageUrl: str
    width: int
    height: int
    textZones: list[TextZone]

    @classmethod
    def from_model(cls, template: Any) -> TemplateResponse:
        text_zones = template.text_zones if isinstance(template.text_zones, list) else []
        return cls(
            id=template.id,
            name=template.name,
            category=template.category,
            imageUrl=template.image_path,
            width=template.width,
            height=template.height,
            textZones=[TextZone(**z) if isinstance(z, dict) else z for z in text_zones],
        )


# Category listing
class CategoryList(BaseModel):
    categories: list[str]


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


# Full render request
class RenderRequest(BaseModel):
    session_id: str
    template_id: uuid.UUID
    text_blocks: list[TextBlock]
    format: str = Field(pattern=r"^(png|jpeg)$", default="png")


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


# History list wrapper
class HistoryList(BaseModel):
    history: list[HistoryEntry]
