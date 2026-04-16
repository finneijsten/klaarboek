from datetime import datetime

from pydantic import BaseModel, field_validator

from app.iban import is_valid_iban, normalise_iban


class BankConnectionCreate(BaseModel):
    bank_name: str
    iban: str

    @field_validator("iban")
    @classmethod
    def _check_iban(cls, v: str) -> str:
        v = normalise_iban(v)
        if not is_valid_iban(v):
            raise ValueError("IBAN is niet geldig")
        return v

    @field_validator("bank_name")
    @classmethod
    def _check_bank(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("Bank is verplicht")
        return v


class BankConnectionResponse(BaseModel):
    id: int
    user_id: int
    bank_name: str
    iban: str
    is_active: bool
    connected_at: datetime

    class Config:
        from_attributes = True
