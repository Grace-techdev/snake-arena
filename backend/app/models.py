from enum import Enum
from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional, List

class GameMode(str, Enum):
    walls = "walls"
    pass_through = "pass-through"

class User(BaseModel):
    id: str
    username: str
    email: EmailStr
    avatar: Optional[str] = None
    createdAt: datetime

class LeaderboardEntry(BaseModel):
    id: str
    rank: int
    userId: str
    username: str
    score: int
    mode: GameMode
    date: date

class LiveGame(BaseModel):
    id: str
    playerId: str
    playerName: str
    currentScore: int
    mode: GameMode
    status: str
    startedAt: datetime
    viewerCount: int

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    success: bool
    user: Optional[User] = None
    error: Optional[str] = None

class ScoreSubmission(BaseModel):
    score: int
    mode: GameMode

class ScoreResponse(BaseModel):
    rank: int
    isHighScore: bool

class JoinGameResponse(BaseModel):
    success: bool
    error: Optional[str] = None
