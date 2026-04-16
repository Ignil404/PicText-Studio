"""Admin routers package."""

from __future__ import annotations

from .stats import router as stats_router
from .templates import router as templates_router
from .users import router as users_router

__all__ = ["templates_router", "users_router", "stats_router"]
