from fastapi import APIRouter

from database import async_session_factory
from repositories import RenderHistoryRepository, TemplateRepository
from schemas import HistoryEntry
from services import RenderService

router = APIRouter(tags=["history"])


@router.get("/api/history/{session_id}", response_model=list[HistoryEntry])
async def get_history(session_id: str) -> list[HistoryEntry]:
    history_repo = RenderHistoryRepository(async_session_factory)
    render_service = RenderService(
        TemplateRepository(async_session_factory),  # not used by get_history
        history_repo,
    )
    return await render_service.get_history(session_id)
