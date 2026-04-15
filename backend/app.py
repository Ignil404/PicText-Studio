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

    origins_str = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
    allowed_origins = [o.strip() for o in origins_str.split(",") if o.strip()]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "Accept"],
    )

    rendered_dir = os.path.join(os.path.dirname(__file__), "rendered_images")
    os.makedirs(rendered_dir, exist_ok=True)
    app.mount("/api/rendered", StaticFiles(directory=rendered_dir), name="rendered")

    logger.info("Middleware configured")
    return app
