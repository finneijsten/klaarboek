-- Migration: 0003_add_fk_indexes
-- Applied: 2026-04-17 via Supabase MCP
-- Flagged by Supabase performance advisor after migration 0002.
-- Postgres does not auto-create indexes on FK columns; without them any JOIN or
-- ON DELETE CASCADE on these columns does a full sequential scan.

CREATE INDEX IF NOT EXISTS idx_bank_connections_user_id         ON bank_connections (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_bank_connection_id  ON transactions     (bank_connection_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id                 ON invoices         (user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_matched_transaction_id  ON invoices         (matched_transaction_id);
CREATE INDEX IF NOT EXISTS idx_btw_declarations_user_id         ON btw_declarations (user_id);
