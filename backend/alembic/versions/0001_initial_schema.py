"""Initial schema - all tables

Revision ID: 0001
Revises:
Create Date: 2026-04-07
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("email", sa.String(), unique=True, index=True, nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("kvk_number", sa.String(), nullable=True),
        sa.Column("btw_number", sa.String(), nullable=True),
        sa.Column("company_name", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Bank Connections
    op.create_table(
        "bank_connections",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("nordigen_requisition_id", sa.String(), nullable=True),
        sa.Column("bank_name", sa.String(), nullable=False),
        sa.Column("iban", sa.String(), nullable=True),
        sa.Column("connected_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("is_active", sa.Boolean(), default=True),
    )

    # Transactions
    op.create_table(
        "transactions",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("bank_connection_id", sa.Integer(), sa.ForeignKey("bank_connections.id"), nullable=False),
        sa.Column("external_id", sa.String(), unique=True, nullable=True),
        sa.Column("date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("counterparty", sa.String(), nullable=True),
        sa.Column("category", sa.String(), nullable=True),
        sa.Column("btw_rate", sa.String(), nullable=True),
        sa.Column("is_business", sa.Boolean(), default=True),
        sa.Column("is_income", sa.Boolean(), default=False),
        sa.Column("classified_by", sa.String(), default="manual"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Invoices
    op.create_table(
        "invoices",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("invoice_number", sa.String(), unique=True, nullable=False),
        sa.Column("client_name", sa.String(), nullable=False),
        sa.Column("client_email", sa.String(), nullable=True),
        sa.Column("amount_excl_btw", sa.Float(), nullable=False),
        sa.Column("btw_rate", sa.String(), nullable=False, server_default="21%"),
        sa.Column("btw_amount", sa.Float(), nullable=False),
        sa.Column("amount_incl_btw", sa.Float(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("issued_date", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_paid", sa.Boolean(), default=False),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("matched_transaction_id", sa.Integer(), sa.ForeignKey("transactions.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # BTW Declarations
    op.create_table(
        "btw_declarations",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("quarter", sa.Integer(), nullable=False),
        sa.Column("total_income", sa.Float(), default=0.0),
        sa.Column("total_expenses", sa.Float(), default=0.0),
        sa.Column("btw_collected", sa.Float(), default=0.0),
        sa.Column("btw_paid", sa.Float(), default=0.0),
        sa.Column("btw_owed", sa.Float(), default=0.0),
        sa.Column("status", sa.String(), server_default="draft"),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("btw_declarations")
    op.drop_table("invoices")
    op.drop_table("transactions")
    op.drop_table("bank_connections")
    op.drop_table("users")
