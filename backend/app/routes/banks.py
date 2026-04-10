from fastapi import APIRouter, Depends, HTTPException

from app.database import SupabaseClient, get_db
from app.schemas.bank import BankConnectionCreate, BankConnectionResponse
from app.auth import get_current_user

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
