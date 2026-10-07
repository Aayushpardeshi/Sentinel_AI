# Sentinel AI - Complete Project Documentation

## Overview

Sentinel AI is a **secure, enterprise-grade document intelligence platform** that enables teams to upload, organize, and interact with documents through AI-powered chat and search capabilities. The platform combines role-based access control (RBAC), audit logging, and sophisticated document retrieval with LLM-based question answering.

### Core Features
- **Document Management**: Upload and organize PDFs with personal or team-based access controls
- **AI-Powered Chat**: Ask questions about documents with context-aware responses grounded in uploaded content
- **Full-Text Search**: Semantic search across document collections using embeddings
- **Team Collaboration**: Create teams, manage roles (OWNER, ADMIN, MEMBER), and control document sharing
- **Audit Logging**: Complete tracking of all user actions including logins, uploads, access, and deletions
- **Role-Based Access Control**: Fine-grained permissions for document and team management

## Architecture

```
React + TypeScript (Frontend)
         ↓ HTTP/REST + JWT
         ↓
Node.js + Express API (Port 5000)
         ├─ Authentication & Authorization (JWT)
         ├─ Document Metadata & RBAC (Prisma + SQLite/PostgreSQL)
         ├─ Audit Logging
         └─ Internal calls to Python AI Service
              ↓
Python FastAPI Service (Port 8000, Internal Only)
         ├─ PDF Text Extraction (PyPDF)
         ├─ Text Chunking (LangChain)
         ├─ Embeddings Generation (Sentence Transformers)
         ├─ Vector Search (Qdrant)
         ├─ LLM Integration (LiteLLM - Mistral, Gemini, etc.)
         └─ RAG Graph (LangGraph)
              ↓
Qdrant Vector Database (Port 6333)
    └─ Document embeddings with metadata filtering
```

### Design Principles
1. **Separation of Concerns**: Frontend only talks to Node; Python service is internal-only
2. **Security**: Internal service authentication via `X-Internal-Service-Key` header
3. **Authorization**: Node validates access rules before calling Python; Python filters results by user/team
4. **Scalability**: Vector search with Qdrant; optional PostgreSQL for production deployments

## Project Structure

```
Sentinel_AI/
├── frontend/                  # React + TypeScript + Vite UI
│   ├── src/
│   │   ├── components/       # UI components (layout, auth, forms)
│   │   ├── pages/            # Page components (Dashboard, Chat, Teams, etc.)
│   │   ├── context/          # Auth context and state management
│   │   ├── lib/              # Utilities and API client
│   │   └── App.tsx           # Main routing and layout
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── node-server/          # Express API
│   │   ├── src/
│   │   │   ├── app.js        # Express app setup
│   │   │   ├── server.js     # Server entry point
│   │   │   ├── controllers/  # Route handlers
│   │   │   ├── services/     # Business logic
│   │   │   ├── routes/       # API route definitions
│   │   │   ├── middleware/   # Auth, validation, error handling
│   │   │   ├── config/       # Configuration (db, env)
│   │   │   └── utils/        # Utilities (logger, password, errors)
│   │   ├── prisma/schema.prisma  # Database schema
│   │   └── package.json
│   │
│   └── python-ai-service/    # FastAPI AI Service
│       ├── app/
│       │   ├── main.py       # FastAPI app entry point
│       │   ├── api/internal.py    # Internal API routes
│       │   ├── rag/graph.py       # RAG workflow (retrieve + generate)
│       │   ├── services/     # PDF, embeddings, retrieval, LLM
│       │   ├── core/         # Config, logger
│       │   └── security/     # API key verification
│       └── requirements.txt
│
├── docker-compose.yml        # Qdrant vector DB
├── .env                       # Root environment variables
└── README.md                 # This file
```

## API Contract

All endpoints use JWT for authentication (Bearer token in `Authorization` header) and return `{ detail: "..." }` on error.

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login and get JWT token |
| GET | `/me` | JWT | Get current user info |

### Teams
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/teams` | JWT | Create team (user becomes OWNER) |
| GET | `/teams` | JWT | List user's teams |
| GET | `/teams/:teamId` | JWT | Get team details |
| POST | `/teams/:teamId/members` | JWT + OWNER/ADMIN | Add team member |
| DELETE | `/teams/:teamId/members/:userId` | JWT + OWNER/ADMIN | Remove team member |

### Documents
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload` | JWT + Multipart | Upload PDF (PERSONAL or TEAM scope) |
| GET | `/documents` | JWT | List accessible documents |
| GET | `/documents/:documentId` | JWT | Get document metadata |
| DELETE | `/documents/:documentId` | JWT + DELETE_PERM | Delete document |

