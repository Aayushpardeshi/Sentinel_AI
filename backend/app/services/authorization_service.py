from sqlalchemy.orm import Session
from app.models.team_member import TeamMember
from app.models.document import Document

class AuthorizationService:
    @staticmethod
    def is_team_member(db: Session, user_id: int, team_id: int) -> bool:
        return db.query(TeamMember).filter(
            TeamMember.user_id == user_id,
            TeamMember.team_id == team_id
        ).first() is not None

    @staticmethod
    def has_team_role(db: Session, user_id: int, team_id: int, roles: list[str]) -> bool:
        membership = db.query(TeamMember).filter(
            TeamMember.user_id == user_id,
            TeamMember.team_id == team_id
        ).first()
        if not membership:
            return False
        return membership.role in roles

    @staticmethod
    def get_user_teams(db: Session, user_id: int) -> list[int]:
        memberships = db.query(TeamMember).filter(TeamMember.user_id == user_id).all()
        return [m.team_id for m in memberships]

    @staticmethod
    def can_access_document(db: Session, user_id: int, document_id: str) -> bool:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            return False
        if document.scope == 'PERSONAL':
            return document.owner_user_id == user_id
        elif document.scope == 'TEAM':
            return AuthorizationService.is_team_member(db, user_id, document.team_id)
        return False

    @staticmethod
    def can_delete_document(db: Session, user_id: int, document_id: str) -> bool:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            return False
        if document.scope == 'PERSONAL':
            return document.owner_user_id == user_id
        elif document.scope == 'TEAM':
            return AuthorizationService.has_team_role(db, user_id, document.team_id, ['OWNER', 'ADMIN'])
        return False
