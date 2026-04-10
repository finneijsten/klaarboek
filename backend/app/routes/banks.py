from fastapi import APIRouter, Depends, HTTPException

from app.database import SupabaseClient, get_db
from app.schemas.bank import BankConnectionCreate, BankConnectionResponse
from app.auth import get_current_user
from app.nordigen import nordigen
from app.classifier import classify_transaction

router = APIRouter(prefix="/banks", tags=["banks"])


@router.get("/", response_model=list[BankConnectionResponse])
async def list_bank_connections(
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    connections = await db.select(
        "bank_connections",
        filters={"user_id": user["id"]},
        order="connected_at.desc",
    )
    return connections


@router.post("/", response_model=BankConnectionResponse, status_code=201)
async def create_bank_connection(
    data: BankConnectionCreate,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    # Check for duplicate IBAN
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

    await db.delete("bank_connections", {"id": connection_id, "user_id": user["id"]})


@router.get("/institutions")
async def list_institutions(country: str = "NL"):
    """List available banks via Nordigen/GoCardless."""
    institutions = await nordigen.list_institutions(country)
    return [{"id": i["id"], "name": i["name"], "logo": i.get("logo")} for i in institutions]


@router.post("/connect")
async def start_bank_connection(
    institution_id: str,
    redirect_url: str = "http://localhost:3000/settings",
    user: dict = Depends(get_current_user),
):
    """Start PSD2 bank authorization flow. Returns a link for the user to authorize."""
    requisition = await nordigen.create_requisition(institution_id, redirect_url)
    return {
        "requisition_id": requisition["id"],
        "link": requisition["link"],
    }


@router.post("/callback")
async def complete_bank_connection(
    requisition_id: str,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    """Complete bank connection after user authorization. Creates bank_connection records."""
    req = await nordigen.get_requisition(requisition_id)

    if req.get("status") != "LN":
        raise HTTPException(status_code=400, detail=f"Autorisatie niet voltooid (status: {req.get('status')})")

    account_ids = req.get("accounts", [])
    created = []

    for account_id in account_ids:
        details = await nordigen.get_account_details(account_id)
        iban = details.get("iban", "")
        bank_name = details.get("ownerName", req.get("institution_id", "Onbekend"))

        # Skip if already connected
        existing = await db.select("bank_connections", filters={"user_id": user["id"], "iban": iban})
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
    """Sync latest transactions from the bank via Nordigen."""
    connections = await db.select("bank_connections", filters={
        "id": connection_id, "user_id": user["id"],
    })
    if not connections:
        raise HTTPException(status_code=404, detail="Bankverbinding niet gevonden")

    conn = connections[0]
    req_id = conn.get("nordigen_requisition_id")
    if not req_id:
        raise HTTPException(status_code=400, detail="Geen Nordigen koppeling voor deze rekening")

    # Get account ID from requisition
    req = await nordigen.get_requisition(req_id)
    account_ids = req.get("accounts", [])
    if not account_ids:
        raise HTTPException(status_code=400, detail="Geen accounts gevonden")

    # Find the matching account by IBAN
    target_account = None
    for acc_id in account_ids:
        details = await nordigen.get_account_details(acc_id)
        if details.get("iban") == conn.get("iban"):
            target_account = acc_id
            break

    if not target_account:
        target_account = account_ids[0]

    # Fetch transactions
    raw_txs = await nordigen.get_transactions(target_account)

    synced = 0
    for tx in raw_txs:
        external_id = tx.get("transactionId") or tx.get("internalTransactionId")

        # Skip if already imported
        if external_id:
            existing = await db.select("transactions", filters={"external_id": external_id})
            if existing:
                continue

        amount = float(tx.get("transactionAmount", {}).get("amount", 0))
        is_income = amount > 0
        description = tx.get("remittanceInformationUnstructured", "") or tx.get("additionalInformation", "")
        counterparty = tx.get("creditorName") or tx.get("debtorName") or ""
        date = tx.get("bookingDate") or tx.get("valueDate", "")

        classification = classify_transaction(description, counterparty)

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
