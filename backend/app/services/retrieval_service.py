from app.services.embedding_service import EmbeddingService
from app.services.qdrant_service import QdrantService
from app.services.authorization_service import AuthorizationService
from app.core.config import settings
from sqlalchemy.orm import Session

class RetrievalService:

    @staticmethod
    def retrieve(
        db: Session,
        query: str,
        limit: int = 3,
        document_id: str = None,
        user_id: int = None
    ):
        query_embedding = EmbeddingService.create_embeddings(
            [query]
        )[0]

        user_teams = AuthorizationService.get_user_teams(db, user_id)

        results = QdrantService.search(
            query_embedding,
            limit=limit,
            document_id=document_id,
            user_id=user_id,
            user_teams=user_teams
        )

        print("RETRIEVAL DOCUMENT ID:", document_id)
        print("RETRIEVAL USER ID:", user_id)
        print("RETRIEVAL SCORES:", [r.score for r in results])

        filtered_results = [
            result
            for result in results
            if result.score >= settings.SIMILARITY_THRESHOLD
        ]

        return filtered_results