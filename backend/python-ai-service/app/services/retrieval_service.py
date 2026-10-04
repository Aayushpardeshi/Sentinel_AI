from app.services.embedding_service import EmbeddingService
from app.services.qdrant_service import QdrantService
from app.core.config import settings
from app.core.logger import logger


class RetrievalService:
    @staticmethod
    def serialize_result(result):
        payload = result.payload or {}
        return {
            "score": result.score,
            "payload": payload,
            "document_id": payload.get("document_id"),
            "chunk_id": payload.get("chunk_id"),
            "filename": payload.get("filename"),
            "chunk_index": payload.get("chunk_index"),
            "uploaded_at": payload.get("uploaded_at"),
            "text": payload.get("text"),
        }

    @staticmethod
    def retrieve(query: str, limit: int = 3, document_id: str = None, user_id: int = None, user_teams=None):
        query_embedding = EmbeddingService.create_embeddings([query])[0]
        results = QdrantService.search(
            query_embedding,
            limit=limit,
            document_id=document_id,
            user_id=user_id,
            user_teams=user_teams or [],
        )
        logger.info("Retrieval scores: %s", [r.score for r in results])
        filtered = [result for result in results if result.score >= settings.SIMILARITY_THRESHOLD]
        return [RetrievalService.serialize_result(result) for result in filtered]
