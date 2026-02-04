
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    _db_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./snake_arena.db")
    
    # Render provides postgres:// which SQLAlchemy implementation of postgresql:// defaults to psycopg2
    # We need to force asyncpg driver
    if _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif _db_url.startswith("postgresql://"):
        _db_url = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        
    DATABASE_URL: str = _db_url

settings = Settings()
