
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, DateTime, Date, ForeignKey, Enum as SqEnum
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from .models import GameMode

Base = declarative_base()

class UserDB(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    scores = relationship("ScoreDB", back_populates="user")

class ScoreDB(Base):
    __tablename__ = "scores"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)
    mode = Column(SqEnum(GameMode), nullable=False)
    date = Column(Date, default=date.today)

    user = relationship("UserDB", back_populates="scores")
