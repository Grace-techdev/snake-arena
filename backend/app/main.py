import os
from fastapi import FastAPI, HTTPException, status, Query, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

from .models import (
    User, LoginRequest, SignupRequest, AuthResponse,
    LeaderboardEntry, ScoreSubmission, ScoreResponse, GameMode,
    LiveGame, JoinGameResponse
)
from .database import db
from .init_db import seed_data

app = FastAPI(
    title="Snake Arena API",
    description="Backend API for the Snake Arena multiplayer game",
    version="1.0.0"
)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await db.init_db()
    if os.getenv("SEED_DB") == "true":
        await seed_data()

# Auth Routes
@app.post("/auth/login", response_model=AuthResponse, tags=["Auth"])
async def login(request: LoginRequest):
    user = await db.get_user_by_email(request.email)
    if not user:
        return AuthResponse(success=False, error="User not found")
    
    if not await db.verify_password(request.email, request.password):
        return AuthResponse(success=False, error="Invalid password")
    
    return AuthResponse(success=True, user=user)

@app.post("/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED, tags=["Auth"])
async def signup(request: SignupRequest, response: Response):
    existing_user = await db.get_user_by_email(request.email)
    if existing_user:
         response.status_code = status.HTTP_400_BAD_REQUEST
         return AuthResponse(success=False, error="Email already registered")
    
    user = await db.create_user(request.username, request.email, request.password)
    return AuthResponse(success=True, user=user)

@app.post("/auth/logout", tags=["Auth"])
async def logout():
    return {"message": "Successfully logged out"}

@app.get("/auth/me", response_model=Optional[User], tags=["Auth"])
async def get_current_user(email: str = Query(..., description="Simulated auth token (email)")):
    # In a real app, we'd use a JWT token. For now, we trust the email query param for simplicity
    # or just return null if not provided (though this endpoint requires it in this simple impl)
    return await db.get_user_by_email(email)

# Leaderboard Routes
@app.get("/leaderboard", response_model=List[LeaderboardEntry], tags=["Leaderboard"])
async def get_leaderboard(
    mode: Optional[GameMode] = None, 
    limit: int = 10
):
    return await db.get_leaderboard(mode, limit)

@app.post("/leaderboard", response_model=ScoreResponse, tags=["Leaderboard"])
async def submit_score(submission: ScoreSubmission, email: str = Query(..., description="User email (auth)")):
    user = await db.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    rank, is_high_score = await db.submit_score(user, submission.score, submission.mode)
    return ScoreResponse(rank=rank, isHighScore=is_high_score)

# Spectator Routes
@app.get("/games", response_model=List[LiveGame], tags=["Game"])
async def get_live_games():
    return await db.get_live_games()

@app.post("/games/{game_id}/join", response_model=JoinGameResponse, tags=["Game"])
async def join_game(game_id: str):
    success = await db.join_game(game_id)
    if not success:
        return JoinGameResponse(success=False, error="Game not found")
    return JoinGameResponse(success=True)

@app.post("/games/{game_id}/leave", tags=["Game"])
async def leave_game(game_id: str):
    await db.leave_game(game_id)
    return {"message": "Successfully left game"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
