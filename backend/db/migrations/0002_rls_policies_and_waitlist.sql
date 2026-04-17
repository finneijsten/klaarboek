-- Migration: 0002_rls_policies_and_waitlist
-- Applied: 2026-04-17 via Supabase MCP
--
-- Creates the missing `waitlist` table (the /waitlist/ endpoint referenced it
-- but it was never migrated, causing every signup to silently 503).
--
-- Also adds explicit RESTRICTIVE deny-all policies on all tables.
-- Architecture note: all DB access goes through the FastAPI backend using the
-- Supabase service_role key, which bypasses RLS entirely. KlaarBoek uses its
-- own JWT (not Supabase Auth), so auth.uid() is always NULL for these tables.
-- RLS was already ENABLED from migration 0001 with no policies, which already
-- denies all anon/authenticated access by default. These policies make that
-- intent explicit and prevent accidental permissive additions.

CREATE TABLE IF NOT EXISTS waitlist (
  id           serial       PRIMARY KEY,
  email        varchar(255) NOT NULL UNIQUE,
  signed_up_at timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Explicit deny-all for every table ----------------------------------------

CREATE POLICY "deny_anon"          ON users            AS RESTRICTIVE FOR ALL TO anon          USING (false) WITH CHECK (false);
CREATE POLICY "deny_authenticated" ON users            AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "deny_anon"          ON bank_connections AS RESTRICTIVE FOR ALL TO anon          USING (false) WITH CHECK (false);
CREATE POLICY "deny_authenticated" ON bank_connections AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "deny_anon"          ON transactions     AS RESTRICTIVE FOR ALL TO anon          USING (false) WITH CHECK (false);
CREATE POLICY "deny_authenticated" ON transactions     AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "deny_anon"          ON invoices         AS RESTRICTIVE FOR ALL TO anon          USING (false) WITH CHECK (false);
CREATE POLICY "deny_authenticated" ON invoices         AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "deny_anon"          ON btw_declarations AS RESTRICTIVE FOR ALL TO anon          USING (false) WITH CHECK (false);
CREATE POLICY "deny_authenticated" ON btw_declarations AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "deny_anon"          ON waitlist         AS RESTRICTIVE FOR ALL TO anon          USING (false) WITH CHECK (false);
CREATE POLICY "deny_authenticated" ON waitlist         AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);
