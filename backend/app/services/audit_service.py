from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

class AuditLogService:
    @staticmethod
    def record(
        db: Session,
        action: str,
        resource_type: str,
        status: str,
        user_id: int = None,
        resource_id: str = None,
        team_id: int = None,
        metadata_info: dict = None
    ):
        try:
            audit_log = AuditLog(
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                team_id=team_id,
                status=status,
                metadata_info=metadata_info
            )
            db.add(audit_log)
            db.commit()
        except Exception as e:
            # We don't want audit failure to break the main application flow
            print(f"Failed to record audit log: {e}")
            db.rollback()
