from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.security.dependencies import get_current_user
from app.schemas.document import DocumentResponse
from app.services.document_service import DocumentService
from app.services.authorization_service import AuthorizationService
from app.services.audit_service import AuditLogService
from app.models.document import Document

router = APIRouter()

@router.get("/documents", response_model=List[DocumentResponse])
def get_documents(db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    return DocumentService.get_documents_for_user(db, current_user)

@router.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    if not AuthorizationService.can_access_document(db, current_user, document_id):
        doc = db.query(Document).filter(Document.id == document_id).first()
        team_id = doc.team_id if doc else None
        AuditLogService.record(db, action="ACCESS_DENIED", resource_type="DOCUMENT", resource_id=document_id, team_id=team_id, status="DENIED", user_id=current_user)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
    doc = db.query(Document).filter(Document.id == document_id).first()
    AuditLogService.record(db, action="DOCUMENT_VIEW", resource_type="DOCUMENT", resource_id=document_id, team_id=doc.team_id, status="SUCCESS", user_id=current_user)
    return doc

@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: str, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    if not AuthorizationService.can_access_document(db, current_user, document_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
    doc = db.query(Document).filter(Document.id == document_id).first()
    team_id = doc.team_id if doc else None
    
    # Delete from DB
    DocumentService.delete_document(db, document_id)
    
    # Delete from Vector DB
    from app.services.qdrant_service import QdrantService
    QdrantService.delete_document(document_id)
    
    # Audit log
    AuditLogService.record(db, action="DOCUMENT_DELETE", resource_type="DOCUMENT", resource_id=document_id, team_id=team_id, status="SUCCESS", user_id=current_user)
    
    return None
