from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserCreate(BaseModel):
    email: str
    password: str
    kvk_number: str | None = None
    btw_number: str | None = None
    company_name: str | None = None


class UserResponse(BaseModel):
    id: int
    email: str
    kvk_number: str | None
    btw_number: str | None
    company_name: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
