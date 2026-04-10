from fastapi import APIRouter, Depends, HTTPException

from app.database import SupabaseClient, get_db
from app.schemas.btw import BTWDeclarationResponse, BTWCalculation
from app.auth import get_current_user

router = APIRouter(prefix="/btw", tags=["btw"])

BTW_RATES = {"21": 0.21, "9": 0.09, "0": 0.0}


@router.get("/declarations", response_model=list[BTWDeclarationResponse])
async def list_declarations(
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    declarations = await db.select(
        "btw_declarations",
        filters={"user_id": user["id"]},
        order="year.desc,quarter.desc",
    )
    return declarations


@router.get("/calculate", response_model=BTWCalculation)
async def calculate_btw(
    year: int,
    quarter: int,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    if quarter not in (1, 2, 3, 4):
        raise HTTPException(status_code=400, detail="Kwartaal moet 1-4 zijn")

    # Quarter date ranges
    month_start = (quarter - 1) * 3 + 1
    month_end = quarter * 3
    date_start = f"{year}-{month_start:02d}-01"
    if month_end == 12:
        date_end = f"{year + 1}-01-01"
    else:
        date_end = f"{year}-{month_end + 1:02d}-01"

    # Get user's bank connections
    connections = await db.select("bank_connections", columns="id", filters={"user_id": user["id"]})
    if not connections:
        return BTWCalculation(
            year=year, quarter=quarter,
            total_income=0, total_expenses=0,
            btw_collected=0, btw_paid=0, btw_owed=0,
            transaction_count=0,
        )

    # Get transactions for the quarter
    all_transactions = []
    for conn in connections:
        txs = await db.select(
            "transactions",
            filters={
                "bank_connection_id": conn["id"],
                "date": {"gte": date_start, "lt": date_end},
                "is_business": True,
            },
        )
        all_transactions.extend(txs)

    total_income = 0.0
    total_expenses = 0.0
    btw_collected = 0.0
    btw_paid = 0.0

    for tx in all_transactions:
        rate = BTW_RATES.get(tx.get("btw_rate", "21"), 0.21)
        amount = abs(tx["amount"])

        if tx.get("is_income"):
            total_income += amount
            btw_collected += round(amount * rate / (1 + rate), 2)
        else:
            total_expenses += amount
            btw_paid += round(amount * rate / (1 + rate), 2)

    return BTWCalculation(
        year=year,
        quarter=quarter,
        total_income=round(total_income, 2),
        total_expenses=round(total_expenses, 2),
        btw_collected=round(btw_collected, 2),
        btw_paid=round(btw_paid, 2),
        btw_owed=round(btw_collected - btw_paid, 2),
        transaction_count=len(all_transactions),
    )


@router.post("/declarations", response_model=BTWDeclarationResponse, status_code=201)
async def save_declaration(
    year: int,
    quarter: int,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    # Check if declaration already exists
    existing = await db.select("btw_declarations", filters={
        "user_id": user["id"], "year": year, "quarter": quarter,
    })
    if existing:
        raise HTTPException(status_code=400, detail="Aangifte voor dit kwartaal bestaat al")

    # Calculate first
    calc = await calculate_btw(year, quarter, user, db)

    declaration = await db.insert("btw_declarations", {
        "user_id": user["id"],
        "year": year,
        "quarter": quarter,
        "total_income": calc.total_income,
        "total_expenses": calc.total_expenses,
        "btw_collected": calc.btw_collected,
        "btw_paid": calc.btw_paid,
        "btw_owed": calc.btw_owed,
        "status": "concept",
    })
    return declaration
