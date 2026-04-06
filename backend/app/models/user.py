from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    kvk_number = Column(String, nullable=True)
    btw_number = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    bank_connections = relationship("BankConnection", back_populates="user")
    invoices = relationship("Invoice", back_populates="user")
    btw_declarations = relationship("BTWDeclaration", back_populates="user")
