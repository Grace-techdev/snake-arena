import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    response = await client.post("/auth/login", json={"email": "demo@snake.io", "password": "demo"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["username"] == "DemoPlayer"

@pytest.mark.asyncio
async def test_login_failure(client: AsyncClient):
    response = await client.post("/auth/login", json={"email": "demo@snake.io", "password": "wrong"})
    # Check if failure returns 200 (as per original test) or 400/401?
    # Original test expected 200 with success: false
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "Invalid password"

@pytest.mark.asyncio
async def test_signup_success(client: AsyncClient):
    response = await client.post("/auth/signup", json={"username": "NewPlayer", "email": "new@snake.io", "password": "pass"})
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["user"]["username"] == "NewPlayer"

@pytest.mark.asyncio
async def test_signup_duplicate(client: AsyncClient):
    response = await client.post("/auth/signup", json={"username": "DemoPlayer", "email": "demo@snake.io", "password": "demo"})
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "Email already registered"

@pytest.mark.asyncio
async def test_get_leaderboard(client: AsyncClient):
    response = await client.get("/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    # Check rank 1 is highest score (200 from Viper)
    assert data[0]["rank"] == 1
    assert data[0]["score"] == 200

@pytest.mark.asyncio
async def test_submit_score(client: AsyncClient):
    response = await client.post(
        "/leaderboard", 
        params={"email": "demo@snake.io"}, 
        json={"score": 3000, "mode": "walls"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["rank"] == 1
    assert data["isHighScore"] is True
    
    # Verify leaderboard updated
    response = await client.get("/leaderboard")
    data = response.json()
    assert data[0]["score"] == 3000
    assert data[0]["username"] == "DemoPlayer"

@pytest.mark.asyncio
async def test_get_live_games(client: AsyncClient):
    response = await client.get("/games")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == "game1"

@pytest.mark.asyncio
async def test_join_game(client: AsyncClient):
    # Get initial count
    response = await client.get("/games")
    initial_count = response.json()[0]["viewerCount"]
    
    # Join
    response = await client.post("/games/game1/join")
    assert response.status_code == 200
    assert response.json()["success"] is True
    
    # Verify count increased
    response = await client.get("/games")
    assert response.json()[0]["viewerCount"] == initial_count + 1
