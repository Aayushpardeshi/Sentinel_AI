# Sentinel AI

Sentinel AI is a secure document intelligence platform. Teams upload documents, control who can see them, and ask questions against that knowledge instead of searching files by hand.

## Real-world problem

Organizations accumulate resumes, identification documents, reports, policies, and project files. As that collection grows, people spend time opening files, searching for the same facts, and answering the same questions. Access to sensitive documents is also hard to track.

## What Sentinel AI does

Users upload documents and work with them in a shared, permissioned workspace:

- Extract and organize document text automatically
- Ask questions in chat and get answers grounded in uploaded files
- Restrict access by personal workspace or team membership
- Record important activity such as logins, uploads, access, and team changes

**Core value:** Sentinel AI turns a collection of static documents into an organized, searchable, interactive knowledge workspace for individuals and teams.

Example questions:

- "What skills are mentioned in this resume?"
- "What does our leave policy say about maternity leave?"
- "Summarize the key points from this project document."

## Architecture

```text
React + TypeScript (localhost:5173)
          |
          | HTTP/REST + JWT
          v
Node.js + Express API (localhost:5000)
          |
          |-------------------------------|
          v                               v
PostgreSQL / SQLite                  Python AI service
users, teams, documents,             (localhost:8000, internal)
audit logs, JWT, RBAC                       |
                                     OCR-ready PDF extraction
                                     chunking, embeddings
                                     Qdrant, LangGraph, LiteLLM
```

The React app talks only to Node. Node owns authentication, authorization, document metadata, teams, and audit logs. Python owns embeddings, vector search, RAG, and LLM calls. Node calls Python over HTTP with `X-Internal-Service-Key`.

This split exists because the application layer is a standard MERN-style API, while document intelligence depends on the Python ML stack (PyPDF, sentence-transformers, Qdrant, LangGraph, LiteLLM).

## Project structure

- `/frontend` — React + TypeScript + Vite UI
- `/backend/node-server` — public Express API
- `/backend/python-ai-service` — internal FastAPI AI service
- `/docker-compose.yml` — Qdrant for local vector search

## API contract

The frontend still uses the original paths and `{ detail }` error shape:

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/register` | no |
| POST | `/login` | no |
| GET | `/me` | JWT |
| GET/POST | `/teams` | JWT |
| GET | `/teams/:teamId` | JWT |
| POST | `/teams/:teamId/members` | JWT, OWNER/ADMIN |
| DELETE | `/teams/:teamId/members/:userId` | JWT, OWNER/ADMIN |
| GET | `/documents` | JWT |
| GET/DELETE | `/documents/:documentId` | JWT |
| POST | `/upload` | JWT, multipart PDF |
| GET | `/search` | JWT |
| POST | `/chat` | JWT |
| GET | `/audit-logs` | JWT |
| GET | `/health` and `/api/health` | no |

JWT payload: `{ sub: "<user id>" }`, HS256, 60 minute expiry.

## Local setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- Docker (for Qdrant)

### 1. Qdrant

```bash
docker compose up -d qdrant
```

Qdrant listens on `http://localhost:6333`.

### 2. Python AI service

```bash
cd backend/python-ai-service
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

Set `INTERNAL_SERVICE_KEY` to the same value used by Node, and set `MISTRAL_API_KEY` (or the key required by `MODEL_NAME`).

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The Python process is an internal service. Do not point the React app at port 8000.

### 3. Node API

```bash
cd backend/node-server
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

Use the same `INTERNAL_SERVICE_KEY` as Python. Then:

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Node listens on `http://localhost:5000`.

SQLite is the default (`DATABASE_URL="file:./dev.db"`). For PostgreSQL, change the Prisma `provider` to `postgresql` and set `DATABASE_URL` to your Postgres URL, then run `npx prisma db push`. Do not run destructive reset commands against a database that already has data.

### 4. Frontend

```bash
cd frontend
copy .env.example .env   # optional; defaults to http://localhost:5000
npm install
npm run dev
```

UI: `http://localhost:5173`

### Startup order

1. Qdrant
2. Python AI service
3. Node API
4. Frontend

## Environment variables

### Node (`backend/node-server/.env`)

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PYTHON_AI_SERVICE_URL`
- `INTERNAL_SERVICE_KEY`
- `CORS_ORIGIN`

### Python (`backend/python-ai-service/.env`)

- `INTERNAL_SERVICE_KEY`
- `QDRANT_URL`
- `QDRANT_COLLECTION`
- `MODEL_NAME`
- `MISTRAL_API_KEY` (and other LLM keys as needed)

Never commit real `.env` files or expose these values to the frontend.

## Roles and document access

Team roles: `OWNER`, `ADMIN`, `MEMBER`.

- Personal documents: only the owner
- Team documents: any member of that team
- Team document delete: `OWNER` or `ADMIN` only

Node checks these rules before calling Python. Python still filters Qdrant results by `user_id` and `user_teams`.

## License

MIT. See [LICENSE](LICENSE).
