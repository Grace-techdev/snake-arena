# Snake Arena Backend

This is the backend API for the Snake Arena multiplayer game. It provides endpoints for authentication, leaderboard management, and game spectator modes.

## Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Language**: Python 3.12+
- **Dependency Management**: [uv](https://github.com/astral-sh/uv)
- **Testing**: pytest (Unit & Integration)
- **Database**: PostgreSQL (Production/Docker), SQLite (Local Dev/Tests)
- **ORM**: SQLAlchemy (Async)

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py       # API entry point & SPA serving
│   ├── config.py     # Environment configuration
│   ├── models.py     # Pydantic Schemas
│   ├── db_models.py  # SQLAlchemy Models
│   ├── database.py   # DB Connection & Logic
│   └── init_db.py    # Seeding Logic
├── tests/            # Unit Tests
├── tests_integration/# Integration/Flow Tests
└── pyproject.toml    # Project configuration
```

## Setup & Installation

This project uses `uv` for modern, fast Python package management.

1.  **Install dependencies**:
    ```bash
    cd backend
    uv sync
    ```

2.  **Run Locally (Dev)**:
    ```bash
    uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ```

## Testing

The test suite is split into Unit and Integration tests to ensure robustness.

1.  **Run All Tests**:
    ```bash
    uv run pytest
    ```

2.  **Run Unit Tests Only**:
    ```bash
    uv run pytest tests/
    ```

3.  **Run Integration Tests Only**:
    ```bash
    env PYTHONPATH=. uv run pytest tests_integration/
    ```

## Database

- The app automatically detects if `DATABASE_URL` is set.
- **Production**: Connects to PostgreSQL (Render).
- **Local**: Defaults to `sqlite+aiosqlite:///./snake_arena.db`.
- **Seeding**:
    - On startup, it checks if `SEED_DB=true` (or defaults in dev).
    - Initializes test users (e.g., 'Grace', 'DemoPlayer') if they don't exist.

## API Documentation

Once running, access the interactive docs:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
