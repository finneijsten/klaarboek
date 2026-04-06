from pydantic import BaseModel
from datetime import datetime


class TransactionCreate(BaseModel):
    bank_connection_id: int
    date: datetime
    amount: float
    description: str | None = None
    counterparty: str | None = None
    category: str | None = None
    btw_rate: str | None = None
    is_business: bool = True
    is_income: bool = False


class TransactionResponse(BaseModel):
    id: int
    bank_connection_id: int
    date: datetime
    amount: float
    description: str | None
    counterparty: str | None
    category: str | None
    btw_rate: str | None
    is_business: bool
    is_income: bool
    classified_by: str
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    total_income: float
    total_expenses: float
    btw_owed: float
    profit: float
    transaction_count: int
