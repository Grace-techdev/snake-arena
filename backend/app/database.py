import random
import uuid
import asyncio
from datetime import datetime, date
from typing import Dict, List, Optional
from .models import User, LeaderboardEntry, LiveGame, GameMode

class MockDatabase:
    def __init__(self):
        self.users: Dict[str, User] = {}  # email -> User
        self.passwords: Dict[str, str] = {}  # email -> password
        self.leaderboard: List[LeaderboardEntry] = []
        self.live_games: List[LiveGame] = []
        
        # Initialize with mock data
        self._init_mock_data()

    def _init_mock_data(self):
        # Mock users
        demo_user = User(
            id="1", 
            username="DemoPlayer", 
            email="demo@snake.io", 
            createdAt=datetime.now()
        )
        self.users["demo@snake.io"] = demo_user
        self.passwords["demo@snake.io"] = "demo"

        # Additional fake users
        usernames = ["ViperMaster", "PythonKing", "Anaconda", "CoilCrusher", "FangFury", "SlitherStrike", "VenomVoice", "RattleSnake", "CobraCommander", "MambaMentality"]
        for i, name in enumerate(usernames):
            email = f"{name.lower()}@snake.io"
            user = User(
                id=str(uuid.uuid4()),
                username=name,
                email=email,
                createdAt=datetime.now()
            )
            self.users[email] = user
            self.passwords[email] = "password"

        # Mock leaderboard
        self.leaderboard = [
            LeaderboardEntry(id=str(uuid.uuid4()), rank=1, userId="10", username="NeonViper", score=5000, mode=GameMode.walls, date=date.today()),
            LeaderboardEntry(id=str(uuid.uuid4()), rank=2, userId="11", username="PixelHunter", score=4500, mode=GameMode.walls, date=date.today()),
            LeaderboardEntry(id=str(uuid.uuid4()), rank=3, userId="12", username="RetroGamer", score=4200, mode=GameMode.pass_through, date=date.today()),
            LeaderboardEntry(id=str(uuid.uuid4()), rank=4, userId="13", username="ArcadeKing", score=3800, mode=GameMode.walls, date=date.today()),
            LeaderboardEntry(id=str(uuid.uuid4()), rank=5, userId="14", username="SnakeCharmer", score=3500, mode=GameMode.pass_through, date=date.today()),
            LeaderboardEntry(id=str(uuid.uuid4()), rank=6, userId="15", username="GridRunner", score=3200, mode=GameMode.walls, date=date.today()),
            LeaderboardEntry(id=str(uuid.uuid4()), rank=7, userId="16", username="ByteBiter", score=2900, mode=GameMode.pass_through, date=date.today()),
            LeaderboardEntry(id=str(uuid.uuid4()), rank=8, userId="17", username="CyberSnake", score=2500, mode=GameMode.walls, date=date.today()),
            LeaderboardEntry(id=str(uuid.uuid4()), rank=9, userId="18", username="DigitalDragon", score=2200, mode=GameMode.pass_through, date=date.today()),
            LeaderboardEntry(id=str(uuid.uuid4()), rank=10, userId="19", username="GlowWorm", score=2000, mode=GameMode.walls, date=date.today()),
        ]

        # Mock live games
        self.live_games = [
            LiveGame(
                id="game1", playerId="20", playerName="NeonViper", 
                currentScore=1240, mode=GameMode.walls, status="playing", 
                startedAt=datetime.now(), viewerCount=45
            ),
            LiveGame(
                id="game2", playerId="21", playerName="PixelHunter", 
                currentScore=850, mode=GameMode.pass_through, status="playing", 
                startedAt=datetime.now(), viewerCount=23
            ),
             LiveGame(
                id="game3", playerId="22", playerName="ArcadeKing", 
                currentScore=2100, mode=GameMode.walls, status="playing", 
                startedAt=datetime.now(), viewerCount=120
            ),
            LiveGame(
                id="game4", playerId="23", playerName="SnakeCharmer", 
                currentScore=500, mode=GameMode.pass_through, status="playing", 
                startedAt=datetime.now(), viewerCount=5
            )
        ]

    # Auth methods
    async def get_user_by_email(self, email: str) -> Optional[User]:
        await asyncio.sleep(0.1) # Simulate DB latency
        return self.users.get(email)

    async def verify_password(self, email: str, password: str) -> bool:
        return self.passwords.get(email) == password

    async def create_user(self, username: str, email: str, password: str) -> User:
        await asyncio.sleep(0.1)
        user = User(
            id=str(uuid.uuid4()),
            username=username,
            email=email,
            createdAt=datetime.now()
        )
        self.users[email] = user
        self.passwords[email] = password
        return user

    # Leaderboard methods
    async def get_leaderboard(self, mode: Optional[GameMode] = None, limit: int = 10) -> List[LeaderboardEntry]:
        await asyncio.sleep(0.1)
        entries = self.leaderboard
        if mode:
            entries = [e for e in entries if e.mode == mode]
        return entries[:limit]

    async def submit_score(self, user: User, score: int, mode: GameMode) -> tuple[int, bool]:
        await asyncio.sleep(0.1)
        rank = len([e for e in self.leaderboard if e.score > score]) + 1
        is_high_score = rank <= 10
        
        if is_high_score:
            entry = LeaderboardEntry(
                id=str(uuid.uuid4()),
                rank=rank,
                userId=user.id,
                username=user.username,
                score=score,
                mode=mode,
                date=date.today()
            )
            self.leaderboard.append(entry)
            self.leaderboard.sort(key=lambda x: x.score, reverse=True)
            # Re-rank
            for i, e in enumerate(self.leaderboard):
                e.rank = i + 1
                
        return rank, is_high_score

    # Live games methods
    async def get_live_games(self) -> List[LiveGame]:
        await asyncio.sleep(0.1)
        return self.live_games

    async def join_game(self, game_id: str) -> bool:
        await asyncio.sleep(0.1)
        game = next((g for g in self.live_games if g.id == game_id), None)
        if game:
            game.viewerCount += 1
            return True
        return False

    async def leave_game(self, game_id: str) -> None:
        await asyncio.sleep(0.1)
        game = next((g for g in self.live_games if g.id == game_id), None)
        if game:
            game.viewerCount = max(0, game.viewerCount - 1)

db = MockDatabase()
