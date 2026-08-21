from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class TeamBase(BaseModel):
    name: str

class TeamCreate(TeamBase):
    pass

class TeamResponse(TeamBase):
    id: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True

class TeamMemberBase(BaseModel):
    user_id: int
    role: str

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMemberResponse(TeamMemberBase):
    id: int
    team_id: int
    joined_at: datetime

    class Config:
        from_attributes = True
