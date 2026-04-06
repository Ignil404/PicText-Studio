import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from logger import configure_logging, get_logger

logger = get_logger(__name__)


def create_app() -> FastAPI:
    configure_logging()
    logger.info("Starting DL2026 FSD2 backend")

    app = FastAPI(title="DL2026 FSD2", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    rendered_dir = os.path.join(os.path.dirname(__file__), "rendered_images")
    os.makedirs(rendered_dir, exist_ok=True)
    app.mount("/api/rendered", StaticFiles(directory=rendered_dir), name="rendered")

    logger.info("Middleware configured")
    return app
