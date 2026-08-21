from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.llm_service import LLMService
from app.services.retrieval_service import RetrievalService
from app.security.dependencies import get_current_user
from app.database.database import get_db
from app.services.authorization_service import AuthorizationService
from app.services.audit_service import AuditLogService

router = APIRouter()
llm = LLMService()

class ChatRequest(BaseModel):
    prompt: str
    document_id: str | None = None

@router.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    
    if request.document_id and not AuthorizationService.can_access_document(db, current_user, request.document_id):
        AuditLogService.record(db, action="ACCESS_DENIED", resource_type="DOCUMENT", resource_id=request.document_id, status="DENIED", user_id=current_user)
        # Avoid leaking document existence
        return {
            "response": "I don't have enough information in the uploaded documents.",
            "sources": []
        }

    results = RetrievalService.retrieve(
        db=db,
        query=request.prompt,
        limit=3,
        document_id=request.document_id,
        user_id=current_user
    )
    
    AuditLogService.record(db, action="DOCUMENT_QUERY", resource_type="RAG_QUERY", resource_id=request.document_id, status="SUCCESS", user_id=current_user)

    if not results:
        return {
            "response": "I don't have enough information in the uploaded documents.",
            "sources": []
        }

    chunks = [result.payload["text"] for result in results]
    context = "\n\n".join(chunks)

    # Use grounded generation prompt
    grounded_prompt = f"""You are Sentinel AI, a secure enterprise document assistant.
Answer the user's question using ONLY the supplied document context.
Do not invent information.
If the answer cannot be determined from the context, say:
"I don't have enough information in the uploaded documents."

Retrieved context:
{context}

User question:
{request.prompt}"""

    # It seems LLMService chat just takes prompt and context.
    # The existing implementation was llm.chat(request.prompt, context). We'll override the prompt locally or pass it depending on how chat is implemented.
    # We will pass the grounded prompt.
    answer = llm.chat(grounded_prompt, "") 

    sources = [
        {
            "score": result.score,
            "document_id": result.payload.get("document_id"),
            "chunk_id": result.payload.get("chunk_id"),
            "filename": result.payload.get("filename"),
            "chunk_index": result.payload.get("chunk_index"),
            "uploaded_at": result.payload.get("uploaded_at")
        }
        for result in results
    ]

    return {
        "response": answer,
        "sources": sources
    }