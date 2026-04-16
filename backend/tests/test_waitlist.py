"""Tests for the /waitlist endpoint."""
from fastapi.testclient import TestClient

from app.main import app
from app.database import get_db


def test_waitlist_valid_email(client, mock_db):
    res = client.post("/waitlist/", json={"email": "Test@Example.COM"})
    assert res.status_code == 201
    body = res.json()
    assert body["already_signed_up"] is False
    # Stored lowercased.
    assert mock_db._tables["waitlist"][0]["email"] == "test@example.com"


def test_waitlist_duplicate(client, mock_db):
    client.post("/waitlist/", json={"email": "dup@example.com"})
    res = client.post("/waitlist/", json={"email": "dup@example.com"})
    assert res.status_code == 201
    assert res.json()["already_signed_up"] is True


def test_waitlist_bad_email(client):
    res = client.post("/waitlist/", json={"email": "not-an-email"})
    assert res.status_code == 422


def test_waitlist_backend_error_returns_503(mock_db):
    """If the DB insert blows up, we return 503 not a generic 200 success."""

    class BrokenDB(type(mock_db)):
        async def insert(self, table, data):
            raise RuntimeError("boom")

    app.dependency_overrides[get_db] = lambda: BrokenDB()
    try:
        with TestClient(app) as c:
            res = c.post("/waitlist/", json={"email": "new@example.com"})
            assert res.status_code == 503
    finally:
        app.dependency_overrides.clear()