### AI & Search
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/chat` | JWT | Chat with AI about documents |
| GET | `/search` | JWT | Semantic search across documents |

### Audit & Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/audit-logs` | JWT | List audit logs (system-wide) |
| GET | `/health` | No | Health check (includes AI service) |
| GET | `/api/health` | No | Alternative health endpoint |

## Local Development Setup

### Prerequisites
- **Node.js 18+**
- **Python 3.9+**
- **Docker** (for Qdrant)
- **Git**

### Step 1: Environment Setup

Clone or navigate to the project:
```bash
cd Sentinel_AI
```

Create/update root `.env`:
```bash
GOOGLE_API_KEY=your_key
MISTRAL_API_KEY=your_key
MODEL_NAME=mistral/mistral-small-latest
GROQ_API_KEY=your_key
HUGGINGFACEHUB_API_TOKEN=your_token
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=sentinel_documents
DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/sentinel_ai
```

### Step 2: Start Qdrant (Vector Database)

```bash
docker compose up -d qdrant
```

Verify at: http://localhost:6333/dashboard

### Step 3: Python AI Service

```bash
cd backend/python-ai-service

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Copy environment file
cp .env.example .env
# Edit .env with API keys:
# INTERNAL_SERVICE_KEY=your-secret-key
# MISTRAL_API_KEY=your_key

# Install dependencies
pip install -r requirements.txt

# Start service
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The service runs on http://127.0.0.1:8000. Do NOT expose to frontend.

### Step 4: Node API Server

```bash
cd backend/node-server

# Copy environment file
cp .env.example .env
# Edit .env:
# JWT_SECRET=your-long-random-secret
# INTERNAL_SERVICE_KEY=same-as-python-service
# PYTHON_AI_SERVICE_URL=http://127.0.0.1:8000
# CORS_ORIGIN=http://localhost:5173

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create database
npx prisma db push

# Start server
npm run dev
```

The API runs on http://localhost:5000

### Step 5: Frontend UI

```bash
cd frontend

# Copy environment file
cp .env.example .env
# Edit .env if needed:
# VITE_API_BASE_URL=http://localhost:5000

# Install dependencies
npm install

# Start dev server
npm run dev
```

The UI runs on http://localhost:5173

### Startup Checklist
- ✅ Qdrant running: http://localhost:6333
- ✅ Python AI service running: http://localhost:8000
- ✅ Node API running: http://localhost:5000
- ✅ Frontend available: http://localhost:5173

## Database Schema

### Core Tables (Prisma)

**Users**
- `id` (int, PK)
- `email` (string, unique)
- `password_hash` (string)

**Teams**
- `id` (int, PK)
- `name` (string)
- `created_by` (int, FK to User)
- `created_at` (datetime)

**TeamMembers**
- `id` (int, PK)
- `team_id` (int, FK)
- `user_id` (int, FK)
- `role` (string: OWNER, ADMIN, MEMBER)
- `joined_at` (datetime)
- **Unique constraint**: (team_id, user_id)

**Documents**
- `id` (string, UUID)
- `filename` (string)
- `owner_user_id` (int, FK to User)
- `scope` (string: PERSONAL, TEAM)
- `team_id` (int, FK, nullable)
- `uploaded_at` (datetime)
- `status` (string: PROCESSING, COMPLETED, FAILED)

**AuditLogs**
- `id` (int, PK)
- `user_id` (int, FK, nullable)
- `action` (string: LOGIN_SUCCESS, DOCUMENT_UPLOAD, etc.)
- `resource_type` (string: AUTH, DOCUMENT, TEAM, etc.)
- `resource_id` (string, nullable)
- `team_id` (int, nullable)
- `status` (string: SUCCESS, FAILED, DENIED)
- `timestamp` (datetime)
- `metadata_info` (JSON)

### Vector Store (Qdrant)

**Collection**: `sentinel_documents`

**Point Payload**:
```json
{
  "document_id": "uuid",
  "chunk_id": "uuid",
  "filename": "string",
  "chunk_index": 0,
  "uploaded_at": "iso-datetime",
  "text": "chunk text",
  "scope": "PERSONAL|TEAM",
  "owner_user_id": 123,
  "team_id": 456
}
```

**Vector**: 384-dimensional embeddings (all-MiniLM-L6-v2)

## Authorization Model

### Access Rules

**Personal Documents** (`scope="PERSONAL"`):
- Owner can view and delete
- Others cannot access

**Team Documents** (`scope="TEAM"`):
- Any team member can view and query
- Only OWNER and ADMIN can delete

**Search & Chat**:
- Results filtered by user's personal documents + team documents
- Qdrant payload filtering ensures no unauthorized access

### Role Hierarchy
- **OWNER**: Full control (create team, manage members, delete documents)
- **ADMIN**: Manage members, delete team documents
- **MEMBER**: View and query documents, cannot delete

## Key Workflows

### 1. User Registration & Login
```
User inputs email/password
  ↓
