from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

    logger.info("Middleware configured")
    return app
