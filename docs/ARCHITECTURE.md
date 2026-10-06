# RAG Architecture

The AI service keeps vector retrieval independent of application state. The demo uses an in-memory vector index for clarity; a production deployment would swap this for Qdrant, pgvector, Pinecone, Weaviate or MongoDB Atlas Vector Search.

The LLM is intentionally optional. This lets the project demonstrate that **retrieval quality is a separate system concern from generation**.
