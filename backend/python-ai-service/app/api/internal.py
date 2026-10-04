from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.security.internal import verify_internal_key
from app.services.pdf_service import PDFService
from app.services.chunk_service import ChunkService
from app.services.embedding_service import EmbeddingService
from app.services.qdrant_service import QdrantService
from app.services.retrieval_service import RetrievalService
from app.rag.graph import run_chat

router = APIRouter(prefix="/internal", dependencies=[Depends(verify_internal_key)])


class ChatRequest(BaseModel):
    prompt: str
    document_id: Optional[str] = None
    user_id: int
    user_teams: List[int] = []


class SearchRequest(BaseModel):
    query: str
    document_id: Optional[str] = None
    user_id: int
    user_teams: List[int] = []
    limit: int = 3


class DeleteRequest(BaseModel):
    document_id: str


@router.post("/process-document")
async def process_document(
    file: UploadFile = File(...),
    document_id: str = Form(...),
    filename: str = Form(...),
    uploaded_at: str = Form(...),
    scope: str = Form(...),
    owner_user_id: int = Form(...),
    team_id: Optional[int] = Form(None),
):
    import os
    import tempfile

    suffix = os.path.splitext(filename)[1] or ".pdf"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        text = PDFService.extract_text(tmp_path)
        chunks = ChunkService.split_text(text)
        if not chunks:
            raise HTTPException(status_code=400, detail="No text could be extracted from the document")
        embeddings = EmbeddingService.create_embeddings(chunks)
        QdrantService.initialize()
        QdrantService.store_embeddings(
            chunks=chunks,
            embeddings=embeddings,
            document_id=document_id,
            filename=filename,
            uploaded_at=uploaded_at,
            scope=scope,
            owner_user_id=owner_user_id,
            team_id=team_id,
        )
        return {
            "document_id": document_id,
            "filename": filename,
            "characters": len(text),
            "chunks": len(chunks),
        }
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@router.post("/chat")
async def chat(request: ChatRequest):
    return run_chat(
        prompt=request.prompt,
        document_id=request.document_id,
        user_id=request.user_id,
        user_teams=request.user_teams,
    )


@router.post("/search")
async def search(request: SearchRequest):
    results = RetrievalService.retrieve(
        query=request.query,
        limit=request.limit,
        document_id=request.document_id,
        user_id=request.user_id,
        user_teams=request.user_teams,
    )
    return {
        "query": request.query,
        "results": [
            {
                "score": result["score"],
                "document_id": result.get("document_id"),
                "chunk_id": result.get("chunk_id"),
                "filename": result.get("filename"),
                "chunk_index": result.get("chunk_index"),
                "uploaded_at": result.get("uploaded_at"),
                "text": result.get("text"),
            }
            for result in results
        ],
    }


@router.post("/delete-document")
async def delete_document(request: DeleteRequest):
    filename = QdrantService.delete_document(request.document_id)
    return {
        "document_id": request.document_id,
        "filename": filename,
    }
