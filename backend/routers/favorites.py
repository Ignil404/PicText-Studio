import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select

from database import async_session_factory
from dependencies import get_current_user
from models import Favorite, RenderHistory, User

router = APIRouter(tags=["favorites"])


class FavoriteCreateRequest(BaseModel):
    render_history_id: uuid.UUID


class FavoriteResponse(BaseModel):
    id: uuid.UUID
    render_history_id: uuid.UUID
    image_url: str
    template_id: uuid.UUID
    created_at: str


class FavoriteListResponse(BaseModel):
    favorites: list[FavoriteResponse]


@router.post("/api/favorites", status_code=status.HTTP_201_CREATED)
async def add_favorite(
    request: FavoriteCreateRequest,
    user: User = Depends(get_current_user),
) -> FavoriteResponse:
    """Add a render to favorites."""
    async with async_session_factory() as session:
        # Verify render exists and belongs to user
        result = await session.execute(
            select(RenderHistory).where(RenderHistory.id == request.render_history_id)
        )
        render = result.scalar_one_or_none()
        if not render:
            raise HTTPException(status_code=404, detail="Render not found")

        # Check if already favorited
        result = await session.execute(
            select(Favorite).where(
                Favorite.user_id == user.id,
                Favorite.render_history_id == request.render_history_id,
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            return FavoriteResponse(
                id=existing.id,
                render_history_id=existing.render_history_id,
                image_url=render.image_path,
                template_id=render.template_id,
                created_at=existing.created_at.isoformat(),
            )

        favorite = Favorite(
            user_id=user.id,
            render_history_id=request.render_history_id,
        )
        session.add(favorite)
        await session.commit()
        await session.refresh(favorite)

        return FavoriteResponse(
            id=favorite.id,
            render_history_id=favorite.render_history_id,
            image_url=render.image_path,
            template_id=render.template_id,
            created_at=favorite.created_at.isoformat(),
        )


@router.delete("/api/favorites/{favorite_id}")
async def remove_favorite(
    favorite_id: str,
    user: User = Depends(get_current_user),
) -> dict:
    """Remove a render from favorites."""
    try:
        fav_uuid = uuid.UUID(favorite_id)
    except ValueError as err:
        raise HTTPException(status_code=400, detail="Invalid favorite ID") from err

    async with async_session_factory() as session:
        result = await session.execute(
            select(Favorite).where(
                Favorite.id == fav_uuid,
                Favorite.user_id == user.id,
            )
        )
        favorite = result.scalar_one_or_none()
        if not favorite:
            raise HTTPException(status_code=404, detail="Favorite not found")

        await session.delete(favorite)
        await session.commit()

        return {"deleted": True}


@router.get("/api/favorites", response_model=FavoriteListResponse)
async def list_favorites(
    user: User = Depends(get_current_user),
) -> FavoriteListResponse:
    """List all favorites for the authenticated user."""
    async with async_session_factory() as session:
        result = await session.execute(
            select(Favorite)
            .where(Favorite.user_id == user.id)
            .order_by(Favorite.created_at.desc())
        )
        favorites = result.scalars().all()

        result = await session.execute(
            select(RenderHistory).where(
                RenderHistory.id.in_([f.render_history_id for f in favorites])
            )
        )
        renders = {r.id: r for r in result.scalars().all()}

        return FavoriteListResponse(
            favorites=[
                FavoriteResponse(
                    id=fav.id,
                    render_history_id=fav.render_history_id,
                    image_url=(
                        renders[fav.render_history_id].image_path
                        if fav.render_history_id in renders
                        else ""
                    ),
                    template_id=(
                        renders[fav.render_history_id].template_id
                        if fav.render_history_id in renders
                        else uuid.UUID(int=0)
                    ),
                    created_at=fav.created_at.isoformat(),
                )
                for fav in favorites
                if fav.render_history_id in renders
            ]
        )


@router.get("/api/favorites/check/{render_history_id}")
async def check_favorite(
    render_history_id: str,
    user: User = Depends(get_current_user),
) -> dict:
    """Check if a render is favorited by the user."""
    try:
        rh_uuid = uuid.UUID(render_history_id)
    except ValueError:
        return {"is_favorite": False}

    async with async_session_factory() as session:
        result = await session.execute(
            select(Favorite).where(
                Favorite.user_id == user.id,
                Favorite.render_history_id == rh_uuid,
            )
        )
        favorite = result.scalar_one_or_none()

        return {"is_favorite": favorite is not None}
