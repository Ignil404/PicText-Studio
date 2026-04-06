from typing import Any

from fastapi import FastAPI

from app import create_app
from routers.health import router as health_router
from routers.history import router as history_router
from routers.render import router as render_router
from routers.templates import router as templates_router

app: FastAPI = create_app()

app.include_router(health_router, prefix="/api")
app.include_router(templates_router)
app.include_router(render_router)
app.include_router(history_router)


@app.get("/")
async def root() -> dict[str, Any]:
    return {
        "name": "DL2026 FSD2 Image Text Constructor API",
        "version": "0.1.0",
        "docs": "/docs",
        "endpoints": {
            "health": "/api/health",
            "templates": "/api/templates/",
            "categories": "/api/templates/categories",
            "render": "POST /api/render",
            "history": "/api/history/{session_id}",
        },
    }
