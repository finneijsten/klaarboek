from fastapi import APIRouter, Depends, HTTPException

from app.database import SupabaseClient, get_db
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse, DashboardSummary
from app.auth import get_current_user
from app.classifier import classify_transaction
from app.btw import canonical_btw_rate, summarise_transactions

router = APIRouter(prefix="/transactions", tags=["transactions"])


async def _user_transactions(db: SupabaseClient, user_id: int,
                             limit: int | None = None, offset: int = 0) -> list[dict]:
    """Fetch all transactions belonging to a user via their bank connections."""
    connections = await db.select("bank_connections", columns="id",
                                  filters={"user_id": user_id})
    if not connections:
        return []
    conn_ids = [c["id"] for c in connections]
    txs = await db.select(
        "transactions",
        filters={"bank_connection_id": {"in": f"({','.join(str(i) for i in conn_ids)})"}},
        order="date.desc",
        limit=limit,
        offset=offset,
    )
    return txs


@router.get("/", response_model=list[TransactionResponse])
async def list_transactions(
    limit: int = 50,
    offset: int = 0,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    return await _user_transactions(db, user["id"], limit=limit, offset=offset)


@router.post("/", response_model=TransactionResponse, status_code=201)
async def create_transaction(
    data: TransactionCreate,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    # Verify bank connection belongs to user
    connections = await db.select("bank_connections", filters={
        "id": data.bank_connection_id,
        "user_id": user["id"],
    })
    if not connections:
        raise HTTPException(status_code=404, detail="Bank connection not found")

    tx_data = data.model_dump(mode="json")

    # Store amount as magnitude; direction is on `is_income`.
    tx_data["amount"] = abs(float(tx_data.get("amount") or 0))

    # Auto-classify if no category provided. Only fill gaps — never overwrite
    # fields the caller explicitly set.
    if not tx_data.get("category"):
        classification = classify_transaction(tx_data.get("description"), tx_data.get("counterparty"))
        for k, v in classification.items():
            if tx_data.get(k) in (None, ""):
                tx_data[k] = v

    tx_data["btw_rate"] = canonical_btw_rate(tx_data.get("btw_rate"))

    tx = await db.insert("transactions", tx_data)
    return tx


@router.patch("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    data: TransactionUpdate,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    # Verify transaction belongs to user via bank connection
    connections = await db.select("bank_connections", columns="id", filters={"user_id": user["id"]})
    conn_ids = [c["id"] for c in connections] if connections else []

    txs = await db.select("transactions", filters={"id": transaction_id})
    if not txs or txs[0].get("bank_connection_id") not in conn_ids:
        raise HTTPException(status_code=404, detail="Transactie niet gevonden")

    update_data = data.model_dump(exclude_none=True)
    if "btw_rate" in update_data:
        update_data["btw_rate"] = canonical_btw_rate(update_data["btw_rate"])
    if not update_data:
        return txs[0]

    result = await db.update("transactions", {"id": transaction_id}, update_data)
    return result[0]


@router.post("/classify")
async def classify_all_transactions(
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    """Auto-classify all transactions without a category for the current user."""
    txs = await _user_transactions(db, user["id"])
    classified_count = 0
    for tx in txs:
        if tx.get("category"):
            continue
        result = classify_transaction(tx.get("description"), tx.get("counterparty"))
        if result.get("category"):
            result["btw_rate"] = canonical_btw_rate(result.get("btw_rate"))
            await db.update("transactions", {"id": tx["id"]}, result)
            classified_count += 1

    return {"classified": classified_count}


@router.get("/dashboard", response_model=DashboardSummary)
async def dashboard_summary(
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    all_transactions = await _user_transactions(db, user["id"])
    summary = summarise_transactions(all_transactions)
    return DashboardSummary(
        total_income=summary["total_income"],
        total_expenses=summary["total_expenses"],
        btw_owed=summary["btw_owed"],
        profit=summary["profit"],
        transaction_count=len(all_transactions),
    )
