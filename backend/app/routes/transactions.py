from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.database import SupabaseClient, get_db
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse, DashboardSummary
from app.auth import get_current_user
from app.classifier import classify_transaction
from app.btw import canonical_btw_rate, summarise_transactions


def _period_range(period: str, today: date | None = None) -> tuple[str | None, str | None]:
    """Return (iso_start, iso_end_exclusive) for a named period, or (None, None)
    for 'all'. `today` is injectable for deterministic tests."""
    today = today or datetime.now(timezone.utc).date()
    if period == "month":
        start = today.replace(day=1)
        if start.month == 12:
            end = start.replace(year=start.year + 1, month=1)
        else:
            end = start.replace(month=start.month + 1)
        return start.isoformat(), end.isoformat()
    if period == "quarter":
        q = (today.month - 1) // 3
        start = today.replace(month=q * 3 + 1, day=1)
        end_month = start.month + 3
        if end_month > 12:
            end = start.replace(year=start.year + 1, month=end_month - 12)
        else:
            end = start.replace(month=end_month)
        return start.isoformat(), end.isoformat()
    if period == "ytd":
        return today.replace(month=1, day=1).isoformat(), today.replace(
            year=today.year + 1, month=1, day=1,
        ).isoformat()
    return None, None

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


@router.delete("/{transaction_id}", status_code=204)
async def delete_transaction(
    transaction_id: int,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    connections = await db.select("bank_connections", columns="id",
                                  filters={"user_id": user["id"]})
    conn_ids = [c["id"] for c in connections] if connections else []

    txs = await db.select("transactions", filters={"id": transaction_id})
    if not txs or txs[0].get("bank_connection_id") not in conn_ids:
        raise HTTPException(status_code=404, detail="Transactie niet gevonden")

    await db.delete("transactions", {"id": transaction_id})


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
    period: str = "quarter",
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    """Dashboard totals. `period` is one of month, quarter, ytd, all.

    Defaults to 'quarter' because BTW aangifte is quarterly."""
    if period not in ("month", "quarter", "ytd", "all"):
        raise HTTPException(status_code=400, detail="invalid period")

    txs = await _user_transactions(db, user["id"])
    start, end = _period_range(period)
    if start and end:
        txs = [t for t in txs if (t.get("date") or "") >= start and (t.get("date") or "") < end]

    summary = summarise_transactions(txs)
    return DashboardSummary(
        total_income=summary["total_income"],
        total_expenses=summary["total_expenses"],
        btw_owed=summary["btw_owed"],
        profit=summary["profit"],
        transaction_count=len(txs),
    )