POST /register (hash password with bcrypt)
  → User created, audit log recorded
  ↓
POST /login (verify password)
  → JWT token returned (HS256, 60 min expiry)
  ↓
Token stored in browser localStorage
  ↓
All subsequent requests include: Authorization: Bearer {token}
```

### 2. Document Upload & Processing
```
User selects PDF file
  ↓
POST /upload (multipart, JWT required)
  → Node validates auth & scope
  → Document record created with status=PROCESSING
  → File sent to Python service
  ↓
Python service:
  → Extract text (PyPDF)
  → Split into chunks (LangChain - 500 char, 50 overlap)
  → Generate embeddings (Sentence Transformers)
  → Store in Qdrant with metadata
  ↓
Node updates status=COMPLETED
  → Audit log: DOCUMENT_UPLOAD
  ↓
Frontend displays success with chunk count
```

### 3. Document Query (Search + Chat)
```
User asks: "What skills are in this resume?"
  ↓
POST /chat (JWT, document_id, prompt)
  → Node validates document access
  ↓
Node calls Python: /internal/chat
  → X-Internal-Service-Key header
  ↓
Python LangGraph workflow:
  1. Retrieve node: Embed query, search Qdrant
     - Filter by document_id (if specified)
     - Filter by user_id + user_teams (auth)
     - Return top 3 chunks
  2. Generate node: Build context from chunks
     - Pass to LLM (Mistral/Gemini/etc. via LiteLLM)
     - Return grounded answer
  ↓
Return response + sources to frontend
  → Audit log: DOCUMENT_QUERY
```

### 4. Team Collaboration
```
User A creates team "Engineering"
  → User A is OWNER
  → Audit log: TEAM_CREATE
  ↓
User A adds User B as MEMBER
  → Audit log: TEAM_MEMBER_ADD
  ↓
User A uploads document with scope=TEAM
  → Document visible to all team members
  ↓
User B can view, search, and chat on team documents
  (but cannot delete without ADMIN/OWNER role)
```

## Development Tasks

### Running Tests
```bash
cd backend/node-server
npm test
# Tests: authorization rules (personal, team, delete permissions)
```

### Building for Production

**Frontend**:
```bash
cd frontend
npm run build
# Output: dist/
```

**Backend**: Use `npm run start` and `uvicorn app.main:app` (no --reload)

### Database Management

**Inspect schema**:
```bash
cd backend/node-server
npx prisma studio  # Opens Prisma Studio at http://localhost:5555
```

**Push schema changes**:
```bash
npx prisma db push
```

**Reset database** (⚠️ destructive):
```bash
npx prisma db reset  # Only in dev!
```

### Environment Variables Reference

**Root `.env`** (shared keys):
- `GOOGLE_API_KEY`, `MISTRAL_API_KEY`, `GROQ_API_KEY`, etc. (LLM keys)
- `QDRANT_URL`, `QDRANT_COLLECTION`
- `DATABASE_URL` (optional, for reference)

**Node `.env`**:
- `PORT=5000`
- `DATABASE_URL=file:./dev.db` or PostgreSQL connection
- `JWT_SECRET` (min 32 chars)
- `JWT_EXPIRES_IN=60m`
- `PYTHON_AI_SERVICE_URL=http://127.0.0.1:8000`
- `INTERNAL_SERVICE_KEY` (min 32 chars, shared with Python)
- `CORS_ORIGIN=http://localhost:5173`
- `UPLOAD_DIR=uploads`
- `MAX_UPLOAD_BYTES=26214400` (25 MB)

**Python `.env`**:
- `INTERNAL_SERVICE_KEY` (must match Node)
- `QDRANT_URL=http://localhost:6333`
- `QDRANT_COLLECTION=sentinel_documents`
- `MODEL_NAME=mistral/mistral-small-latest` (or other LiteLLM model)
- `MISTRAL_API_KEY` (and other provider keys as needed)
- `SIMILARITY_THRESHOLD=0.0`

