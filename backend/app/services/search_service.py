import numpy as np
from app.services.vector_store import VectorStore
from app.services.embedding_service import EmbeddingService


class SearchService:

    @staticmethod
    def search(query: str, k=3):

        query_embedding = EmbeddingService.model.encode(
            [query]
        )

        query_vector = np.array(query_embedding).astype(
            "float32"
        )

        distances, indexes = VectorStore.index.search(
            query_vector,
            k
        )

        results = []

        for index in indexes[0]:
            results.append(
                VectorStore.chunks[index]
            )

        return results