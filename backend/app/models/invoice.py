from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    invoice_number = Column(String, unique=True, nullable=False)
    client_name = Column(String, nullable=False)
    client_email = Column(String, nullable=True)
    amount_excl_btw = Column(Float, nullable=False)
    btw_rate = Column(String, nullable=False, default="21%")
    btw_amount = Column(Float, nullable=False)
    amount_incl_btw = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    issued_date = Column(DateTime(timezone=True), server_default=func.now())
    due_date = Column(DateTime(timezone=True), nullable=True)
    is_paid = Column(Boolean, default=False)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    matched_transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="invoices")
