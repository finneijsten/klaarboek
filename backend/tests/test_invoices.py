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
    assert data["invoice_number"] == "KB-1-0001"
    assert data["is_paid"] is False


def test_create_invoice_auto_number(client, mock_db):
    client.post("/invoices/", json={"client_name": "A", "amount_excl_btw": 100, "btw_rate": 21.0})
    res = client.post("/invoices/", json={"client_name": "B", "amount_excl_btw": 200, "btw_rate": 21.0})
    assert res.json()["invoice_number"] == "KB-1-0002"


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


def test_create_invoice_stores_description_and_email(client, mock_db):
    res = client.post("/invoices/", json={
        "client_name": "Acme",
        "client_email": "finance@acme.nl",
        "description": "Design sprint week 12",
        "amount_excl_btw": 500,
        "btw_rate": 21.0,
    })
    assert res.status_code == 201
    data = res.json()
    assert data["client_email"] == "finance@acme.nl"
    assert data["description"] == "Design sprint week 12"


def test_invoice_number_survives_delete(client, mock_db):
    """Deleting an old invoice must not let the next number collide with a
    surviving one. Regression for the `len(existing)+1` bug."""
    a = client.post("/invoices/", json={"client_name": "A", "amount_excl_btw": 100, "btw_rate": 21.0})
    b = client.post("/invoices/", json={"client_name": "B", "amount_excl_btw": 100, "btw_rate": 21.0})
    assert a.json()["invoice_number"] == "KB-1-0001"
    assert b.json()["invoice_number"] == "KB-1-0002"

    # Delete the *first* invoice — #0002 is still around.
    client.delete(f"/invoices/{a.json()['id']}")
    c = client.post("/invoices/", json={"client_name": "C", "amount_excl_btw": 100, "btw_rate": 21.0})
    # count(*)+1 would have returned KB-1-0002 and hit the unique constraint.
    # Our MAX+1 path returns KB-1-0003.
    assert c.json()["invoice_number"] == "KB-1-0003"
