from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.database import SupabaseClient, get_db
from app.schemas.user import UserCreate, UserUpdate, UserResponse, Token
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(user_data: UserCreate, db: SupabaseClient = Depends(get_db)):
    existing = await db.select("users", filters={"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = await db.insert("users", {
        "email": user_data.email,
        "hashed_password": hash_password(user_data.password),
        "kvk_number": user_data.kvk_number,
        "btw_number": user_data.btw_number,
        "company_name": user_data.company_name,
    })
    return user


@router.post("/login", response_model=Token)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: SupabaseClient = Depends(get_db)):
    users = await db.select("users", filters={"email": form.username})

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
