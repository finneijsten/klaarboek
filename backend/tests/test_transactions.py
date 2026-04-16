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


def test_dashboard_period_range_quarter():
    from datetime import date
    from app.routes.transactions import _period_range
    # Mid-Q2 in a normal year.
    start, end = _period_range("quarter", today=date(2026, 5, 10))
    assert start == "2026-04-01"
    assert end == "2026-07-01"


def test_dashboard_period_range_month_year_rollover():
    from datetime import date
    from app.routes.transactions import _period_range
    start, end = _period_range("month", today=date(2026, 12, 20))
    assert start == "2026-12-01"
    assert end == "2027-01-01"


def test_dashboard_period_range_all():
    from app.routes.transactions import _period_range
    assert _period_range("all") == (None, None)


def test_dashboard_bad_period(client):
    assert client.get("/transactions/dashboard?period=nope").status_code == 400


def test_categories_breakdown(client, mock_db):
    seed_bank(mock_db)
    client.post("/transactions/", json={
        "bank_connection_id": 1, "date": "2026-03-01T00:00:00",
        "amount": 100.0, "is_income": False, "category": "Kantoor",
    })
    client.post("/transactions/", json={
        "bank_connection_id": 1, "date": "2026-03-02T00:00:00",
        "amount": 50.0, "is_income": False, "category": "Kantoor",
    })
    client.post("/transactions/", json={
        "bank_connection_id": 1, "date": "2026-03-03T00:00:00",
        "amount": 30.0, "is_income": False, "category": "Transport",
    })

    data = client.get("/transactions/categories?period=all").json()
    # Kantoor first (larger expense), Transport second.
    assert [c["category"] for c in data] == ["Kantoor", "Transport"]
    assert data[0]["total_expenses"] == 150.0
    assert data[0]["transaction_count"] == 2


def test_categories_excludes_non_business(client, mock_db):
    seed_bank(mock_db)
    client.post("/transactions/", json={
        "bank_connection_id": 1, "date": "2026-03-01T00:00:00",
        "amount": 100.0, "is_income": False, "category": "Boodschappen",
        "is_business": False,
    })
    assert client.get("/transactions/categories?period=all").json() == []


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

    # 'all' period: both transactions included.
    data = client.get("/transactions/dashboard?period=all").json()
    assert data["transaction_count"] == 2
    assert data["total_income"] == 1210.0
    assert data["total_expenses"] == 242.0
    # BTW collected = 1210 * 21 / 121 = 210; paid = 242 * 21 / 121 = 42; owed = 168.
    assert data["btw_owed"] == 168.0
    assert data["profit"] == 968.0
