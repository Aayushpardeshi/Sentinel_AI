from sentence_transformers import SentenceTransformer


class EmbeddingService:

    model = SentenceTransformer(
        "all-MiniLM-L6-v2"
    )

    @staticmethod
    def create_embeddings(chunks):

        embeddings = EmbeddingService.model.encode(
            chunks
        )

        return embeddings