# Snake Arena Backend

This is the backend API for the Snake Arena multiplayer game. It provides endpoints for authentication, leaderboard management, and game spectator modes.

## Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Language**: Python 3.12+
- **Dependency Management**: [uv](https://github.com/astral-sh/uv)
- **Testing**: pytest
- **Database**: In-memory Mock Database (for prototype phase)

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py       # API entry point and routes
│   ├── models.py     # Pydantic data models
│   └── database.py   # Mock database implementation
├── tests/            # Integration tests
├── openapi.yaml      # API Specification
└── pyproject.toml    # Project configuration
```

## Setup & Installation

This project uses `uv` for blazing fast dependency management.

1.  **Install uv** (if not installed):
    ```bash
    pip install uv
    ```

2.  **Install Dependencies**:
    ```bash
    uv sync
    ```

## Running the Server

Start the development server:

```bash
uv run uvicorn app.main:app --reload
```

The API will be available at:
- **API Root**: http://localhost:8000
- **Interactive Docs (Swagger UI)**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Running Tests

Run the test suite using pytest:

```bash
uv run pytest
```

## API Features

- **Authentication**: Login, Signup, Logout (Mocked)
- **Leaderboard**: view global rankings, Submit scores with validation
- **Spectator**: List live games, Join/Leave game rooms (Mocked viewer counts)

> **Note**: The current implementation uses an in-memory database. All data will be reset when the server restarts.
