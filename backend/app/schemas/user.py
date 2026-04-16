from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=256)
    kvk_number: str | None = None
    btw_number: str | None = None
    company_name: str | None = None


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    kvk_number: str | None
    btw_number: str | None
    company_name: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    company_name: str | None = None
    kvk_number: str | None = None
    btw_number: str | None = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
