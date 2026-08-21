from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
from datetime import datetime, timezone
import shutil
import os

from app.database.database import get_db
from app.services.pdf_service import PDFService
from app.services.chunk_service import ChunkService
from app.services.embedding_service import EmbeddingService
from app.services.qdrant_service import QdrantService
from app.services.retrieval_service import RetrievalService
from app.security.dependencies import get_current_user
from app.services.authorization_service import AuthorizationService
from app.services.document_service import DocumentService
from app.services.audit_service import AuditLogService

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    scope: str = Form("PERSONAL"),
    team_id: int = Form(None),
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    scope = scope.upper()
    if scope not in ["PERSONAL", "TEAM"]:
        raise HTTPException(status_code=400, detail="Invalid scope")
    
    if scope == "TEAM":
        if not team_id:
            raise HTTPException(status_code=400, detail="team_id is required for TEAM scope")
        if not AuthorizationService.is_team_member(db, current_user, team_id):
            AuditLogService.record(db, action="ACCESS_DENIED", resource_type="TEAM", resource_id=str(team_id), team_id=team_id, status="DENIED", user_id=current_user)
            raise HTTPException(status_code=403, detail="Not authorized for this team")
    else:
        team_id = None

    document_id = str(uuid.uuid4())
    uploaded_at = datetime.now(timezone.utc).isoformat()
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = PDFService.extract_text(file_path)
    chunks = ChunkService.split_text(text)
    embeddings = EmbeddingService.create_embeddings(chunks)

    QdrantService.initialize()
    QdrantService.store_embeddings(
        chunks=chunks,
        embeddings=embeddings,
        document_id=document_id,
        filename=file.filename,
        uploaded_at=uploaded_at,
        scope=scope,
        owner_user_id=current_user,
        team_id=team_id
    )

    DocumentService.create_document(db, document_id, file.filename, current_user, scope, team_id)
    AuditLogService.record(db, action="DOCUMENT_UPLOAD", resource_type="DOCUMENT", resource_id=document_id, team_id=team_id, status="SUCCESS", user_id=current_user)

    return {
        "message": "Uploaded Successfully",
        "document_id": document_id,
        "filename": file.filename,
        "characters": len(text),
        "chunks": len(chunks),
        "scope": scope,
        "team_id": team_id
    }

@router.get("/search")
async def search(
    query: str,
    document_id: str = None,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    if document_id and not AuthorizationService.can_access_document(db, current_user, document_id):
        AuditLogService.record(db, action="ACCESS_DENIED", resource_type="DOCUMENT", resource_id=document_id, status="DENIED", user_id=current_user)
        raise HTTPException(status_code=404, detail="Document not found")

    results = RetrievalService.retrieve(
        db=db,
        query=query,
        limit=3,
        document_id=document_id,
        user_id=current_user
    )

    AuditLogService.record(db, action="DOCUMENT_QUERY", resource_type="DOCUMENT", resource_id=document_id, status="SUCCESS", user_id=current_user)

    return {
        "query": query,
        "results": [
            {
                "score": result.score,
                "document_id": result.payload.get("document_id"),
                "chunk_id": result.payload.get("chunk_id"),
                "filename": result.payload.get("filename"),
                "chunk_index": result.payload.get("chunk_index"),
                "uploaded_at": result.payload.get("uploaded_at"),
                "text": result.payload.get("text")
            }
            for result in results
        ]
    }

@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    if not AuthorizationService.can_delete_document(db, current_user, document_id):
        AuditLogService.record(db, action="ACCESS_DENIED", resource_type="DOCUMENT", resource_id=document_id, status="DENIED", user_id=current_user)
        raise HTTPException(status_code=403, detail="Not authorized to delete this document")

    filename = QdrantService.delete_document(document_id)
    DocumentService.delete_document(db, document_id)

    if filename:
        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)

    AuditLogService.record(db, action="DOCUMENT_DELETE", resource_type="DOCUMENT", resource_id=document_id, status="SUCCESS", user_id=current_user)

    return {
        "message": "Document deleted successfully",
        "document_id": document_id,
        "filename": filename
    }