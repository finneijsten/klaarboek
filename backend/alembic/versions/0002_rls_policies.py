"""Add Row-Level Security policies for all tables

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-10
"""
from typing import Sequence, Union
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable RLS on all tables
    op.execute("ALTER TABLE users ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE btw_declarations ENABLE ROW LEVEL SECURITY;")

    # Users: can only see/edit own row
    op.execute("""
        CREATE POLICY users_own ON users
        FOR ALL USING (id = current_setting('request.jwt.claim.sub', true)::int);
    """)

    # Bank connections: user can only access their own
    op.execute("""
        CREATE POLICY bank_connections_own ON bank_connections
        FOR ALL USING (user_id = current_setting('request.jwt.claim.sub', true)::int);
    """)

    # Transactions: user can access via their bank connections
    op.execute("""
        CREATE POLICY transactions_own ON transactions
        FOR ALL USING (
            bank_connection_id IN (
                SELECT id FROM bank_connections
                WHERE user_id = current_setting('request.jwt.claim.sub', true)::int
            )
        );
    """)

    # Invoices: user can only access their own
    op.execute("""
        CREATE POLICY invoices_own ON invoices
        FOR ALL USING (user_id = current_setting('request.jwt.claim.sub', true)::int);
    """)

    # BTW declarations: user can only access their own
    op.execute("""
        CREATE POLICY btw_declarations_own ON btw_declarations
        FOR ALL USING (user_id = current_setting('request.jwt.claim.sub', true)::int);
    """)

    # Waitlist: anyone can insert, only service role can read
    op.execute("""
        CREATE TABLE IF NOT EXISTS waitlist (
            id SERIAL PRIMARY KEY,
            email VARCHAR NOT NULL UNIQUE,
            created_at TIMESTAMPTZ DEFAULT now()
        );
    """)
    op.execute("ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;")
    op.execute("""
        CREATE POLICY waitlist_insert ON waitlist
        FOR INSERT WITH CHECK (true);
    """)
    op.execute("""
        CREATE POLICY waitlist_select ON waitlist
        FOR SELECT USING (false);
    """)


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS waitlist_select ON waitlist;")
    op.execute("DROP POLICY IF EXISTS waitlist_insert ON waitlist;")
    op.execute("DROP TABLE IF EXISTS waitlist;")
    op.execute("DROP POLICY IF EXISTS btw_declarations_own ON btw_declarations;")
    op.execute("DROP POLICY IF EXISTS invoices_own ON invoices;")
    op.execute("DROP POLICY IF EXISTS transactions_own ON transactions;")
    op.execute("DROP POLICY IF EXISTS bank_connections_own ON bank_connections;")
    op.execute("DROP POLICY IF EXISTS users_own ON users;")
    op.execute("ALTER TABLE btw_declarations DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE bank_connections DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE users DISABLE ROW LEVEL SECURITY;")
