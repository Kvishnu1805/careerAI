from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    target_role = Column(String(255), nullable=True, default="Software Engineer")
    created_at = Column(DateTime, default=datetime.now)

    # Relationships with CASCADE deletion
    skills = relationship("Skill", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name = Column(String(100), nullable=False)

    user = relationship("User", back_populates="skills")
