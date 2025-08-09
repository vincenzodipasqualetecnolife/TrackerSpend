from fastapi.testclient import TestClient
from app.main import app


def test_list_requires_api_key():
    client = TestClient(app)
    r = client.get("/transactions")
    assert r.status_code == 401


