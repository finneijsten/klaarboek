from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.user import User
from app.models.bank import Transaction, BankConnection
from app.schemas.transaction import TransactionCreate, TransactionResponse, DashboardSummary
from app.auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=list[TransactionResponse])
async def list_transactions(
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction)
        .join(BankConnection)
        .where(BankConnection.user_id == user.id)
        .order_by(Transaction.date.desc())
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()


@router.post("/", response_model=TransactionResponse, status_code=201)
async def create_transaction(
    data: TransactionCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify bank connection belongs to user
    result = await db.execute(
        select(BankConnection).where(
            BankConnection.id == data.bank_connection_id,
            BankConnection.user_id == user.id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Bank connection not found")

    tx = Transaction(**data.model_dump())
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return tx


@router.get("/dashboard", response_model=DashboardSummary)
async def dashboard_summary(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    base_query = (
        select(Transaction)
        .join(BankConnection)
        .where(BankConnection.user_id == user.id)
    )

    income_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .select_from(Transaction)
        .join(BankConnection)
        .where(BankConnection.user_id == user.id, Transaction.is_income == True)
    )
    total_income = float(income_result.scalar())

    expense_result = await db.execute(
        select(func.coalesce(func.sum(func.abs(Transaction.amount)), 0))
        .select_from(Transaction)
        .join(BankConnection)
        .where(BankConnection.user_id == user.id, Transaction.is_income == False)
    )
    total_expenses = float(expense_result.scalar())

    count_result = await db.execute(
        select(func.count(Transaction.id))
        .select_from(Transaction)
        .join(BankConnection)
        .where(BankConnection.user_id == user.id)
    )
    count = int(count_result.scalar())

    btw_owed = total_income * 0.21 - total_expenses * 0.21  # simplified

    return DashboardSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        btw_owed=round(btw_owed, 2),
        profit=round(total_income - total_expenses, 2),
        transaction_count=count,
    )
