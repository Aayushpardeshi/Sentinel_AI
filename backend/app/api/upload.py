from fastapi import APIRouter, UploadFile, File

from app.services.pdf_service import PDFService
from app.services.chunk_service import ChunkService
from app.services.embedding_service import EmbeddingService
from app.services.qdrant_service import QdrantService
from app.services.retrieval_service import RetrievalService

import shutil
import os


router = APIRouter()

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = PDFService.extract_text(file_path)

    chunks = ChunkService.split_text(text)

    embeddings = EmbeddingService.create_embeddings(chunks)

    QdrantService.initialize()

    QdrantService.store_embeddings(
        chunks,
        embeddings
    )

    return {
        "message": "Uploaded Successfully",
        "filename": file.filename,
        "characters": len(text),
        "chunks": len(chunks)
    }


@router.get("/search")
async def search(query: str):

    results = RetrievalService.retrieve(
        query=query,
        limit=3
    )

    return {
        "query": query,
        "results": [
            {
                "score": result.score,
                "text": result.payload["text"]
            }
            for result in results
        ]
    }