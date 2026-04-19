from __future__ import annotations

import uuid

from repositories.template_repository import TemplateRepository
from schemas import TemplateResponse

from .cache_service import CacheService

_CACHE_KEY_ALL = "templates:all"
_CACHE_KEY_CATEGORIES = "templates:categories"


class TemplateService:
    def __init__(
        self,
        template_repo: TemplateRepository,
        cache: CacheService,
    ) -> None:
        self._repo = template_repo
        self._cache = cache

    async def get_all(self) -> list[dict[str, object]]:
        cached = await self._cache.get(_CACHE_KEY_ALL)
        if cached is not None:
            return cached  # type: ignore[return-value]

        templates = await self._repo.get_all()
        result = [TemplateResponse.from_model(t).model_dump() for t in templates]
        await self._cache.set(_CACHE_KEY_ALL, result)
        return result

    async def get_by_id(self, template_id: uuid.UUID) -> dict[str, object] | None:
        cache_key = f"template:{template_id}"
        cached = await self._cache.get(cache_key)
        if cached is not None:
            return cached  # type: ignore[return-value]

        template = await self._repo.get_by_id(template_id)
        if template is None:
            return None

        result = TemplateResponse.from_model(template).model_dump()
        await self._cache.set(cache_key, result)
        return result

    async def get_by_slug(self, slug: str) -> dict[str, object] | None:
        cache_key = f"template:slug:{slug}"
        cached = await self._cache.get(cache_key)
        if cached is not None:
            return cached  # type: ignore[return-value]

        template = await self._repo.get_by_slug(slug)
        if template is None:
            return None

        result = TemplateResponse.from_model(template).model_dump()
        await self._cache.set(cache_key, result)
        return result

    async def get_categories(self) -> list[str]:
        cached = await self._cache.get(_CACHE_KEY_CATEGORIES)
        if cached is not None:
            return cached  # type: ignore[return-value]

        categories = await self._repo.get_categories()
        await self._cache.set(_CACHE_KEY_CATEGORIES, categories)
        return categories

    async def invalidate_all_cache(self) -> None:
        await self._cache.invalidate(_CACHE_KEY_ALL)
        await self._cache.invalidate(_CACHE_KEY_CATEGORIES)
