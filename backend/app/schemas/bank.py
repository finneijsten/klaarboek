from pydantic import BaseModel
from datetime import datetime


class BankConnectionCreate(BaseModel):
    bank_name: str
    iban: str


class BankConnectionResponse(BaseModel):
    id: int
    user_id: int
    bank_name: str
    iban: str
    is_active: bool
    connected_at: datetime

    class Config:
        from_attributes = True
