# Sentinel AI - Quick Start Guide

Get the full Sentinel AI platform running in 5 minutes.

## Prerequisites
- Node.js 18+
- Python 3.9+
- Docker
- 3 terminal windows

## One-Command Setup

### Terminal 1: Qdrant Vector Database
```bash
docker compose up -d qdrant
```
✅ Ready at: http://localhost:6333

### Terminal 2: Python AI Service
```bash
cd backend/python-ai-service
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
✅ Ready at: http://127.0.0.1:8000

### Terminal 3: Node API
```bash
cd backend/node-server
npm install
npx prisma db push
npm run dev
```
✅ Ready at: http://localhost:5000

### Terminal 4: React Frontend
```bash
cd frontend
npm install
npm run dev
```
✅ Open: http://localhost:5173

---

## Test the Platform (2 minutes)

### 1. Register & Login
1. Click **Register**
2. Enter any email and password
3. Click **Login**
4. You're authenticated! ✅

### 2. Upload a Document
1. Go to **Documents**
2. Click **Upload Document**
3. Select any PDF file
4. Choose scope: **Personal** or **Team**
5. Upload and wait for processing ✅

### 3. Ask Questions
1. Go to **Chat**
2. Select the document
3. Type: "What's in this document?"
4. Get AI-powered answer ✅

### 4. Create a Team
1. Go to **Teams**
2. Click **Create Team**
3. Enter team name
4. Team created! ✅

### 5. Check Audit Logs
1. Go to **Audit**
2. See all your actions logged ✅

---

## Key URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | User interface |
| Node API | http://localhost:5000 | REST API |
| Python AI | http://127.0.0.1:8000 | AI service (internal) |
| Qdrant | http://localhost:6333 | Vector database |

---

## Common Commands

```bash
# Run tests
cd backend/node-server && npm test

# Build frontend
cd frontend && npm run build

# Inspect database
cd backend/node-server && npx prisma studio

# View Qdrant collections
# Visit: http://localhost:6333/dashboard

# Stop all services
docker compose down  # Stop Qdrant
# Kill terminal processes for Node, Python, Frontend
```

---

## Troubleshooting

### "Port already in use"
```bash
# Kill process on port
# Windows: netstat -ano | findstr :5000
# macOS/Linux: lsof -i :5000
```

### "Database connection failed"
```bash
# Recreate database
cd backend/node-server
npx prisma db push --skip-generate
```

### "Can't find module"
```bash
# Reinstall dependencies
cd [directory]
rm -rf node_modules package-lock.json
npm install
```

### "API service unavailable"
1. Check Python service is running on port 8000
2. Check Qdrant is running: `docker compose ps`
3. Verify env variables: `PYTHON_AI_SERVICE_URL`, `INTERNAL_SERVICE_KEY`

---

## Full Documentation

For detailed setup, architecture, and API documentation, see:
- **Comprehensive Guide**: `COMPLETE_README.md`
- **Project Report**: `PROJECT_COMPLETION_REPORT.md`

---

## What You Can Do Now

✅ Register and login  
✅ Upload PDF documents  
✅ Ask AI questions about documents  
✅ Create teams and collaborate  
✅ Search documents semantically  
✅ View complete audit logs  
✅ Manage team members and permissions  

---

**Built with**: React • Node.js • Python • FastAPI • Prisma • Qdrant

**Questions?** Check the comprehensive README files or review the API contract.

Happy coding! 🚀
