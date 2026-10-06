# KnowledgePilot RAG — Grounded Enterprise Knowledge Assistant

A full-stack **AI + MERN** retrieval-augmented generation application for indexing internal documents, retrieving semantically relevant context and answering questions with evidence.

## Highlights
- React/Vite knowledge workspace.
- Express + MongoDB application layer.
- FastAPI retrieval service using Sentence Transformers.
- Chunking with overlap + normalized vector embeddings + cosine retrieval.
- Source citations with relevance scores.
- Optional local LLM generation through Ollama.
- Docker Compose and GitHub Actions CI.

## Architecture
```text
React → Express API → MongoDB
             ↘ FastAPI RAG Service
                    ├─ Sentence Transformer embeddings
                    ├─ Vector retrieval
                    └─ Ollama (optional)
```

## Run
```bash
docker compose up --build
```
Open `http://localhost:4174`.

## Key API routes
- `POST /api/documents` — persist and index a document
- `GET /api/documents` — list indexed documents
- `POST /api/ask` — retrieve context and generate grounded answer
- AI `POST /ingest` — chunk and embed a document
- AI `POST /query` — semantic retrieval + grounded response

## Production extensions
Replace the in-memory vector layer with Qdrant, pgvector, Pinecone, Weaviate or MongoDB Atlas Vector Search; add document parsers, RBAC, evaluation datasets, reranking and observability.
