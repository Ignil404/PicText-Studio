from .health import router as health_router
from .history import router as history_router
from .render import router as render_router
from .templates import router as templates_router

__all__ = ["health_router", "templates_router", "render_router", "history_router"]
