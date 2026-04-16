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


def test_register_rejects_short_password(client):
    res = client.post("/auth/register", json={
        "email": "ok@test.nl", "password": "short",
    })
    assert res.status_code == 422


def test_register_rejects_bad_email(client):
    res = client.post("/auth/register", json={
        "email": "not-an-email", "password": "longenoughpassword",
    })
    assert res.status_code == 422


def test_register_duplicate(client, mock_db):
    client.post("/auth/register", json={
        "email": "dup@test.nl", "password": "test1234",
    })
    res = client.post("/auth/register", json={
        "email": "DUP@test.nl", "password": "test1234",
    })
    # Case-insensitive duplicate check.
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


def test_delete_account_removes_all_user_data(client, mock_db):
    from tests.conftest import seed_bank
    seed_bank(mock_db)
    client.post("/transactions/", json={
        "bank_connection_id": 1, "date": "2026-02-15T00:00:00",
        "amount": 100.0, "is_income": False,
    })
    client.post("/invoices/", json={
        "client_name": "A", "amount_excl_btw": 100, "btw_rate": 21.0,
    })

    assert client.delete("/auth/me").status_code == 204

    assert mock_db._tables.get("transactions", []) == []
    assert mock_db._tables.get("bank_connections", []) == []
    assert mock_db._tables.get("invoices", []) == []
    assert mock_db._tables.get("users", []) == []