**Frontend `.env`** (optional):
- `VITE_API_BASE_URL=http://localhost:5000`

## Troubleshooting

### Frontend Won't Start
- Ensure `npm install` completed
- Check tsconfig.json has `"jsx": "react-jsx"`
- Clear `node_modules` and reinstall: `rm -r node_modules && npm install`

### Backend Connection Issues
- Verify Python service is running on port 8000
- Check `PYTHON_AI_SERVICE_URL` is correct
- Verify `INTERNAL_SERVICE_KEY` matches in both Node and Python .env files
- Check Qdrant is running: `http://localhost:6333`

### PDF Upload Failures
- Verify file is valid PDF (not corrupted)
- Check file size < 25 MB (configurable)
- Ensure Qdrant is running and accessible
- Check Python service logs for embedding errors

### AI Service Errors
- Verify LLM API keys are set and valid
- Check model name matches provider (e.g., `mistral/mistral-small-latest` for Mistral)
- Ensure Qdrant collection is created: check at http://localhost:6333/dashboard

### JWT Token Expired
- Frontend should redirect to login
- Clear localStorage and re-authenticate
- Token expiry is 60 minutes (configurable in Node .env)

## Security Considerations

1. **Authentication**: JWT (HS256) with 60-minute expiry
2. **Authorization**: Node validates all access rules; Python filters results
3. **Internal Service Key**: Shared secret for Node ↔ Python communication
4. **Password Hashing**: bcryptjs (12 rounds salt)
5. **CORS**: Restricted to frontend origin
6. **Audit Logging**: All sensitive actions logged with user, timestamp, status
7. **File Upload**: Only PDFs allowed; size limit enforced
8. **Data Filtering**: Qdrant payload filtering prevents cross-team/user data leakage

### Production Checklist
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS/TLS
- [ ] Use strong, random JWT_SECRET and INTERNAL_SERVICE_KEY (min 32 chars)
- [ ] Set NODE_ENV=production
- [ ] Enable audit log retention policy
- [ ] Regular backups of database and Qdrant
- [ ] Monitor API response times and error rates
- [ ] Implement rate limiting
- [ ] Use environment-specific configurations

## Performance Optimization

- **Vector Search**: Qdrant indexes vectors for O(log n) retrieval
- **Chunk Size**: 500 characters with 50-char overlap balances accuracy and latency
- **Similarity Threshold**: Default 0.0 (no filtering); adjust per use case
- **Database Indexes**: Prisma auto-indexes FK and unique fields
- **Caching**: Consider Redis for frequently accessed documents (future enhancement)

## Known Limitations & Future Work

1. **Multi-language Support**: Currently English-only (PyPDF limitation)
2. **OCR**: No OCR for scanned PDFs (only digital text extraction)
3. **Document Versioning**: No version history or diff tracking
4. **Real-time Collaboration**: No live editing or simultaneous access tracking
5. **API Rate Limiting**: Not yet implemented
6. **Batch Operations**: Upload/delete multiple documents at once
7. **Custom LLM Fine-tuning**: Uses pre-trained models only
8. **Analytics Dashboard**: Limited usage insights

## Contributing & Development

### Code Style
- **Node**: Standard Express patterns, async/await
- **Python**: PEP 8, type hints recommended
- **Frontend**: React hooks, functional components, Tailwind CSS

### Testing
- Node: Run `npm test` in `backend/node-server`
- Python: Add tests in `app/__tests__/` (pytest)
- Frontend: Use Vitest (can be added)

### Commit Conventions
- `feat: ...` - New feature
- `fix: ...` - Bug fix
- `docs: ...` - Documentation
- `test: ...` - Tests
- `refactor: ...` - Code refactoring

## Support & Resources

- **Documentation**: See API contract above
- **Schema Inspection**: `npx prisma studio`
- **Qdrant Dashboard**: http://localhost:6333/dashboard
- **LiteLLM Docs**: https://docs.litellm.ai/
- **LangGraph Docs**: https://langchain-ai.github.io/langgraph/
- **Prisma Docs**: https://www.prisma.io/docs/

## License

MIT. See LICENSE file.

---

**Built with**: React, Node.js, Python, FastAPI, Prisma, Qdrant, LangGraph, LiteLLM, Tailwind CSS

**Last Updated**: October 7, 2026
