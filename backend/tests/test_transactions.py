"""Tests for transaction routes."""
from tests.conftest import seed_bank


def test_list_transactions_empty(client, mock_db):
    res = client.get("/transactions/")
    assert res.status_code == 200
    assert res.json() == []


def test_create_transaction(client, mock_db):
    seed_bank(mock_db)

    res = client.post("/transactions/", json={
        "bank_connection_id": 1,
        "date": "2026-03-15T00:00:00",
        "amount": 150.0,
        "description": "Adobe Creative Cloud",
        "counterparty": "Adobe",
        "is_income": False,
    })
    assert res.status_code == 201
    data = res.json()
    assert data["amount"] == 150.0
    assert data["category"] == "Abonnementen"
    assert data["btw_rate"] == "21"  # canonicalised, no '%' suffix
    assert data["classified_by"] == "auto"


def test_create_transaction_normalises_negative_amount(client, mock_db):
    seed_bank(mock_db)
    res = client.post("/transactions/", json={
        "bank_connection_id": 1,
        "date": "2026-03-15T00:00:00",
        "amount": -200.0,
        "is_income": False,
    })
    assert res.status_code == 201
    # We always store magnitude; direction lives on is_income.
    assert res.json()["amount"] == 200.0


def test_create_transaction_wrong_connection(client, mock_db):
    res = client.post("/transactions/", json={
        "bank_connection_id": 999,
        "date": "2026-03-15T00:00:00",
        "amount": 50.0,
    })
    assert res.status_code == 404


def test_update_transaction(client, mock_db):
    seed_bank(mock_db)
    client.post("/transactions/", json={
        "bank_connection_id": 1,
        "date": "2026-03-15T00:00:00",
        "amount": 100.0,
    })
    tx_id = client.get("/transactions/").json()[0]["id"]

    res = client.patch(f"/transactions/{tx_id}", json={"category": "Kantoor", "btw_rate": "21%"})
    assert res.status_code == 200
    assert res.json()["category"] == "Kantoor"
    # btw_rate is canonicalised on update too
    assert res.json()["btw_rate"] == "21"


def test_dashboard_empty(client, mock_db):
    res = client.get("/transactions/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert data["total_income"] == 0
    assert data["transaction_count"] == 0


def test_delete_transaction(client, mock_db):
    seed_bank(mock_db)
    client.post("/transactions/", json={
        "bank_connection_id": 1, "date": "2026-03-15T00:00:00", "amount": 75.0,
    })
    tx_id = client.get("/transactions/").json()[0]["id"]

    assert client.delete(f"/transactions/{tx_id}").status_code == 204
    assert client.get("/transactions/").json() == []


def test_delete_transaction_not_found(client):
    assert client.delete("/transactions/999").status_code == 404


def test_dashboard_with_transactions(client, mock_db):
    seed_bank(mock_db)
    client.post("/transactions/", json={
        "bank_connection_id": 1, "date": "2026-03-01T00:00:00",
        "amount": 1210.0, "is_income": True, "btw_rate": "21",
    })
    client.post("/transactions/", json={
        "bank_connection_id": 1, "date": "2026-03-02T00:00:00",
        "amount": 242.0, "is_income": False, "btw_rate": "21",
    })

    data = client.get("/transactions/dashboard").json()
    assert data["transaction_count"] == 2
    assert data["total_income"] == 1210.0
    assert data["total_expenses"] == 242.0
    # BTW collected = 1210 * 21 / 121 = 210; paid = 242 * 21 / 121 = 42; owed = 168.
    assert data["btw_owed"] == 168.0
    assert data["profit"] == 968.0
