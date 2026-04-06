from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class BTWDeclaration(Base):
    __tablename__ = "btw_declarations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    year = Column(Integer, nullable=False)
    quarter = Column(Integer, nullable=False)  # 1-4
    total_income = Column(Float, default=0.0)
    total_expenses = Column(Float, default=0.0)
    btw_collected = Column(Float, default=0.0)  # BTW on income
    btw_paid = Column(Float, default=0.0)  # BTW on expenses
    btw_owed = Column(Float, default=0.0)  # collected - paid
    status = Column(String, default="draft")  # draft, calculated, submitted, accepted
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="btw_declarations")
