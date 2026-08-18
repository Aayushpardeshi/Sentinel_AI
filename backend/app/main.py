from fastapi import FastAPI

from app.core.config import settings
from app.core.logger import logger
from app.api.chat import router as chat_router
from app.api.upload import router as upload_router
from app.models.user import User
from app.database.database import Base, engine
from app.api.register import router as register_router
from app.api.login import router as login_router
from app.api.me import router as me_router
from app.services.qdrant_service import QdrantService

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

QdrantService.initialize()
app.include_router(upload_router, tags=["Upload"])
app.include_router(chat_router, tags=["Chat"])
app.include_router(register_router)
app.include_router(login_router)
app.include_router(me_router)
Base.metadata.create_all(bind=engine)

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