from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func

from app.database.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    action = Column(String, nullable=False, index=True)
    resource_type = Column(String, nullable=False, index=True)
    resource_id = Column(String, nullable=True)
    team_id = Column(Integer, nullable=True)
    status = Column(String, nullable=False) # SUCCESS, DENIED, FAILED
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    metadata_info = Column(JSON, nullable=True)
