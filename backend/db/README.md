# Database migrations

KlaarBoek talks to Supabase through PostgREST (see `app/database.py`), so there
is no SQLAlchemy/Alembic in the runtime. Schema changes are kept as plain SQL
files in `db/migrations/` and applied via the Supabase SQL editor or `psql`.

## Applying migrations

From the Supabase dashboard → SQL editor, paste each file in order (lowest
numeric prefix first) and run. Alternatively:

```sh
psql "$SUPABASE_DB_URL" -f backend/db/migrations/0001_initial_schema.sql
```

where `SUPABASE_DB_URL` is the connection string from Supabase → Project
Settings → Database.

## Multi-tenant isolation

The backend authenticates with the **service_role** key, which bypasses Row
Level Security. Per-user isolation is enforced in Python route handlers by
always filtering on `user_id` (or the user's `bank_connection_id` for
transactions). Do NOT add endpoints that read or write rows without such a
filter.

If you later move to per-user JWT auth against PostgREST, re-enable RLS on all
tables and add policies that match `user_id = auth.uid()`. Those policies are
intentionally *not* included in the initial migration because they would be
pure theatre against a service_role client.
