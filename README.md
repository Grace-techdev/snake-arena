# Snake Arena

A modern, multiplayer-style Snake game built with React, FastAPI, and PostgreSQL.

> **Accreditation:** This project is built following the [AI Dev Tools Zoomcamp, Module 2](https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/blob/main/02-end-to-end/) tutorial.

## Project Overview

Snake Arena is a full-stack web application where players can:
- Play Snake in different modes (Classic, Walls, Portal).
- Compete on a global leaderboard.
- Spectate live games.
- View AI agents playing the game.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Shadcn UI.
- **Backend**: Python 3.12, FastAPI, SQLAlchemy.
- **Database**: PostgreSQL (Production), SQLite (Local/Test).
- **Deployment**: Docker, Render.
- **CI/CD**: GitHub Actions (Lint, Test, Deploy).

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.12+ (and `uv` package manager)

### Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Grace-techdev/snake-arena.git
    cd snake-arena
    ```

2.  **Run with Docker Compose** (Recommended):
    ```bash
    docker-compose up --build
    ```
    - Frontend: http://localhost:8080
    - Backend API: http://localhost:8080/api

3.  **Manual Setup**:
    - See [backend/README.md](backend/README.md) for API setup.
    - See [frontend/README.md](frontend/README.md) for Client setup.

## Deployment

The project is configured for automated deployment to [Render](https://render.com).

- **CI/CD Pipeline**: 
  - On push to `main`, GitHub Actions runs:
    1.  Frontend Tests (`npm test`)
    2.  Backend Unit Tests (`pytest tests/`)
    3.  Backend Integration Tests (`pytest tests_integration/`)
  - If all tests pass, it triggers a Deploy Hook to Render.

## Features

- **Authentication**: JWT-based auth (Mocked for easy demo, can be Swapped).
- **Persistent Leaderboard**: Stores high scores in PostgreSQL.
- **Live Updates**: Real-time game state tracking.
- **Responsive Design**: Works on Desktop and Mobile.
