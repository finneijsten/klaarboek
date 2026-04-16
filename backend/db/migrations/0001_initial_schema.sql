-- 0001_initial_schema.sql
-- Apply via Supabase SQL editor or psql.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    kvk_number VARCHAR,
    btw_number VARCHAR,
    company_name VARCHAR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

CREATE TABLE IF NOT EXISTS bank_connections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nordigen_requisition_id VARCHAR,
    bank_name VARCHAR NOT NULL,
    iban VARCHAR,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS bank_connections_user_idx ON bank_connections(user_id);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    bank_connection_id INTEGER NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,
    external_id VARCHAR,
    date TIMESTAMPTZ NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    description VARCHAR,
    counterparty VARCHAR,
    category VARCHAR,
    btw_rate VARCHAR,
    is_business BOOLEAN DEFAULT TRUE,
    is_income BOOLEAN DEFAULT FALSE,
    classified_by VARCHAR DEFAULT 'manual',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (bank_connection_id, external_id)
);
CREATE INDEX IF NOT EXISTS transactions_bank_conn_idx ON transactions(bank_connection_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_number VARCHAR NOT NULL,
    client_name VARCHAR NOT NULL,
    client_email VARCHAR,
    amount_excl_btw DOUBLE PRECISION NOT NULL,
    btw_rate VARCHAR NOT NULL DEFAULT '21',
    btw_amount DOUBLE PRECISION NOT NULL,
    amount_incl_btw DOUBLE PRECISION NOT NULL,
    description VARCHAR,
    issued_date TIMESTAMPTZ DEFAULT now(),
    due_date TIMESTAMPTZ,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMPTZ,
    matched_transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, invoice_number)
);
CREATE INDEX IF NOT EXISTS invoices_user_idx ON invoices(user_id);

CREATE TABLE IF NOT EXISTS btw_declarations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
    total_income DOUBLE PRECISION DEFAULT 0,
    total_expenses DOUBLE PRECISION DEFAULT 0,
    btw_collected DOUBLE PRECISION DEFAULT 0,
    btw_paid DOUBLE PRECISION DEFAULT 0,
    btw_owed DOUBLE PRECISION DEFAULT 0,
    status VARCHAR DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, year, quarter)
);

CREATE TABLE IF NOT EXISTS waitlist (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
