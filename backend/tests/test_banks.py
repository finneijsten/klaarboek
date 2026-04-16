"""Tests for /banks routes + IBAN + CSV import."""
from app.iban import is_valid_iban, normalise_iban
from app.csv_import import parse_csv


def test_iban_valid():
    assert is_valid_iban("NL91ABNA0417164300") is True
    # Same IBAN with spaces / lowercase.
    assert is_valid_iban("nl91 abna 0417 1643 00") is True


def test_iban_invalid():
    assert is_valid_iban("NL00INGB0000000000") is False
    assert is_valid_iban("asdf") is False
    assert is_valid_iban("") is False


def test_normalise_iban_strips_spaces():
    assert normalise_iban("nl91 abna 0417 1643 00") == "NL91ABNA0417164300"


def test_create_bank_connection_rejects_bad_iban(client):
    res = client.post("/banks/", json={"bank_name": "ING", "iban": "NL00INGB0000000000"})
    assert res.status_code == 422


def test_create_bank_connection_ok(client, mock_db):
    res = client.post("/banks/", json={
        "bank_name": "ING", "iban": "nl91 abna 0417 1643 00",
    })
    assert res.status_code == 201
    assert res.json()["iban"] == "NL91ABNA0417164300"


def test_list_delete_bank_connection(client, mock_db):
    client.post("/banks/", json={"bank_name": "ING", "iban": "NL91ABNA0417164300"})
    assert len(client.get("/banks/").json()) == 1
    inv_id = client.get("/banks/").json()[0]["id"]
    assert client.delete(f"/banks/{inv_id}").status_code == 204
    assert client.get("/banks/").json() == []


# --- CSV parsing -----------------------------------------------------------

ING_CSV = """\
"Datum","Naam / Omschrijving","Rekening","Tegenrekening","Code","Af Bij","Bedrag (EUR)","Mededelingen"
"20260315","Adobe Systems","NL91ABNA0417164300","","IC","Af","49,99","Adobe CC monthly"
"20260316","Bakkerij van Dam","NL91ABNA0417164300","NL11RABO0123456789","SB","Bij","2400,00","Factuur 2026-001"
"""

REVOLUT_CSV = """\
Type,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
TOPUP,2026-03-15,2026-03-15,Apple,-19.99,0.00,EUR,COMPLETED,100.00
PAYMENT,2026-03-16,2026-03-16,Client Y,500.00,0.00,EUR,COMPLETED,600.00
"""


def test_parse_csv_ing():
    rows = parse_csv(ING_CSV)
    assert len(rows) == 2
    out = rows[0]
    assert out["date"] == "2026-03-15"
    assert out["amount"] == 49.99
    assert out["is_income"] is False
    assert "Adobe" in (out["description"] or "") or "Adobe" in (out["counterparty"] or "")

    inc = rows[1]
    assert inc["amount"] == 2400.0
    assert inc["is_income"] is True


def test_parse_csv_revolut():
    rows = parse_csv(REVOLUT_CSV)
    assert len(rows) == 2
    assert rows[0]["amount"] == 19.99
    assert rows[0]["is_income"] is False
    assert rows[1]["amount"] == 500.0
    assert rows[1]["is_income"] is True


def test_import_csv_end_to_end(client, mock_db):
    client.post("/banks/", json={"bank_name": "ING", "iban": "NL91ABNA0417164300"})
    conn_id = client.get("/banks/").json()[0]["id"]

    res = client.post(
        f"/banks/{conn_id}/import",
        files={"file": ("ing.csv", ING_CSV, "text/csv")},
    )
    assert res.status_code == 200
    assert res.json()["imported"] == 2

    txs = client.get("/transactions/").json()
    assert len(txs) == 2
    # Amounts are stored as magnitudes.
    assert all(t["amount"] > 0 for t in txs)


def test_import_csv_empty_file(client, mock_db):
    client.post("/banks/", json={"bank_name": "ING", "iban": "NL91ABNA0417164300"})
    conn_id = client.get("/banks/").json()[0]["id"]
    res = client.post(
        f"/banks/{conn_id}/import",
        files={"file": ("empty.csv", "", "text/csv")},
    )
    assert res.status_code == 400


def test_import_csv_unknown_connection(client):
    res = client.post(
        "/banks/999/import",
        files={"file": ("ing.csv", ING_CSV, "text/csv")},
    )
    assert res.status_code == 404
