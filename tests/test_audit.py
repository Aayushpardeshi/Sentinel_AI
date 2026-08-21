import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.database import Base
from app.models.audit_log import AuditLog
from app.services.audit_service import AuditLogService

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

def test_audit_record(db):
    AuditLogService.record(
        db=db,
        action="LOGIN_SUCCESS",
        resource_type="AUTH",
        status="SUCCESS",
        user_id=1
    )
    
    log = db.query(AuditLog).first()
    assert log is not None
    assert log.action == "LOGIN_SUCCESS"
    assert log.resource_type == "AUTH"
    assert log.status == "SUCCESS"
    assert log.user_id == 1
    assert log.timestamp is not None
