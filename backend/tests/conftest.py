import pytest
import pytest_asyncio
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from datetime import datetime, date
import uuid

# Add app to path if needed, but usually works if run from root or backend
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database import db
from app.db_models import Base, UserDB, ScoreDB
from app.models import GameMode, LiveGame
from app.security import get_password_hash

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    # Patch global db
    original_session_maker = db.async_session
    db.async_session = async_session
    
    # Reset in-memory live games
    db.live_games = []
    
    async with async_session() as session:
        yield session
        
    db.async_session = original_session_maker
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest_asyncio.fixture(scope="function")
async def client(db_session) -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

@pytest_asyncio.fixture(autouse=True)
async def seed_db_data(db_session):
    # Seed data required by test_api.py
    
    # 1. Demo User
    demo_user = UserDB(
        id=str(uuid.uuid4()),
        username="DemoPlayer",
        email="demo@snake.io",
        password_hash=get_password_hash("demo"),
        created_at=datetime.utcnow()
    )
    db_session.add(demo_user)
    
    # 2. Leaderboard scores (test expects 3)
    # DemoPlayer score
    db_session.add(ScoreDB(id=str(uuid.uuid4()), user_id=demo_user.id, score=100, mode=GameMode.walls, date=date.today()))
    
    # Other users
    user2 = UserDB(id=str(uuid.uuid4()), username="Viper", email="viper@snake.io", password_hash="x", created_at=datetime.utcnow())
    db_session.add(user2)
    db_session.add(ScoreDB(id=str(uuid.uuid4()), user_id=user2.id, score=200, mode=GameMode.walls, date=date.today()))
    
    user3 = UserDB(id=str(uuid.uuid4()), username="Python", email="python@snake.io", password_hash="x", created_at=datetime.utcnow())
    db_session.add(user3)
    db_session.add(ScoreDB(id=str(uuid.uuid4()), user_id=user3.id, score=50, mode=GameMode.walls, date=date.today()))
    
    await db_session.commit()
    
    # 3. Live Game (test_get_live_games expects game1)
    # We manipulate the in-memory list on the global db object
    db.live_games.append(LiveGame(
        id="game1",
        playerId=demo_user.id,
        playerName="DemoPlayer",
        currentScore=0,
        mode=GameMode.walls,
        status="playing",
        startedAt=datetime.utcnow(),
        viewerCount=0
    ))
