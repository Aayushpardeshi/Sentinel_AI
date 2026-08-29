from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any, Dict

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    resource_type: str
    resource_id: Optional[str]
    team_id: Optional[int]
    status: str
    timestamp: datetime
    metadata_info: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True
