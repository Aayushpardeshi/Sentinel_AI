from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue
)
import uuid
from app.core.config import settings
class QdrantService:

    client = QdrantClient(
        url=settings.QDRANT_URL
    )

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
    def store_embeddings(
        chunks,
        embeddings,
        document_id,
        filename,
        uploaded_at,
        user_id
    ):

        points = []

        for index, (chunk, embedding) in enumerate(
            zip(chunks, embeddings)
        ):

            # Generate globally unique ID for this chunk
            chunk_id = str(uuid.uuid4())
            points.append(
                PointStruct(
                    id=chunk_id,
                    vector=embedding.tolist(),
                    payload={
                        "user_id": user_id,
                        "document_id": document_id,
                        "chunk_id": chunk_id,
                        "filename": filename,
                        "chunk_index": index,
                        "uploaded_at": uploaded_at,
                        "text": chunk
                    }
                )
            )
        QdrantService.client.upsert(
            collection_name=settings.QDRANT_COLLECTION,
            points=points
        )

    @staticmethod
    def search(query_vector, limit=3, document_id=None, user_id=None):
        conditions = []
        if user_id is not None:
            conditions.append(
                FieldCondition(
                    key="user_id",
                    match=MatchValue(value=user_id)
                )
            )

        if document_id:
            conditions.append(
                FieldCondition(
                    key="document_id",
                    match=MatchValue(value=document_id)
                )
            )

        query_filter = None

        if conditions:
            query_filter = Filter(must=conditions)

        results = QdrantService.client.query_points(
            collection_name=settings.QDRANT_COLLECTION,
            query=query_vector,
            query_filter=query_filter,
            limit=limit
        )

        return results.points

    @staticmethod
    def delete_document(document_id: str):

        results = QdrantService.client.scroll(
            collection_name=settings.QDRANT_COLLECTION,
            scroll_filter=Filter(
                must=[
                    FieldCondition(
                        key="document_id",
                        match=MatchValue(value=document_id)
                    )
                ]
            ),
            limit=1
        )

        points = results[0]

        filename = None

        if points:
            filename = points[0].payload.get("filename")

        QdrantService.client.delete(
            collection_name=settings.QDRANT_COLLECTION,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="document_id",
                        match=MatchValue(value=document_id)
                    )
                ]
            )
        )

        return filename
    