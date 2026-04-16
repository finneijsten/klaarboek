from fastapi import APIRouter, Depends, HTTPException

from app.database import SupabaseClient, get_db
from app.schemas.btw import BTWDeclarationResponse, BTWCalculation
from app.auth import get_current_user
from app.btw import summarise_transactions

router = APIRouter(prefix="/btw", tags=["btw"])


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


def _quarter_range(year: int, quarter: int) -> tuple[str, str]:
    month_start = (quarter - 1) * 3 + 1
    month_end = quarter * 3
    date_start = f"{year}-{month_start:02d}-01"
    if month_end == 12:
        date_end = f"{year + 1}-01-01"
    else:
        date_end = f"{year}-{month_end + 1:02d}-01"
    return date_start, date_end


async def _calculate(db: SupabaseClient, user_id: int, year: int, quarter: int) -> BTWCalculation:
    if quarter not in (1, 2, 3, 4):
        raise HTTPException(status_code=400, detail="Kwartaal moet 1-4 zijn")

    date_start, date_end = _quarter_range(year, quarter)
    connections = await db.select("bank_connections", columns="id",
                                  filters={"user_id": user_id})
    if not connections:
        return BTWCalculation(
            year=year, quarter=quarter,
            total_income=0, total_expenses=0,
            btw_collected=0, btw_paid=0, btw_owed=0,
            transaction_count=0,
        )

    conn_ids = [c["id"] for c in connections]
    txs = await db.select(
        "transactions",
        filters={
            "bank_connection_id": {"in": f"({','.join(str(i) for i in conn_ids)})"},
            "date": {"gte": date_start, "lt": date_end},
            "is_business": True,
        },
    )

    summary = summarise_transactions(txs)
    return BTWCalculation(
        year=year,
        quarter=quarter,
        total_income=summary["total_income"],
        total_expenses=summary["total_expenses"],
        btw_collected=summary["btw_collected"],
        btw_paid=summary["btw_paid"],
        btw_owed=summary["btw_owed"],
        transaction_count=len(txs),
    )


@router.get("/calculate", response_model=BTWCalculation)
async def calculate_btw(
    year: int,
    quarter: int,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    return await _calculate(db, user["id"], year, quarter)


@router.post("/declarations", response_model=BTWDeclarationResponse, status_code=201)
async def save_declaration(
    year: int,
    quarter: int,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    existing = await db.select("btw_declarations", filters={
        "user_id": user["id"], "year": year, "quarter": quarter,
    })
    if existing:
        raise HTTPException(status_code=400, detail="Aangifte voor dit kwartaal bestaat al")

    calc = await _calculate(db, user["id"], year, quarter)
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
