"""Admin stats router — analytics and statistics for administrators."""

from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select

from database import async_session_factory
from dependencies import require_admin
from models import RenderHistory, Template, User
from services.cache_service import CacheService

router = APIRouter(
    prefix="/api/admin/stats",
    tags=["admin-stats"],
    dependencies=[Depends(require_admin)],
)

CACHE_TTL = 300  # 5 minutes

cache = CacheService()


class DashboardStats(BaseModel):
    """Overview stats for admin dashboard."""

    renders_last_7d: int
    total_users: int
    total_templates: int
    renders_today: int


class DailyRendersResponse(BaseModel):
    """Daily render counts for charting."""

    data: list[dict[str, Any]]
    period_start: date
    period_end: date


class PopularTemplateItem(BaseModel):
    """Popular template item."""

    template_id: str
    template_name: str
    render_count: int


class PopularTemplatesResponse(BaseModel):
    """Popular templates list."""

    items: list[PopularTemplateItem]


class UserActivityResponse(BaseModel):
    """User activity stats for charting."""

    new_users: list[dict[str, Any]]
    active_users: list[dict[str, Any]]
    period_start: date
    period_end: date


def _get_date_range(days: int) -> tuple[date, date]:
    """Get start and end dates for a period."""
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)
    return start_date, end_date


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats() -> DashboardStats:
    """Get overview stats for admin dashboard."""
    cache_key = "admin:dashboard"
    cached = await cache.get(cache_key)
    if cached and isinstance(cached, dict):
        return DashboardStats(**cached)

    async with async_session_factory() as session:
        # Renders in last 7 days
        seven_days_ago = datetime.now() - timedelta(days=7)
        renders_7d_result = await session.execute(
            select(func.count())
            .select_from(RenderHistory)
            .where(RenderHistory.created_at >= seven_days_ago)
        )
        renders_last_7d = renders_7d_result.scalar_one() or 0

        # Total users
        users_result = await session.execute(select(func.count()).select_from(User))
        total_users = users_result.scalar_one() or 0

        # Total templates
        templates_result = await session.execute(select(func.count()).select_from(Template))
        total_templates = templates_result.scalar_one() or 0

        # Renders today
        today_start = datetime.combine(date.today(), datetime.min.time())
        renders_today_result = await session.execute(
            select(func.count())
            .select_from(RenderHistory)
            .where(RenderHistory.created_at >= today_start)
        )
        renders_today = renders_today_result.scalar_one() or 0

        stats = {
            "renders_last_7d": renders_last_7d,
            "total_users": total_users,
            "total_templates": total_templates,
            "renders_today": renders_today,
        }
        await cache.set(cache_key, stats, CACHE_TTL)
        return DashboardStats(**stats)


@router.get("/renders")
async def get_daily_renders(
    days: int = Query(7, ge=1, le=30),
) -> DailyRendersResponse:
    """Get daily render counts for the specified period."""
    cache_key = f"admin:renders:{days}"
    cached = await cache.get(cache_key)
    if cached and isinstance(cached, dict):
        return DailyRendersResponse(**cached)

    start_date, end_date = _get_date_range(days)

    async with async_session_factory() as session:
        # Get renders grouped by day
        result = await session.execute(
            select(
                func.date(RenderHistory.created_at).label("date"),
                func.count().label("count"),
            )
            .where(RenderHistory.created_at >= datetime.combine(start_date, datetime.min.time()))
            .group_by(func.date(RenderHistory.created_at))
            .order_by(func.date(RenderHistory.created_at))
        )

        # Build data with all days in range
        data_by_date = {row.date.isoformat(): row.count for row in result.all()}

        data = []
        current = start_date
        while current <= end_date:
            date_str = current.isoformat()
            data.append(
                {
                    "date": date_str,
                    "count": data_by_date.get(date_str, 0),
                }
            )
            current += timedelta(days=1)

        response = {
            "data": data,
            "period_start": start_date.isoformat(),
            "period_end": end_date.isoformat(),
        }
        await cache.set(cache_key, response, CACHE_TTL)
        return DailyRendersResponse(
            data=data,
            period_start=start_date,
            period_end=end_date,
        )


@router.get("/popular-templates", response_model=PopularTemplatesResponse)
async def get_popular_templates(
    limit: int = Query(10, ge=1, le=20),
    days: int = Query(30, ge=1, le=90),
) -> PopularTemplatesResponse:
    """Get most popular templates by render count."""
    cache_key = f"admin:popular:{limit}:{days}"
    cached = await cache.get(cache_key)
    if cached and isinstance(cached, dict):
        return PopularTemplatesResponse(**cached)

    start_date = datetime.now() - timedelta(days=days)

    async with async_session_factory() as session:
        result = await session.execute(
            select(
                RenderHistory.template_id,
                Template.name,
                func.count().label("render_count"),
            )
            .join(Template, RenderHistory.template_id == Template.id)
            .where(RenderHistory.created_at >= start_date)
            .group_by(RenderHistory.template_id, Template.name)
            .order_by(func.count().desc())
            .limit(limit)
        )

        items = [
            PopularTemplateItem(
                template_id=str(row.template_id),
                template_name=row.name,
                render_count=row.render_count,
            )
            for row in result.all()
        ]

        response = {"items": items}
        await cache.set(cache_key, response, CACHE_TTL)
        return PopularTemplatesResponse(**response)


@router.get("/user-activity")
async def get_user_activity(
    days: int = Query(7, ge=1, le=30),
) -> UserActivityResponse:
    """Get user activity stats: new users and active users per day."""
    cache_key = f"admin:user-activity:{days}"
    cached = await cache.get(cache_key)
    if cached and isinstance(cached, dict):
        return UserActivityResponse(**cached)

    start_date, end_date = _get_date_range(days)

    async with async_session_factory() as session:
        # New users per day
        new_users_result = await session.execute(
            select(
                func.date(User.created_at).label("date"),
                func.count().label("count"),
            )
            .where(User.created_at >= datetime.combine(start_date, datetime.min.time()))
            .group_by(func.date(User.created_at))
            .order_by(func.date(User.created_at))
        )
        new_users_by_date = {row.date.isoformat(): row.count for row in new_users_result.all()}

        # Active users (made at least one render) per day
        active_users_result = await session.execute(
            select(
                func.date(RenderHistory.created_at).label("date"),
                func.count(func.distinct(RenderHistory.owner_id)).label("count"),
            )
            .where(
                RenderHistory.created_at >= datetime.combine(start_date, datetime.min.time()),
                RenderHistory.owner_id.is_not(None),
            )
            .group_by(func.date(RenderHistory.created_at))
            .order_by(func.date(RenderHistory.created_at))
        )
        active_users_by_date = {
            row.date.isoformat(): row.count for row in active_users_result.all()
        }

        # Build data with all days in range
        new_users_data = []
        active_users_data = []
        current = start_date
        while current <= end_date:
            date_str = current.isoformat()
            new_users_data.append(
                {
                    "date": date_str,
                    "count": new_users_by_date.get(date_str, 0),
                }
            )
            active_users_data.append(
                {
                    "date": date_str,
                    "count": active_users_by_date.get(date_str, 0),
                }
            )
            current += timedelta(days=1)

        response = {
            "new_users": new_users_data,
            "active_users": active_users_data,
            "period_start": start_date.isoformat(),
            "period_end": end_date.isoformat(),
        }
        await cache.set(cache_key, response, CACHE_TTL)
        return UserActivityResponse(
            new_users=new_users_data,
            active_users=active_users_data,
            period_start=start_date,
            period_end=end_date,
        )
