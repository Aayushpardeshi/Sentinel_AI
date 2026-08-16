from fastapi import APIRouter, UploadFile, File, Depends
import uuid
from datetime import datetime, timezone
from app.services.pdf_service import PDFService
from app.services.chunk_service import ChunkService
from app.services.embedding_service import EmbeddingService
from app.services.qdrant_service import QdrantService
from app.services.retrieval_service import RetrievalService
from app.security.dependencies import get_current_user
import shutil
import os

router = APIRouter()

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...),current_user: int = Depends(get_current_user)):

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
        user_id=current_user
    )

    return {
        "message": "Uploaded Successfully",
        "document_id": document_id,
        "filename": file.filename,
        "characters": len(text),
        "chunks": len(chunks)
    }


@router.get("/search")
async def search(query: str,document_id: str = None,current_user: int = Depends(get_current_user)):

    results = RetrievalService.retrieve(
        query=query,
        limit=3,
        document_id=document_id,
        user_id=current_user
    )

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
async def delete_document(document_id: str):

    filename = QdrantService.delete_document(document_id)

    if filename:
        file_path = os.path.join(UPLOAD_DIR, filename)

        if os.path.exists(file_path):
            os.remove(file_path)

    return {
        "message": "Document deleted successfully",
        "document_id": document_id,
        "filename": filename
    }