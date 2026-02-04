

import asyncio
import argparse
import uuid
from datetime import datetime, date
from sqlalchemy import select
from app.database import db
from app.db_models import UserDB, ScoreDB
from app.models import GameMode
from app.security import get_password_hash

async def seed_data():
    print("Seeding data...")
    async with db.async_session() as session:
        # Check if data exists
        # If we want a clean seed, we might want to drop_all first or just append?
        # Let's just append if not exists to be safe, or just add "DemoPlayer"
        
        # 1. Demo User
        demo_email = "demo@snake.io"
        result = await session.execute(select(UserDB).where(UserDB.email == demo_email))
        if not result.scalar_one_or_none():
            demo_user = UserDB(
                id="1",
                username="DemoPlayer",
                email=demo_email,
                password_hash=get_password_hash("demo"), 
                created_at=datetime.utcnow()
            )
            session.add(demo_user)
            print("Added DemoPlayer")
            
            # Add some scores for demo user
            session.add(ScoreDB(id=str(uuid.uuid4()), user_id="1", score=100, mode=GameMode.walls, date=date.today()))

        # 2. Other Mock Users
        usernames = ["ViperMaster", "PythonKing", "Anaconda", "CoilCrusher", "FangFury", "SlitherStrike", "VenomVoice", "RattleSnake", "CobraCommander", "MambaMentality"]
        
        for i, name in enumerate(usernames):
            email = f"{name.lower()}@snake.io"
            result = await session.execute(select(UserDB).where(UserDB.email == email))
            if not result.scalar_one_or_none():
                user_id = str(uuid.uuid4())
                user = UserDB(
                    id=user_id,
                    username=name,
                    email=email,
                    password_hash=get_password_hash("password"),
                    created_at=datetime.utcnow()
                )
                session.add(user)
                
                # Add a random score
                score_val = (len(usernames) - i) * 500
                session.add(ScoreDB(
                    id=str(uuid.uuid4()), 
                    user_id=user_id, 
                    score=score_val, 
                    mode=GameMode.walls if i % 2 == 0 else GameMode.pass_through, 
                    date=date.today()
                ))
        
        await session.commit()
        print("Seeding complete.")

async def main():
    parser = argparse.ArgumentParser(description="Initialize database")
    parser.add_argument("--seed", action="store_true", help="Seed database with mock data")
    args = parser.parse_args()

    print("Initializing database...")
    await db.init_db()
    print("Database tables created.")

    if args.seed:
        await seed_data()

if __name__ == "__main__":
    asyncio.run(main())
