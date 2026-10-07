"""
RAG pipeline: retrieve relevant chunks then generate a grounded answer.
No LangGraph dependency — just a plain two-step function.
"""
from typing import List, Optional

from app.services.llm_service import LLMService
from app.services.retrieval_service import RetrievalService

llm = LLMService()


def run_chat(prompt: str, document_id: Optional[str], user_id: int, user_teams: List[int]):
    # Step 1: Retrieve
    results = RetrievalService.retrieve(
        query=prompt,
        limit=3,
        document_id=document_id,
        user_id=user_id,
        user_teams=user_teams or [],
    )

    # Step 2: Generate
    if not results:
        return {
            "response": "I don't have enough information in the uploaded documents.",
            "sources": [],
        }

    chunks = [r["text"] for r in results if r.get("text")]
    context = "\n\n".join(chunks)

    grounded_prompt = (
        "You are Sentinel AI, a secure enterprise document assistant.\n"
        "Answer the user's question using ONLY the supplied document context.\n"
        "Do not invent information.\n"
        'If the answer cannot be determined from the context, say: '
        '"I don\'t have enough information in the uploaded documents."\n\n'
        f"Retrieved context:\n{context}\n\n"
        f"User question:\n{prompt}"
    )

    answer = llm.chat(grounded_prompt, "")

    sources = [
        {
            "score": r.get("score"),
            "document_id": r.get("document_id"),
            "chunk_id": r.get("chunk_id"),
            "filename": r.get("filename"),
            "chunk_index": r.get("chunk_index"),
            "uploaded_at": r.get("uploaded_at"),
        }
        for r in results
    ]

    return {"response": answer, "sources": sources}
