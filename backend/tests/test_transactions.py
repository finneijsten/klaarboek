"""Tests for transaction routes."""
import asyncio


def _seed_bank(mock_db):
    asyncio.get_event_loop().run_until_complete(
        mock_db.insert("bank_connections", {
            "user_id": 1, "bank_name": "ING", "iban": "NL00INGB0001234567", "is_active": True,
        })
    )


def test_list_transactions_empty(client, mock_db):
    res = client.get("/transactions/")
    assert res.status_code == 200
    assert res.json() == []


def test_create_transaction(client, mock_db):
    _seed_bank(mock_db)

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
    # Auto-classified
    assert data["category"] == "Abonnementen"
    assert data["classified_by"] == "auto"


def test_create_transaction_wrong_connection(client, mock_db):
    res = client.post("/transactions/", json={
        "bank_connection_id": 999,
        "date": "2026-03-15T00:00:00",
        "amount": 50.0,
    })
    assert res.status_code == 404


def test_update_transaction(client, mock_db):
    _seed_bank(mock_db)
    # Create a transaction first
    client.post("/transactions/", json={
        "bank_connection_id": 1,
        "date": "2026-03-15T00:00:00",
        "amount": 100.0,
    })

    # Get the transaction ID
    txs = client.get("/transactions/").json()
    tx_id = txs[0]["id"]

    res = client.patch(f"/transactions/{tx_id}", json={"category": "Kantoor", "btw_rate": "21"})
    assert res.status_code == 200
    assert res.json()["category"] == "Kantoor"


def test_dashboard_empty(client, mock_db):
    res = client.get("/transactions/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert data["total_income"] == 0
    assert data["transaction_count"] == 0


def test_dashboard_with_transactions(client, mock_db):
    _seed_bank(mock_db)
    # Income
    client.post("/transactions/", json={
        "bank_connection_id": 1, "date": "2026-03-01T00:00:00",
        "amount": 1000.0, "is_income": True,
    })
    # Expense
    client.post("/transactions/", json={
        "bank_connection_id": 1, "date": "2026-03-02T00:00:00",
        "amount": 200.0, "is_income": False,
    })

    res = client.get("/transactions/dashboard")
    data = res.json()
    assert data["transaction_count"] == 2
    assert data["total_income"] == 1000.0
    assert data["total_expenses"] == 200.0
