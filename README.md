# Sentinel AI

Welcome to the Sentinel AI repository!

## Overview
Sentinel AI is an advanced, full-stack application designed to streamline document management, enhance team collaboration, and leverage AI-powered data extraction. With a robust Python backend and a modern React frontend, Sentinel provides a secure and efficient workspace for handling data-sensitive workflows.

## Key Features
- **AI-Powered OCR Extraction**: Automated data extraction from documents (e.g., Aadhaar cards) using advanced OCR pipelines.
- **Team Collaboration**: Create teams, manage members, and collaborate on shared resources securely.
- **Intelligent Chat Interface**: Interact with your documents using an AI chatbot that supports rich markdown formatting.
- **Secure Document Management**: Upload, verify, and retrieve documents seamlessly.
- **Audit Logging**: Comprehensive backend tracking of user actions and document access for compliance.

## Application Flow (How it Works)
1. **Authentication**: Users securely log in to the platform.
2. **Team Setup**: Users can establish teams and invite members for collaborative document access.
3. **Document Upload & Processing**: Users upload documents. The backend immediately processes these using the OCR Extraction Service to verify and pull out critical metadata automatically.
4. **AI Interaction & Retrieval**: Users can leverage the chat interface to query their uploaded documents, retrieve specific information, or get intelligent summaries.
5. **Activity Tracking**: Every upload, extraction, and data access event is recorded in the audit logs for security purposes.

## Project Structure
- `/frontend`: The frontend React application built with Vite, TypeScript, and modern styling.
- `/backend`: The backend Python API, managing services like OCR, retrieval, audit logs, and document handling.

## Getting Started & How to Run Locally

### Prerequisites
- **Python 3.9+**
- **Node.js 18+** & npm

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server (FastAPI):
   ```bash
   uvicorn app.main:app --reload
   ```
5. in future may need to start the docker container and will be deploying it on render or aws ec2 

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the node dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

### 3. Access the Application
- The **frontend UI** will be available at `http://localhost:5173` (default Vite port).
- The **backend API** will be running at `http://localhost:8000`. 
- Access the API documentation (Swagger) at `http://localhost:8000/docs`.

*Note: Ensure you have correctly configured the `.env` files in both the `frontend/` and `backend/` directories based on the `.env.example`
