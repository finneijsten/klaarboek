import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from app.database import SupabaseClient, get_db

router = APIRouter(prefix="/waitlist", tags=["waitlist"])
logger = logging.getLogger("klaarboek.waitlist")


class WaitlistSignup(BaseModel):
    email: EmailStr


@router.post("/", status_code=201)
async def join_waitlist(
    data: WaitlistSignup,
    db: SupabaseClient = Depends(get_db),
):
    email = data.email.lower().strip()

    existing = await db.select("waitlist", filters={"email": email})
    if existing:
        return {"message": "Je staat al op de wachtlijst!", "already_signed_up": True}

    try:
        await db.insert("waitlist", {"email": email})
    except Exception as e:
        # Log the real reason; return a generic 503 to the caller.
        logger.exception("Waitlist insert failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail="Waitlist is tijdelijk niet beschikbaar. Probeer het later opnieuw.",
        )

    return {"message": "Je bent aangemeld voor de wachtlijst!", "already_signed_up": False}
