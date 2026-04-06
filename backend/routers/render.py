from fastapi import APIRouter, HTTPException

from database import async_session_factory
from repositories import RenderHistoryRepository, TemplateRepository
from schemas import RenderRequest, RenderResponse
from services import RenderError, RenderService

router = APIRouter(tags=["render"])


@router.post("/api/render", response_model=RenderResponse)
async def render_image(request: RenderRequest) -> RenderResponse:
    template_repo = TemplateRepository(async_session_factory)
    history_repo = RenderHistoryRepository(async_session_factory)
    render_service = RenderService(template_repo, history_repo)

    try:
        return await render_service.render_image(request)
    except RenderError as exc:
        if "Template not found" in str(exc):
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        raise HTTPException(status_code=500, detail=str(exc)) from exc
