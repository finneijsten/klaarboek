"""Tests for auth routes."""


def test_register(client, mock_db):
    res = client.post("/auth/register", json={
        "email": "new@test.nl",
        "password": "test1234",
        "company_name": "Nieuw BV",
        "kvk_number": "12345678",
        "btw_number": "NL123456789B01",
    })
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "new@test.nl"
    assert data["company_name"] == "Nieuw BV"
    assert "hashed_password" not in data


def test_register_duplicate(client, mock_db):
    client.post("/auth/register", json={
        "email": "dup@test.nl", "password": "test1234",
        "kvk_number": None, "btw_number": None,
    })
    res = client.post("/auth/register", json={
        "email": "dup@test.nl", "password": "test1234",
        "kvk_number": None, "btw_number": None,
    })
    assert res.status_code == 400


def test_get_profile(client):
    res = client.get("/auth/me")
    assert res.status_code == 200
    assert res.json()["email"] == "test@klaarboek.nl"


def test_update_profile(client, mock_db):
    # Seed user in mock db synchronously via the mock
    mock_db._tables.setdefault("users", []).append({
        "id": 1, "email": "test@klaarboek.nl", "company_name": "Old BV",
        "kvk_number": "12345678", "btw_number": "NL123456789B01",
        "created_at": "2026-01-01T00:00:00+00:00",
    })

    res = client.patch("/auth/me", json={"company_name": "Updated BV"})
    assert res.status_code == 200
    assert res.json()["company_name"] == "Updated BV"


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


def test_root(client):
    res = client.get("/")
    assert res.status_code == 200
    assert "KlaarBoek" in res.json()["message"]
