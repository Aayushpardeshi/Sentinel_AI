from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.security.password import hash_password
from app.services.audit_service import AuditLogService

router = APIRouter()

@router.post("/register")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    hashed_password = hash_password(request.password)

    user = User(
        email=request.email,
        password_hash=hashed_password
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    
    AuditLogService.record(db, action="REGISTER_SUCCESS", resource_type="AUTH", status="SUCCESS", user_id=user.id)

    return {
        "message": "User registered successfully",
        "user_id": user.id
    }