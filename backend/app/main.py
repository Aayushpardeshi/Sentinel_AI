from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logger import logger
from app.api.chat import router as chat_router
from app.api.upload import router as upload_router
from app.api.teams import router as teams_router
from app.api.documents import router as documents_router
from app.models.user import User
from app.database.database import Base, engine
from app.api.register import router as register_router
from app.api.login import router as login_router
from app.api.me import router as me_router
from app.api.audit import router as audit_router
from app.services.qdrant_service import QdrantService

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

QdrantService.initialize()

app.include_router(upload_router, tags=["Upload", "Search", "Documents"])
app.include_router(chat_router, tags=["Chat"])
app.include_router(teams_router, tags=["Teams"])
app.include_router(documents_router, tags=["Documents"])
app.include_router(register_router, tags=["Auth"])
app.include_router(login_router, tags=["Auth"])
app.include_router(me_router, tags=["Auth"])
app.include_router(audit_router, tags=["Audit"])

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