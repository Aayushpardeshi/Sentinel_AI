from sqlalchemy.orm import Session
from app.models.team import Team
from app.models.team_member import TeamMember
from fastapi import HTTPException, status

class TeamService:
    @staticmethod
    def create_team(db: Session, name: str, current_user_id: int) -> Team:
        team = Team(name=name, created_by=current_user_id)
        db.add(team)
        db.commit()
        db.refresh(team)
        
        # Add creator as OWNER
        member = TeamMember(team_id=team.id, user_id=current_user_id, role="OWNER")
        db.add(member)
        db.commit()
        
        return team

    @staticmethod
    def get_teams(db: Session, current_user_id: int):
        memberships = db.query(TeamMember).filter(TeamMember.user_id == current_user_id).all()
        team_ids = [m.team_id for m in memberships]
        return db.query(Team).filter(Team.id.in_(team_ids)).all()

    @staticmethod
    def get_team(db: Session, team_id: int, current_user_id: int) -> Team:
        membership = db.query(TeamMember).filter(TeamMember.team_id == team_id, TeamMember.user_id == current_user_id).first()
        if not membership:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        return db.query(Team).filter(Team.id == team_id).first()

    @staticmethod
    def add_member(db: Session, team_id: int, user_id: int, role: str):
        existing = db.query(TeamMember).filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="User is already a member")
        member = TeamMember(team_id=team_id, user_id=user_id, role=role)
        db.add(member)
        db.commit()
        db.refresh(member)
        return member

    @staticmethod
    def remove_member(db: Session, team_id: int, user_id: int):
        member = db.query(TeamMember).filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        db.delete(member)
        db.commit()
