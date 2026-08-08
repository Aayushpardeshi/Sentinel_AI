from fastapi import APIRouter
from app.services.retrieval_service import RetrievalService

router = APIRouter()


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