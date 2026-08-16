from fastapi import APIRouter, Depends
from app.security.dependencies import get_current_user

router = APIRouter()


@router.get("/me")
def get_me(user_id: int = Depends(get_current_user)):
    return {
        "message": "Authenticated successfully",
        "user_id": user_id
    }