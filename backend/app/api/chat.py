from fastapi import APIRouter
from pydantic import BaseModel
from app.services.llm_service import LLMService
from app.services.retrieval_service import RetrievalService
from fastapi import APIRouter, Depends
from app.security.dependencies import get_current_user
router = APIRouter()
llm = LLMService()

class ChatRequest(BaseModel):
    prompt: str
    document_id: str | None = None

@router.post("/chat")
async def chat(request: ChatRequest,current_user: int = Depends(get_current_user)):

    results = RetrievalService.retrieve(
        query=request.prompt,
        limit=3,
        document_id=request.document_id,
        user_id=current_user
    )
    print("CHAT DOCUMENT ID:", request.document_id)
    print("CHAT RESULTS:", results)
    if not results:
        return {
            "response": "I don't have enough information in the uploaded documents.",
            "sources": []
        }
    chunks = [
        result.payload["text"]
        for result in results
    ]
    context = "\n\n".join(chunks)
    answer = llm.chat(
        request.prompt,
        context
    )
    sources = [
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
    return {
        "response": answer,
        "sources": sources
    }