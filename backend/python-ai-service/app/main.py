from fastapi import FastAPI

from app.core.config import settings
from app.core.logger import logger
from app.api.internal import router as internal_router
from app.services.qdrant_service import QdrantService

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url=None,
    redoc_url=None,
)

try:
    QdrantService.initialize()
except Exception as exc:
    logger.warning("Qdrant initialization skipped: %s", exc)

app.include_router(internal_router)


@app.get("/health")
async def health():
    return {"status": "Healthy"}
