import faiss
import numpy as np


class VectorStore:

    index = None
    chunks = []

    @staticmethod
    def create_store(embeddings, text_chunks):

        vectors = np.array(embeddings).astype("float32")

        dimension = vectors.shape[1]

        VectorStore.index = faiss.IndexFlatL2(dimension)

        VectorStore.index.add(vectors)

        VectorStore.chunks = text_chunks

        return VectorStore.index