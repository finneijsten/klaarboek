from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from fastapi.security import OAuth2PasswordRequestForm

from app.database import SupabaseClient, get_db
from app.schemas.user import UserCreate, UserUpdate, UserResponse, Token
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.export import build_export

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(user_data: UserCreate, db: SupabaseClient = Depends(get_db)):
    email = user_data.email.lower().strip()
    existing = await db.select("users", filters={"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = await db.insert("users", {
        "email": email,
        "hashed_password": hash_password(user_data.password),
        "kvk_number": user_data.kvk_number,
        "btw_number": user_data.btw_number,
        "company_name": user_data.company_name,
    })
    return user


@router.post("/login", response_model=Token)
async def login(form: OAuth2PasswordRequestForm = Depends(),
                db: SupabaseClient = Depends(get_db)):
    users = await db.select("users", filters={"email": form.username.lower().strip()})

    if not users or not verify_password(form.password, users[0]["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = users[0]
    token = create_access_token({"sub": str(user["id"])})
    return Token(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_profile(user: dict = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    data: UserUpdate,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        return user

    result = await db.update("users", {"id": user["id"]}, update_data)
    return result[0]


@router.get("/export")
async def export_my_data(
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    """Download a ZIP of the authenticated user's data (GDPR portability)."""
    zip_bytes = await build_export(db, user)
    filename = f"klaarboek-export-{user['id']}.zip"
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.delete("/me", status_code=204)
async def delete_my_account(
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    """Permanently delete the authenticated user and all their data (GDPR)."""
    user_id = user["id"]

    # Fetch dependent keys first so we can walk the graph even if the DB lacks
    # ON DELETE CASCADE.
    connections = await db.select("bank_connections", columns="id",
                                  filters={"user_id": user_id})
    for conn in connections:
        await db.delete("transactions", {"bank_connection_id": conn["id"]})

    await db.delete("bank_connections", {"user_id": user_id})
    await db.delete("invoices", {"user_id": user_id})
    await db.delete("btw_declarations", {"user_id": user_id})
    await db.delete("users", {"id": user_id})
