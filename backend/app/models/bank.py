from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class BankConnection(Base):
    __tablename__ = "bank_connections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    nordigen_requisition_id = Column(String, nullable=True)
    bank_name = Column(String, nullable=False)
    iban = Column(String, nullable=True)
    connected_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="bank_connections")
    transactions = relationship("Transaction", back_populates="bank_connection")


class BTWRate(str, enum.Enum):
    HIGH = "21%"
    LOW = "9%"
    ZERO = "0%"
    EXEMPT = "exempt"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    bank_connection_id = Column(Integer, ForeignKey("bank_connections.id"), nullable=False)
    external_id = Column(String, nullable=True, unique=True)
    date = Column(DateTime(timezone=True), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    counterparty = Column(String, nullable=True)
    category = Column(String, nullable=True)
    btw_rate = Column(String, nullable=True)
    is_business = Column(Boolean, default=True)
    is_income = Column(Boolean, default=False)
    classified_by = Column(String, default="manual")  # "manual", "ai", "rule"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    bank_connection = relationship("BankConnection", back_populates="transactions")
