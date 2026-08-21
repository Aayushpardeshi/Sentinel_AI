from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DocumentResponse(BaseModel):
    id: str
    filename: str
    owner_user_id: int
    scope: str
    team_id: Optional[int]
    uploaded_at: datetime
    status: str

    class Config:
        from_attributes = True
