import uuid

from fastapi import APIRouter, HTTPException

from database import async_session_factory
from repositories import TemplateRepository
from schemas import TemplateResponse
from services import CacheService, TemplateService

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("/", response_model=list[TemplateResponse])
async def list_templates() -> list[TemplateResponse]:
    repo = TemplateRepository(async_session_factory)
    cache = CacheService()
    service = TemplateService(repo, cache)
    data = await service.get_all()
    return [TemplateResponse.model_validate(item) for item in data]


@router.get("/categories", response_model=list[str])
async def list_categories() -> list[str]:
    repo = TemplateRepository(async_session_factory)
    cache = CacheService()
    service = TemplateService(repo, cache)
    return await service.get_categories()


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: uuid.UUID) -> TemplateResponse:
    repo = TemplateRepository(async_session_factory)
    cache = CacheService()
    service = TemplateService(repo, cache)
    data = await service.get_by_id(template_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return TemplateResponse.model_validate(data)


@router.get("/by-slug/{template_slug}", response_model=TemplateResponse)
async def get_template_by_slug(template_slug: str) -> TemplateResponse:
    repo = TemplateRepository(async_session_factory)
    cache = CacheService()
    service = TemplateService(repo, cache)
    data = await service.get_by_slug(template_slug)
    if data is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return TemplateResponse.model_validate(data)
