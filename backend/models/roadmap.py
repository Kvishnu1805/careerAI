from datetime import datetime
from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(255), nullable=False)
    # Stored week-by-week structure: { weeks: [ { week: int, topic: str, subtopics: [str] } ] }
    roadmap = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="roadmaps")
