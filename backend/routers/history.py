from fastapi import APIRouter, Depends, Query

from database import async_session_factory
from dependencies import get_current_user_optional
from models import User
from repositories import RenderHistoryRepository, TemplateRepository
from schemas import HistoryEntry
from services import RenderService

router = APIRouter(tags=["history"])
optional_user_dependency = Depends(get_current_user_optional)


@router.get("/api/history/me", response_model=list[HistoryEntry])
async def get_history_me(
    user: User | None = optional_user_dependency,
    session_id: str | None = Query(None),
) -> list[HistoryEntry]:
    """Get history for authenticated user or guest session.

    - If authenticated (JWT present): returns user's renders
    - If guest (session_id provided): returns guest session renders
    """
    history_repo = RenderHistoryRepository(async_session_factory)
    render_service = RenderService(
        TemplateRepository(async_session_factory),
        history_repo,
    )

    if user:
        return await render_service.get_history_by_user(user.id)
    elif session_id:
        return await render_service.get_history(session_id)
    else:
        return []


@router.get("/api/history/{session_id}", response_model=list[HistoryEntry])
async def get_history(session_id: str) -> list[HistoryEntry]:
    history_repo = RenderHistoryRepository(async_session_factory)
    render_service = RenderService(
        TemplateRepository(async_session_factory),
        history_repo,
    )
    return await render_service.get_history(session_id)
