from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.security.dependencies import get_current_user
from app.schemas.team import TeamCreate, TeamResponse, TeamMemberCreate, TeamMemberResponse
from app.services.team_service import TeamService
from app.services.audit_service import AuditLogService
from app.services.authorization_service import AuthorizationService

router = APIRouter()

@router.post("/teams", response_model=TeamResponse)
def create_team(request: TeamCreate, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    team = TeamService.create_team(db, request.name, current_user)
    AuditLogService.record(db, action="TEAM_CREATE", resource_type="TEAM", resource_id=str(team.id), team_id=team.id, status="SUCCESS", user_id=current_user)
    return team

@router.get("/teams", response_model=List[TeamResponse])
def get_teams(db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    return TeamService.get_teams(db, current_user)

@router.get("/teams/{team_id}", response_model=TeamResponse)
def get_team(team_id: int, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    try:
        team = TeamService.get_team(db, team_id, current_user)
        AuditLogService.record(db, action="TEAM_VIEW", resource_type="TEAM", resource_id=str(team_id), team_id=team_id, status="SUCCESS", user_id=current_user)
        return team
    except HTTPException:
        AuditLogService.record(db, action="ACCESS_DENIED", resource_type="TEAM", resource_id=str(team_id), team_id=team_id, status="DENIED", user_id=current_user)
        raise

@router.post("/teams/{team_id}/members", response_model=TeamMemberResponse)
def add_team_member(team_id: int, request: TeamMemberCreate, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    # Check if current_user has OWNER or ADMIN role
    if not AuthorizationService.has_team_role(db, current_user, team_id, ["OWNER", "ADMIN"]):
        AuditLogService.record(db, action="ACCESS_DENIED", resource_type="TEAM_MEMBER", resource_id=str(request.user_id), team_id=team_id, status="DENIED", user_id=current_user)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to manage members")

    member = TeamService.add_member(db, team_id, request.user_id, request.role)
    AuditLogService.record(db, action="TEAM_MEMBER_ADD", resource_type="TEAM", resource_id=str(request.user_id), team_id=team_id, status="SUCCESS", user_id=current_user)
    return member

@router.delete("/teams/{team_id}/members/{user_id}")
def remove_team_member(team_id: int, user_id: int, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    if not AuthorizationService.has_team_role(db, current_user, team_id, ["OWNER", "ADMIN"]):
        AuditLogService.record(db, action="ACCESS_DENIED", resource_type="TEAM_MEMBER", resource_id=str(user_id), team_id=team_id, status="DENIED", user_id=current_user)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to manage members")

    TeamService.remove_member(db, team_id, user_id)
    AuditLogService.record(db, action="TEAM_MEMBER_REMOVE", resource_type="TEAM", resource_id=str(user_id), team_id=team_id, status="SUCCESS", user_id=current_user)
    return {"message": "Member removed successfully"}
