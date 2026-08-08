from app.services.embedding_service import EmbeddingService
from app.services.qdrant_service import QdrantService


class RetrievalService:

    @staticmethod
    def retrieve(query: str, limit: int = 3):

        query_embedding = EmbeddingService.create_embeddings(
            [query]
        )[0]

        results = QdrantService.search(
            query_embedding,
            limit=limit
        )

        return results