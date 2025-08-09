from fastapi.testclient import TestClient
from app.main import app


def test_login_requires_api_key():
    client = TestClient(app)
    r = client.get("/auth/login")
    assert r.status_code == 401


