from sqlalchemy.orm import Session
from app.models.document import Document
from app.services.authorization_service import AuthorizationService

class DocumentService:
    @staticmethod
    def create_document(
        db: Session,
        id: str,
        filename: str,
        owner_user_id: int,
        scope: str,
        team_id: int = None
    ) -> Document:
        doc = Document(
            id=id,
            filename=filename,
            owner_user_id=owner_user_id,
            scope=scope.upper(),
            team_id=team_id
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

    @staticmethod
    def get_documents_for_user(db: Session, user_id: int):
        user_teams = AuthorizationService.get_user_teams(db, user_id)
        
        # Get personal docs + team docs
        docs = db.query(Document).filter(
            (Document.owner_user_id == user_id) | (Document.team_id.in_(user_teams))
        ).all()
        
        return [doc for doc in docs if doc.scope == 'PERSONAL' and doc.owner_user_id == user_id or doc.scope == 'TEAM' and doc.team_id in user_teams]

    @staticmethod
    def delete_document(db: Session, document_id: str):
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            db.delete(doc)
            db.commit()
