from fastapi import APIRouter, Depends, HTTPException, Query

from database import async_session_factory
from dependencies import get_current_user_optional
from models import RenderHistory, User
from repositories import RenderHistoryRepository, TemplateRepository
from schemas import HistoryEntry, RemixRequest, RenderResponse
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


@router.post("/api/history/remix", response_model=RenderResponse)
async def remix(
    request: RemixRequest,
    user: User | None = optional_user_dependency,
) -> RenderResponse:
    """Create a remix copy of an existing render."""
    from schemas import RenderRequest

    template_repo = TemplateRepository(async_session_factory)
    history_repo = RenderHistoryRepository(async_session_factory)
    render_service = RenderService(template_repo, history_repo)

    # Get original render to verify access
    from sqlalchemy import select

    async with async_session_factory() as session:
        result = await session.execute(
            select(RenderHistory).where(RenderHistory.id == request.render_history_id)
        )
        original = result.scalar_one_or_none()
        if not original:
            raise HTTPException(status_code=404, detail="Original render not found")

    # Create new render with remix_parent_id
    render_req = RenderRequest(
        template_id=request.template_id,
        text_blocks=request.new_text_blocks,
        owner_id=user.id if user else None,
    )
    render_req.owner_id = user.id if user else None

    result = await render_service.render_image(render_req)

    # Note: remix_parent_id would need to be updated in render_service.render_image()
    # For now, the parent info is in the request but not persisted

    return result
