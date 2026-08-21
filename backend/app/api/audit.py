from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.security.dependencies import get_current_user
from app.models.audit_log import AuditLog
from app.schemas.audit import AuditLogResponse
from app.models.team_member import TeamMember

router = APIRouter()

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    """
    Get audit logs.
    For now, return all logs related to the user (their actions or actions on their teams)
    or just all logs for simplicity of the demo frontend.
    We will return all logs ordered by timestamp descending.
    """
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return logs
