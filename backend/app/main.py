from fastapi import FastAPI

from app.core.config import settings
from app.core.logger import logger
from app.api.chat import router as chat_router
from app.api.upload import router as upload_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

app.include_router(upload_router, tags=["Upload"])
app.include_router(chat_router, tags=["Chat"])

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")

    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "Running"
    }


@app.get("/health")
async def health():
    return {
        "status": "Healthy"
    }