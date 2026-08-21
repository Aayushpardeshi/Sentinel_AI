from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest
from app.security.password import verify_password
from app.security.jwt import create_access_token
from app.services.audit_service import AuditLogService

router = APIRouter()

@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == request.email
    ).first()

    if not user:
        AuditLogService.record(db, action="LOGIN_FAILED", resource_type="AUTH", status="FAILED", metadata_info={"email": request.email})
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        request.password,
        user.password_hash
    ):
        AuditLogService.record(db, action="LOGIN_FAILED", resource_type="AUTH", status="FAILED", metadata_info={"email": request.email})
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {"sub": str(user.id)}
    )
    
    AuditLogService.record(db, action="LOGIN_SUCCESS", resource_type="AUTH", status="SUCCESS", user_id=user.id)

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer"
    }