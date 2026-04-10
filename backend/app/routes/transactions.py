from fastapi import APIRouter, Depends, HTTPException

from app.database import SupabaseClient, get_db
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse, DashboardSummary
from app.auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=list[TransactionResponse])
async def list_transactions(
    limit: int = 50,
    offset: int = 0,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    # Get user's bank connections
    connections = await db.select("bank_connections", columns="id", filters={"user_id": user["id"]})
    if not connections:
        return []

    conn_ids = [c["id"] for c in connections]

    # Get transactions for those connections
    all_transactions = []
    for conn_id in conn_ids:
        txs = await db.select(
            "transactions",
            filters={"bank_connection_id": conn_id},
            order="date.desc",
            limit=limit,
            offset=offset,
        )
        all_transactions.extend(txs)

    # Sort by date descending and apply limit
    all_transactions.sort(key=lambda x: x.get("date", ""), reverse=True)
    return all_transactions[:limit]


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

    tx = await db.insert("transactions", data.model_dump(mode="json"))
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
    if not update_data:
        return txs[0]

    result = await db.update("transactions", {"id": transaction_id}, update_data)
    return result[0]


@router.get("/dashboard", response_model=DashboardSummary)
async def dashboard_summary(
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    # Get user's bank connections
    connections = await db.select("bank_connections", columns="id", filters={"user_id": user["id"]})

    if not connections:
        return DashboardSummary(
            total_income=0, total_expenses=0, btw_owed=0, profit=0, transaction_count=0
        )

    # Get all transactions
    all_transactions = []
    for conn in connections:
        txs = await db.select("transactions", filters={"bank_connection_id": conn["id"]})
        all_transactions.extend(txs)

    total_income = sum(t["amount"] for t in all_transactions if t.get("is_income"))
    total_expenses = sum(abs(t["amount"]) for t in all_transactions if not t.get("is_income"))
    btw_owed = round(total_income * 0.21 - total_expenses * 0.21, 2)

    return DashboardSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        btw_owed=btw_owed,
        profit=round(total_income - total_expenses, 2),
        transaction_count=len(all_transactions),
    )
