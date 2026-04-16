"""Tests for /auth/export."""
import csv
import io
import json
import zipfile

from tests.conftest import seed_bank


def test_export_empty_user(client, mock_db):
    res = client.get("/auth/export")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/zip"
    z = zipfile.ZipFile(io.BytesIO(res.content))
    names = set(z.namelist())
    assert {
        "profile.json", "bank_connections.csv", "transactions.csv",
        "invoices.csv", "btw_declarations.csv", "README.txt",
    } <= names
    profile = json.loads(z.read("profile.json"))
    assert profile["email"] == "test@klaarboek.nl"


def test_export_contains_user_data(client, mock_db):
    seed_bank(mock_db)
    client.post("/transactions/", json={
        "bank_connection_id": 1, "date": "2026-02-15T00:00:00",
        "amount": 1000.0, "is_income": True, "btw_rate": "21",
    })
    client.post("/invoices/", json={
        "client_name": "Acme", "amount_excl_btw": 500, "btw_rate": 21.0,
    })

    res = client.get("/auth/export")
    assert res.status_code == 200
    z = zipfile.ZipFile(io.BytesIO(res.content))

    txs = list(csv.DictReader(io.StringIO(z.read("transactions.csv").decode())))
    assert len(txs) == 1
    assert txs[0]["amount"] == "1000.0"

    invs = list(csv.DictReader(io.StringIO(z.read("invoices.csv").decode())))
    assert len(invs) == 1
    assert invs[0]["client_name"] == "Acme"
