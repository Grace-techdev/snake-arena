
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_score_submission_flow(client: AsyncClient):
    # 1. Signup a new user
    user_data = {
        "username": "IntegrationTester",
        "email": "integration@test.com",
        "password": "securepassword123"
    }
    
    auth_response = await client.post("/auth/signup", json=user_data)
    assert auth_response.status_code == 201
    assert auth_response.json()["success"] is True
    
    # 2. Submit a LOW score (to verify our fix works for non-top-10 scores)
    # Note: Since DB is fresh (in-memory), ANY score is technically a high score locally,
    # but we want to confirm it is saved and retrievable.
    score_data = {
        "score": 5,
        "mode": "walls"
    }
    
    # The API requires 'email' query param for auth (simulated)
    response = await client.post(
        "/leaderboard", 
        params={"email": user_data["email"]}, 
        json=score_data
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["rank"] == 1 # First score in empty DB
    assert data["isHighScore"] is True # Only score is high score
    
    # 3. Submit a second, lower score.
    # First score was 5. New score 1.
    score_data_low = {
        "score": 1,
        "mode": "walls"
    }
    
    response_low = await client.post(
        "/leaderboard", 
        params={"email": user_data["email"]}, 
        json=score_data_low
    )
    
    assert response_low.status_code == 200
    data_low = response_low.json()
    assert data_low["rank"] == 2 # Should be second
    assert data_low["isHighScore"] is True # Top 10 still valid in empty DB
    
    # 4. Verify Leaderboard contains both
    leaderboard_response = await client.get("/leaderboard")
    assert leaderboard_response.status_code == 200
    lb_data = leaderboard_response.json()
    
    assert len(lb_data) == 2
    assert lb_data[0]["score"] == 5
    assert lb_data[1]["score"] == 1
    assert lb_data[0]["username"] == "IntegrationTester"
