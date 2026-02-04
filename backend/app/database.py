from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select, desc, func
from sqlalchemy.orm import selectinload

from .models import User, LeaderboardEntry, LiveGame, GameMode
from .db_models import Base, UserDB, ScoreDB
from .config import settings
from .security import get_password_hash, verify_password

class Database:
    def __init__(self):
        self.engine = create_async_engine(settings.DATABASE_URL, echo=False)
        self.async_session = async_sessionmaker(
            self.engine, expire_on_commit=False, class_=AsyncSession
        )
        
        # Keep live games in memory for performance
        self.live_games: List[LiveGame] = []

    async def init_db(self):
        async with self.engine.begin() as conn:
            # In a real production app, use Alembic for migrations
            await conn.run_sync(Base.metadata.create_all)

    # Auth methods
    async def get_user_by_email(self, email: str) -> Optional[User]:
        async with self.async_session() as session:
            result = await session.execute(select(UserDB).where(UserDB.email == email))
            user_db = result.scalar_one_or_none()
            if user_db:
                return User(
                    id=user_db.id,
                    username=user_db.username,
                    email=user_db.email,
                    createdAt=user_db.created_at
                )
        return None

    async def verify_password(self, email: str, password: str) -> bool:
        async with self.async_session() as session:
            result = await session.execute(select(UserDB).where(UserDB.email == email))
            user_db = result.scalar_one_or_none()
            if user_db:
                return verify_password(password, user_db.password_hash)
        return False

    async def create_user(self, username: str, email: str, password: str) -> User:
        async with self.async_session() as session:
            user_db = UserDB(
                username=username,
                email=email,
                password_hash=get_password_hash(password),
                created_at=datetime.utcnow()
            )
            session.add(user_db)
            await session.commit()
            await session.refresh(user_db)
            
            return User(
                id=user_db.id,
                username=user_db.username,
                email=user_db.email,
                createdAt=user_db.created_at
            )

    # Leaderboard methods
    async def get_leaderboard(self, mode: Optional[GameMode] = None, limit: int = 10) -> List[LeaderboardEntry]:
        async with self.async_session() as session:
            query = select(ScoreDB).options(selectinload(ScoreDB.user))
            if mode:
                query = query.where(ScoreDB.mode == mode)
            
            # Simple ordering by score for now
            query = query.order_by(desc(ScoreDB.score)).limit(limit)
            
            result = await session.execute(query)
            scores = result.scalars().all()
            
            leaderboard = []
            for i, s in enumerate(scores):
                leaderboard.append(LeaderboardEntry(
                    id=s.id,
                    rank=i + 1, # This rank is within the page/limit, somewhat simplified
                    userId=s.user_id,
                    username=s.user.username,
                    score=s.score,
                    mode=s.mode,
                    date=s.date
                ))
            return leaderboard

    async def submit_score(self, user: User, score: int, mode: GameMode) -> tuple[int, bool]:
        async with self.async_session() as session:
            # Check for existing high scores? simpler logic: just insert and calc rank
            
            # Calculate rank dynamically
            # Count scores higher than this one
            count_query = select(func.count()).select_from(ScoreDB).where(ScoreDB.score > score)
            count_res = await session.execute(count_query)
            rank = count_res.scalar_one() + 1
            
            is_high_score = rank <= 10 # Top 10 is high score
            
            # Always save the score
            score_db = ScoreDB(
                user_id=user.id,
                score=score,
                mode=mode
            )
            session.add(score_db)
            await session.commit()
            
            return rank, is_high_score

    # Live games methods (In-Memory)
    async def get_live_games(self) -> List[LiveGame]:
        return self.live_games

    async def join_game(self, game_id: str) -> bool:
        game = next((g for g in self.live_games if g.id == game_id), None)
        if game:
            game.viewerCount += 1
            return True
        return False

    async def leave_game(self, game_id: str) -> None:
        game = next((g for g in self.live_games if g.id == game_id), None)
        if game:
            game.viewerCount = max(0, game.viewerCount - 1)

db = Database()
