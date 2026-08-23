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

## Getting Started
Please refer to the individual `frontend/` and `backend/` directories for specific setup, environment variables, and local development instructions.
