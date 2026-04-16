"""Tests for /btw routes and shared BTW helpers."""
from app.btw import parse_btw_rate, canonical_btw_rate, summarise_transactions
from tests.conftest import seed_bank


# --- Helpers ---------------------------------------------------------------

def test_parse_btw_rate_variants():
    assert parse_btw_rate("21") == 21
    assert parse_btw_rate("21%") == 21
    assert parse_btw_rate(21) == 21
    assert parse_btw_rate(21.0) == 21
    assert parse_btw_rate(None) is None
    assert parse_btw_rate("exempt") is None
    assert parse_btw_rate("") is None


def test_canonical_btw_rate():
    assert canonical_btw_rate("21%") == "21"
    assert canonical_btw_rate("9") == "9"
    assert canonical_btw_rate(0) == "0"
    assert canonical_btw_rate("exempt") == "exempt"
    assert canonical_btw_rate(None) is None


def test_summarise_ignores_non_business():
    rows = [
        {"amount": 121, "is_income": True, "btw_rate": "21", "is_business": True},
        {"amount": 50,  "is_income": False, "btw_rate": "21", "is_business": False},
    ]
    s = summarise_transactions(rows)
    assert s["total_income"] == 121.0
    assert s["total_expenses"] == 0.0
    assert s["btw_collected"] == 21.0
    assert s["btw_paid"] == 0.0
    assert s["btw_owed"] == 21.0


def test_summarise_mixed_rates():
    rows = [
        {"amount": 1210, "is_income": True, "btw_rate": "21", "is_business": True},
        {"amount": 109,  "is_income": True, "btw_rate": "9",  "is_business": True},
        {"amount": 100,  "is_income": False, "btw_rate": None, "is_business": True},  # exempt
    ]
    s = summarise_transactions(rows)
    assert s["total_income"] == 1319.0
    assert s["btw_collected"] == 210 + 9  # 21% and 9%
    assert s["btw_paid"] == 0.0


# --- Routes ----------------------------------------------------------------

def test_calculate_btw_no_transactions(client, mock_db):
    res = client.get("/btw/calculate?year=2026&quarter=1")
    assert res.status_code == 200
    assert res.json()["btw_owed"] == 0


def test_calculate_btw_bad_quarter(client):
    res = client.get("/btw/calculate?year=2026&quarter=5")
    assert res.status_code == 400


def test_calculate_and_save_declaration(client, mock_db):
    seed_bank(mock_db)
    client.post("/transactions/", json={
        "bank_connection_id": 1,
        "date": "2026-02-15T00:00:00",
        "amount": 1210.0,
        "is_income": True,
        "btw_rate": "21",
        "is_business": True,
    })
    calc = client.get("/btw/calculate?year=2026&quarter=1").json()
    assert calc["btw_collected"] == 210.0
    assert calc["btw_owed"] == 210.0

    saved = client.post("/btw/declarations?year=2026&quarter=1")
    assert saved.status_code == 201
    assert saved.json()["status"] == "concept"

    # Saving the same quarter twice should 400.
    again = client.post("/btw/declarations?year=2026&quarter=1")
    assert again.status_code == 400
