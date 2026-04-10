"""Tests for invoice routes."""


def test_list_invoices_empty(client, mock_db):
    res = client.get("/invoices/")
    assert res.status_code == 200
    assert res.json() == []


def test_create_invoice(client, mock_db):
    res = client.post("/invoices/", json={
        "client_name": "Acme BV",
        "amount_excl_btw": 1000.0,
        "btw_rate": 21.0,
    })
    assert res.status_code == 201
    data = res.json()
    assert data["client_name"] == "Acme BV"
    assert data["amount_excl_btw"] == 1000.0
    assert data["btw_amount"] == 210.0
    assert data["amount_incl_btw"] == 1210.0
    assert data["invoice_number"] == "KB-0001"
    assert data["is_paid"] is False


def test_create_invoice_auto_number(client, mock_db):
    client.post("/invoices/", json={"client_name": "A", "amount_excl_btw": 100, "btw_rate": 21.0})
    res = client.post("/invoices/", json={"client_name": "B", "amount_excl_btw": 200, "btw_rate": 21.0})
    assert res.json()["invoice_number"] == "KB-0002"


def test_update_invoice_paid(client, mock_db):
    create_res = client.post("/invoices/", json={"client_name": "Test", "amount_excl_btw": 500, "btw_rate": 21.0})
    inv_id = create_res.json()["id"]

    res = client.patch(f"/invoices/{inv_id}", json={"is_paid": True})
    assert res.status_code == 200
    assert res.json()["is_paid"] is True


def test_delete_invoice(client, mock_db):
    create_res = client.post("/invoices/", json={"client_name": "Delete Me", "amount_excl_btw": 100, "btw_rate": 21.0})
    inv_id = create_res.json()["id"]

    res = client.delete(f"/invoices/{inv_id}")
    assert res.status_code == 204

    invoices = client.get("/invoices/").json()
    assert len(invoices) == 0


def test_delete_invoice_not_found(client, mock_db):
    res = client.delete("/invoices/999")
    assert res.status_code == 404
