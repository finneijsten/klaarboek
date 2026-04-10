from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.database import SupabaseClient, get_db
from fastapi import Depends

router = APIRouter(prefix="/waitlist", tags=["waitlist"])


class WaitlistSignup(BaseModel):
    email: str


@router.post("/", status_code=201)
async def join_waitlist(
    data: WaitlistSignup,
    db: SupabaseClient = Depends(get_db),
):
    try:
        # Check for duplicate
        existing = await db.select("waitlist", filters={"email": data.email})
        if existing:
            return {"message": "Je staat al op de wachtlijst!"}

        await db.insert("waitlist", {"email": data.email})
        return {"message": "Je bent aangemeld voor de wachtlijst!"}
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Waitlist is tijdelijk niet beschikbaar. Probeer het later opnieuw.",
        )
