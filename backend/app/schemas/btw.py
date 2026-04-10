from pydantic import BaseModel
from datetime import datetime


class BTWDeclarationResponse(BaseModel):
    id: int
    user_id: int
    year: int
    quarter: int
    total_income: float
    total_expenses: float
    btw_collected: float
    btw_paid: float
    btw_owed: float
    status: str
    submitted_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class BTWCalculation(BaseModel):
    year: int
    quarter: int
    total_income: float
    total_expenses: float
    btw_collected: float
    btw_paid: float
    btw_owed: float
    transaction_count: int
