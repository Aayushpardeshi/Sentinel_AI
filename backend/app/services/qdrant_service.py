from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

from app.core.config import settings


class QdrantService:

    client = QdrantClient(url=settings.QDRANT_URL)

    @staticmethod
    def get_client():
        return QdrantService.client

    @staticmethod
    def initialize():

        QdrantService.create_collection(
            vector_size=384
        )

    @staticmethod
    def create_collection(vector_size: int):

        collections = QdrantService.client.get_collections()

        existing_collections = [
            collection.name
            for collection in collections.collections
        ]

        if settings.QDRANT_COLLECTION not in existing_collections:

            QdrantService.client.create_collection(
                collection_name=settings.QDRANT_COLLECTION,
                vectors_config=VectorParams(
                    size=vector_size,
                    distance=Distance.COSINE
                )
            )

    @staticmethod
    def store_embeddings(chunks, embeddings):

        points = []

        for index, (chunk, embedding) in enumerate(zip(chunks, embeddings)):

            points.append(
                PointStruct(
                    id=index,
                    vector=embedding.tolist(),
                    payload={
                        "text": chunk
                    }
                )
            )

        QdrantService.client.upsert(
            collection_name=settings.QDRANT_COLLECTION,
            points=points
        )

    @staticmethod
    def search(query_vector, limit=3):

        results = QdrantService.client.query_points(
            collection_name=settings.QDRANT_COLLECTION,
            query=query_vector,
            limit=limit
        )

        return results.points