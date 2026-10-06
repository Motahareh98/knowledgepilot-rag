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


## Run locally without Docker (Windows)

You only need **Python 3.11+** and **Node.js 20+**. MongoDB is optional: if `MONGO_URI` is not configured, the app automatically switches to an in-memory demo store.

The easiest option is:

```bat
start-local.bat
```

The script will:
1. create a Python virtual environment for the AI service,
2. install Python dependencies,
3. start FastAPI on port 8000,
4. install/build the React client,
5. install/start the Node/Express app,
6. open http://localhost:5000.

> First launch can take longer because the AI model is downloaded once.

## Deploy online

A `render.yaml` Blueprint is included for Render. It defines:
- one Python AI web service,
- one Node/Express public web service that also serves the built React frontend,
- private service-to-service AI networking,
- no mandatory database dependency.

MongoDB remains optional. Set `MONGO_URI` later if persistent storage is required.

### Render account note
Render may require billing information before creating new web services, even when the service configuration uses the free plan. Once the account is allowed to create web services, the repository is deployment-ready.
