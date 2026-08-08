from app.services.embedding_service import EmbeddingService
from app.services.qdrant_service import QdrantService


chunks = [
    "Python is a programming language.",
    "FastAPI is a Python web framework.",
    "Qdrant is a vector database."
]


# 1. Create embeddings
embeddings = EmbeddingService.create_embeddings(chunks)

print("Number of chunks:", len(chunks))
print("Embedding shape:", embeddings.shape)


# 2. Create Qdrant collection
QdrantService.initialize()


# 3. Store embeddings
QdrantService.store_embeddings(
    chunks,
    embeddings
)

# 4. Create embedding for user query
query = "What is FastAPI?"

query_embedding = EmbeddingService.create_embeddings(
    [query]
)[0]


# 5. Search Qdrant
results = QdrantService.search(
    query_embedding,
    limit=2
)


# 6. Display results
print("\nSearch Results:")

for result in results:
    print("Score:", result.score)
    print("Text:", result.payload["text"])
    print()

print("Embeddings stored successfully!")