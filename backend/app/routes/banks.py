from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from app.database import SupabaseClient, get_db
from app.schemas.bank import BankConnectionCreate, BankConnectionResponse
from app.auth import get_current_user
from app.classifier import classify_transaction
from app.btw import canonical_btw_rate
from app.csv_import import parse_csv, dedupe
from app.iban import normalise_iban

router = APIRouter(prefix="/banks", tags=["banks"])


@router.get("/", response_model=list[BankConnectionResponse])
async def list_bank_connections(
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    return await db.select(
        "bank_connections",
        filters={"user_id": user["id"]},
        order="connected_at.desc",
    )


@router.post("/", response_model=BankConnectionResponse, status_code=201)
async def create_bank_connection(
    data: BankConnectionCreate,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    existing = await db.select("bank_connections", filters={
        "user_id": user["id"], "iban": data.iban,
    })
    if existing:
        raise HTTPException(status_code=400, detail="Deze IBAN is al gekoppeld")

    connection = await db.insert("bank_connections", {
        "user_id": user["id"],
        "bank_name": data.bank_name,
        "iban": data.iban,
        "is_active": True,
    })
    return connection


@router.delete("/{connection_id}", status_code=204)
async def delete_bank_connection(
    connection_id: int,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    existing = await db.select("bank_connections", filters={
        "id": connection_id, "user_id": user["id"],
    })
    if not existing:
        raise HTTPException(status_code=404, detail="Bankverbinding niet gevonden")

    # Defensive cascade: the SQL schema uses ON DELETE CASCADE, but older
    # Supabase instances may have been created without it. Delete dependent
    # transactions first so the UI never shows orphans.
    await db.delete("transactions", {"bank_connection_id": connection_id})
    await db.delete("bank_connections", {"id": connection_id, "user_id": user["id"]})


@router.post("/{connection_id}/import")
async def import_csv(
    connection_id: int,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    """Import transactions from a bank CSV export.

    Supports ING, Rabobank, ABN AMRO, Bunq, Knab and Revolut header layouts.
    """
    connections = await db.select("bank_connections", filters={
        "id": connection_id, "user_id": user["id"],
    })
    if not connections:
        raise HTTPException(status_code=404, detail="Bankverbinding niet gevonden")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Leeg bestand")
    if len(raw) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Bestand is te groot (max 5 MB)")

    try:
        rows = parse_csv(raw)
    except Exception:
        raise HTTPException(status_code=400, detail="Kon CSV niet lezen")

    if not rows:
        raise HTTPException(status_code=400, detail="Geen transacties gevonden in CSV")

    existing_ext = {
        t["external_id"] for t in await db.select(
            "transactions",
            columns="external_id",
            filters={"bank_connection_id": connection_id},
        ) if t.get("external_id")
    }
    rows = dedupe(rows, existing_ext)

    imported = 0
    for row in rows:
        classification = classify_transaction(row.get("description"), row.get("counterparty"))
        classification["btw_rate"] = canonical_btw_rate(classification.get("btw_rate"))
        await db.insert("transactions", {
            "bank_connection_id": connection_id,
            "external_id": row.get("external_id"),
            "date": row["date"],
            "amount": row["amount"],
            "is_income": row["is_income"],
            "description": row.get("description"),
            "counterparty": row.get("counterparty"),
            **classification,
        })
        imported += 1

    return {"imported": imported, "skipped": max(0, len(rows) - imported)}


# ---------------------------------------------------------------------------
# Nordigen (PSD2) endpoints — kept behind a feature flag until the UI is wired
# up in Fase 4 of the roadmap. The frontend does NOT currently call these.
# ---------------------------------------------------------------------------
from app.config import settings  # noqa: E402
from app.nordigen import nordigen  # noqa: E402


def _nordigen_enabled() -> bool:
    return bool(settings.nordigen_secret_id and settings.nordigen_secret_key)


@router.get("/institutions")
async def list_institutions(country: str = "NL"):
    if not _nordigen_enabled():
        raise HTTPException(status_code=503, detail="Nordigen not configured")
    institutions = await nordigen.list_institutions(country)
    return [{"id": i["id"], "name": i["name"], "logo": i.get("logo")} for i in institutions]


@router.post("/connect")
async def start_bank_connection(
    institution_id: str,
    redirect_url: str,
    user: dict = Depends(get_current_user),
):
    if not _nordigen_enabled():
        raise HTTPException(status_code=503, detail="Nordigen not configured")
    requisition = await nordigen.create_requisition(institution_id, redirect_url)
    return {"requisition_id": requisition["id"], "link": requisition["link"]}


@router.post("/callback")
async def complete_bank_connection(
    requisition_id: str,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    if not _nordigen_enabled():
        raise HTTPException(status_code=503, detail="Nordigen not configured")
    req = await nordigen.get_requisition(requisition_id)
    if req.get("status") != "LN":
        raise HTTPException(
            status_code=400,
            detail=f"Autorisatie niet voltooid (status: {req.get('status')})",
        )

    created = []
    for account_id in req.get("accounts", []):
        details = await nordigen.get_account_details(account_id)
        iban = normalise_iban(details.get("iban", ""))
        bank_name = details.get("ownerName") or req.get("institution_id") or "Onbekend"

        existing = await db.select("bank_connections",
                                   filters={"user_id": user["id"], "iban": iban})
        if existing:
            continue

        connection = await db.insert("bank_connections", {
            "user_id": user["id"],
            "nordigen_requisition_id": requisition_id,
            "bank_name": bank_name,
            "iban": iban,
            "is_active": True,
        })
        created.append(connection)

    return {"connected": len(created), "accounts": created}


@router.post("/{connection_id}/sync")
async def sync_transactions(
    connection_id: int,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    if not _nordigen_enabled():
        raise HTTPException(status_code=503, detail="Nordigen not configured")

    connections = await db.select("bank_connections", filters={
        "id": connection_id, "user_id": user["id"],
    })
    if not connections:
        raise HTTPException(status_code=404, detail="Bankverbinding niet gevonden")

    conn = connections[0]
    req_id = conn.get("nordigen_requisition_id")
    if not req_id:
        raise HTTPException(status_code=400, detail="Geen Nordigen koppeling voor deze rekening")

    req = await nordigen.get_requisition(req_id)
    account_ids = req.get("accounts", [])
    if not account_ids:
        raise HTTPException(status_code=400, detail="Geen accounts gevonden")

    target_account = None
    for acc_id in account_ids:
        details = await nordigen.get_account_details(acc_id)
        if normalise_iban(details.get("iban", "")) == normalise_iban(conn.get("iban", "")):
            target_account = acc_id
            break
    if not target_account:
        target_account = account_ids[0]

    raw_txs = await nordigen.get_transactions(target_account)

    existing_ext = {
        t["external_id"] for t in await db.select(
            "transactions",
            columns="external_id",
            filters={"bank_connection_id": connection_id},
        ) if t.get("external_id")
    }

    synced = 0
    for tx in raw_txs:
        external_id = tx.get("transactionId") or tx.get("internalTransactionId")
        if external_id and external_id in existing_ext:
            continue

        amount = float(tx.get("transactionAmount", {}).get("amount", 0))
        is_income = amount > 0
        description = tx.get("remittanceInformationUnstructured", "") or tx.get("additionalInformation", "")
        counterparty = tx.get("creditorName") or tx.get("debtorName") or ""
        date = tx.get("bookingDate") or tx.get("valueDate", "")

        classification = classify_transaction(description, counterparty)
        classification["btw_rate"] = canonical_btw_rate(classification.get("btw_rate"))

        await db.insert("transactions", {
            "bank_connection_id": connection_id,
            "external_id": external_id,
            "date": date,
            "amount": abs(amount),
            "description": description,
            "counterparty": counterparty,
            "is_income": is_income,
            **classification,
        })
        synced += 1

    return {"synced": synced}
