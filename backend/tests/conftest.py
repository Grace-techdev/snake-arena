import pytest
import os
import sys
from fastapi.testclient import TestClient

# Add src to python path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database import db

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture(autouse=True)
def reset_db():
    # Reset mock DB before each test
    db._init_mock_data()
