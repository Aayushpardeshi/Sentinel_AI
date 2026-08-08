from fastapi import APIRouter
from pydantic import BaseModel

from app.services.llm_service import LLMService
from app.services.retrieval_service import RetrievalService


router = APIRouter()

llm = LLMService()


class ChatRequest(BaseModel):
    prompt: str


@router.post("/chat")
async def chat(request: ChatRequest):

    results = RetrievalService.retrieve(
        query=request.prompt,
        limit=3
    )

    chunks = [
        result.payload["text"]
        for result in results
    ]

    context = "\n\n".join(chunks)

    answer = llm.chat(
        request.prompt,
        context
    )

    return {
        "response": answer,
        "sources": chunks
    }