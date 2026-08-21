import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from app.database.database import Base
from app.models.user import User
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.document import Document
from app.services.authorization_service import AuthorizationService

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture()
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

def test_personal_document_access(db):
    user1 = User(id=1, email="user1@example.com", password_hash="hash")
    user2 = User(id=2, email="user2@example.com", password_hash="hash")
    db.add(user1)
    db.add(user2)
    
    doc1 = Document(id="doc1", filename="doc1.pdf", owner_user_id=1, scope="PERSONAL")
    db.add(doc1)
    db.commit()
    
    assert AuthorizationService.can_access_document(db, 1, "doc1") == True
    assert AuthorizationService.can_access_document(db, 2, "doc1") == False

def test_team_document_access(db):
    user1 = User(id=1, email="user1@example.com", password_hash="hash")
    user2 = User(id=2, email="user2@example.com", password_hash="hash")
    user3 = User(id=3, email="user3@example.com", password_hash="hash")
    db.add_all([user1, user2, user3])
    
    team = Team(id=1, name="Eng", created_by=1)
    db.add(team)
    
    m1 = TeamMember(team_id=1, user_id=1, role="OWNER")
    m2 = TeamMember(team_id=1, user_id=2, role="MEMBER")
    db.add_all([m1, m2])
    
    doc_team = Document(id="doc_team", filename="team.pdf", owner_user_id=1, scope="TEAM", team_id=1)
    db.add(doc_team)
    db.commit()
    
    assert AuthorizationService.can_access_document(db, 1, "doc_team") == True
    assert AuthorizationService.can_access_document(db, 2, "doc_team") == True
    assert AuthorizationService.can_access_document(db, 3, "doc_team") == False

def test_team_document_deletion(db):
    user1 = User(id=1, email="user1@example.com", password_hash="hash") # OWNER
    user2 = User(id=2, email="user2@example.com", password_hash="hash") # MEMBER
    db.add_all([user1, user2])
    
    team = Team(id=1, name="Eng", created_by=1)
    db.add(team)
    
    m1 = TeamMember(team_id=1, user_id=1, role="OWNER")
    m2 = TeamMember(team_id=1, user_id=2, role="MEMBER")
    db.add_all([m1, m2])
    
    doc_team = Document(id="doc_team", filename="team.pdf", owner_user_id=1, scope="TEAM", team_id=1)
    db.add(doc_team)
    db.commit()

    assert AuthorizationService.can_delete_document(db, 1, "doc_team") == True
    assert AuthorizationService.can_delete_document(db, 2, "doc_team") == False
