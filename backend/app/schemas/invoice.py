from pydantic import BaseModel
from datetime import datetime


class InvoiceCreate(BaseModel):
    client_name: str
    invoice_number: str | None = None
    amount_excl_btw: float
    btw_rate: float = 21.0
    due_date: str | None = None


class InvoiceUpdate(BaseModel):
    client_name: str | None = None
    amount_excl_btw: float | None = None
    btw_rate: float | None = None
    due_date: str | None = None
    is_paid: bool | None = None
    matched_transaction_id: int | None = None


class InvoiceResponse(BaseModel):
    id: int
    user_id: int
    invoice_number: str | None
    client_name: str
    amount_excl_btw: float
    btw_rate: float
    btw_amount: float
    amount_incl_btw: float
    due_date: str | None
    is_paid: bool
    matched_transaction_id: int | None
    created_at: datetime

    class Config:
        from_attributes = True
