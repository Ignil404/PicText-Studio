from fastapi import FastAPI

from app import create_app
from routers.health import router as health_router

app: FastAPI = create_app()

app.include_router(health_router, prefix="/api")
