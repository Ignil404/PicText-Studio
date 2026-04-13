import time

from fastapi import APIRouter, HTTPException, Request

from database import async_session_factory
from repositories import RenderHistoryRepository, TemplateRepository
from schemas import RenderRequest, RenderResponse
from services import RenderError, RenderService

router = APIRouter(tags=["render"])

# Simple in-memory rate limiter: {session_id: [timestamp, ...]}
# Limit: 30 renders per 60 seconds per session
_RENDER_BUCKET: dict[str, list[float]] = {}
_RENDER_LIMIT = 30
_RENDER_WINDOW = 60


def _check_rate_limit(session_id: str) -> bool:
    """Return True if request is allowed, False if rate limited."""
    now = time.monotonic()
    bucket = _RENDER_BUCKET.setdefault(session_id, [])
    # Remove expired entries
    _RENDER_BUCKET[session_id] = [t for t in bucket if now - t < _RENDER_WINDOW]
    if len(_RENDER_BUCKET[session_id]) >= _RENDER_LIMIT:
        return False
    _RENDER_BUCKET[session_id].append(now)
    return True


@router.post("/api/render", response_model=RenderResponse)
async def render_image(request: RenderRequest, raw_request: Request) -> RenderResponse:
    # Rate limit: 30 renders per 60s per session_id
    if not _check_rate_limit(request.session_id):
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded: max {_RENDER_LIMIT} renders per {_RENDER_WINDOW}s",
        )

    template_repo = TemplateRepository(async_session_factory)
    history_repo = RenderHistoryRepository(async_session_factory)
    render_service = RenderService(template_repo, history_repo)

    try:
        return await render_service.render_image(request)
    except RenderError as exc:
        if "Template not found" in str(exc):
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        raise HTTPException(status_code=500, detail=str(exc)) from exc
