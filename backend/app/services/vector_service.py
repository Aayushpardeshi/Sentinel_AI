import faiss
import numpy as np


class VectorService:

    index = None

    @staticmethod
    def create_index(embeddings):

        vectors = np.array(embeddings).astype("float32")

        dimension = vectors.shape[1]

        VectorService.index = faiss.IndexFlatL2(
            dimension
        )

        VectorService.index.add(vectors)

        return VectorService.index