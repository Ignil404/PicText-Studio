import time

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from database import async_session_factory
from models import ApiKey, User
from repositories import RenderHistoryRepository, TemplateRepository
from schemas import RenderRequest, RenderResponse
from services import RenderError, RenderService

router = APIRouter(tags=["public"])

_API_KEY_BUCKET: dict[str, list[float]] = {}
_API_KEY_LIMIT = 100
_API_KEY_WINDOW = 60


def _check_api_key_rate_limit(key: str) -> bool:
    """Return True if request is allowed, False if rate limited."""
    now = time.monotonic()
    bucket = _API_KEY_BUCKET.setdefault(key, [])
    _API_KEY_BUCKET[key] = [t for t in bucket if now - t < _API_KEY_WINDOW]
    if len(_API_KEY_BUCKET[key]) >= _API_KEY_LIMIT:
        return False
    _API_KEY_BUCKET[key].append(now)
    return True


async def get_api_key_user(
    api_key: str | None = None,
) -> tuple[User, ApiKey] | None:
    """Validate API key and return associated user."""
    if not api_key:
        return None

    async with async_session_factory() as session:
        result = await session.execute(
            select(ApiKey).where(ApiKey.key == api_key, ApiKey.is_active.is_(True))
        )
        key_obj = result.scalar_one_or_none()
        if not key_obj:
            return None

        result = await session.execute(select(User).where(User.id == key_obj.user_id))
        user = result.scalar_one_or_none()
        if not user:
            return None

        return (user, key_obj)


async def get_current_user_from_api_key(
    x_api_key: str | None = None,
) -> User:
    """Extract user from X-API-Key header."""
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key",
        )

    result = await get_api_key_user(x_api_key)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )

    user, key_obj = result
    key_str = str(key_obj.id)
    if not _check_api_key_rate_limit(key_str):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: max {_API_KEY_LIMIT} requests per {_API_KEY_WINDOW}s",
        )

    return user


@router.post("/api/v1/render", response_model=RenderResponse)
async def render_v1(
    request: RenderRequest,
    user: User = Depends(get_current_user_from_api_key),
) -> RenderResponse:
    """Public API endpoint for rendering images.

    Requires X-API-Key header with a valid API key.
    """
    template_repo = TemplateRepository(async_session_factory)
    history_repo = RenderHistoryRepository(async_session_factory)
    render_service = RenderService(template_repo, history_repo)

    request.owner_id = user.id

    try:
        return await render_service.render_image(request)
    except RenderError as exc:
        if "Template not found" in str(exc):
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        raise HTTPException(status_code=500, detail=str(exc)) from exc
