"""Admin templates router — CRUD operations for templates."""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func, select

from database import async_session_factory
from dependencies import require_admin
from models import Template
from schemas import TemplateResponse

router = APIRouter(
    prefix="/api/admin/templates",
    tags=["admin-templates"],
    dependencies=[Depends(require_admin)],
)


class TemplateCreateRequest(BaseModel):
    """Request to create a new template."""

    name: str
    category: str
    image_path: str
    width: int
    height: int
    text_zones: list[dict[str, Any]]


class TemplateUpdateRequest(BaseModel):
    """Request to update a template."""

    name: str | None = None
    category: str | None = None
    image_path: str | None = None
    width: int | None = None
    height: int | None = None
    text_zones: list[dict[str, Any]] | None = None
    is_active: bool | None = None


class TemplateListResponse(BaseModel):
    """Paginated list of templates."""

    items: list[TemplateResponse]
    total: int
    page: int
    page_size: int


@router.get("", response_model=TemplateListResponse)
async def list_templates(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str | None = Query(None, description="Search by name"),
    status_filter: str | None = Query(
        None, alias="status", description="Filter by status: active, inactive"
    ),
) -> TemplateListResponse:
    """List templates with pagination, search, and status filter."""
    async with async_session_factory() as session:
        # Build base query
        query = select(Template)
        count_query = select(func.count()).select_from(Template)

        # Apply search filter
        if search:
            search_pattern = f"%{search}%"
            query = query.where(Template.name.ilike(search_pattern))
            count_query = count_query.where(Template.name.ilike(search_pattern))

        # Apply status filter
        if status_filter == "active":
            query = query.where(Template.is_active.is_(True))
            count_query = count_query.where(Template.is_active.is_(True))
        elif status_filter == "inactive":
            query = query.where(Template.is_active.is_(False))
            count_query = count_query.where(Template.is_active.is_(False))

        # Get total count
        count_result = await session.execute(count_query)
        total = count_result.scalar_one()

        # Apply pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        # Execute query
        result = await session.execute(query)
        templates = result.scalars().all()

        return TemplateListResponse(
            items=[TemplateResponse.from_model(t) for t in templates],
            total=total,
            page=page,
            page_size=page_size,
        )


@router.post("", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(body: TemplateCreateRequest) -> TemplateResponse:
    """Create a new template."""
    async with async_session_factory() as session:
        template = Template(
            name=body.name,
            category=body.category,
            image_path=body.image_path,
            width=body.width,
            height=body.height,
            text_zones=body.text_zones,
        )
        session.add(template)
        await session.commit()
        await session.refresh(template)
        return TemplateResponse.from_model(template)


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: uuid.UUID) -> TemplateResponse:
    """Get a single template by ID."""
    async with async_session_factory() as session:
        result = await session.execute(select(Template).where(Template.id == template_id))
        template = result.scalar_one_or_none()

        if template is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found",
            )

        return TemplateResponse.from_model(template)


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: uuid.UUID,
    body: TemplateUpdateRequest,
) -> TemplateResponse:
    """Update a template."""
    async with async_session_factory() as session:
        result = await session.execute(select(Template).where(Template.id == template_id))
        template = result.scalar_one_or_none()

        if template is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found",
            )

        # Update fields
        update_data = body.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(template, field, value)

        await session.commit()
        await session.refresh(template)
        return TemplateResponse.from_model(template)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(template_id: uuid.UUID) -> None:
    """Delete (soft delete) a template."""
    async with async_session_factory() as session:
        result = await session.execute(select(Template).where(Template.id == template_id))
        template = result.scalar_one_or_none()

        if template is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found",
            )

        template.is_active = False
        await session.commit()


@router.patch("/{template_id}/activate", response_model=TemplateResponse)
async def activate_template(template_id: uuid.UUID) -> TemplateResponse:
    """Activate a template."""
    async with async_session_factory() as session:
        result = await session.execute(select(Template).where(Template.id == template_id))
        template = result.scalar_one_or_none()

        if template is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found",
            )

        template.is_active = True
        await session.commit()
        await session.refresh(template)
        return TemplateResponse.from_model(template)


@router.patch("/{template_id}/deactivate", response_model=TemplateResponse)
async def deactivate_template(template_id: uuid.UUID) -> TemplateResponse:
    """Deactivate a template."""
    async with async_session_factory() as session:
        result = await session.execute(select(Template).where(Template.id == template_id))
        template = result.scalar_one_or_none()

        if template is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found",
            )

        template.is_active = False
        await session.commit()
        await session.refresh(template)
        return TemplateResponse.from_model(template)
