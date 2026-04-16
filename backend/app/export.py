"""Package a user's data as a ZIP of CSV/JSON files for GDPR export."""
from __future__ import annotations

import csv
import io
import json
import zipfile
from datetime import datetime, timezone

from app.database import SupabaseClient


def _csv_bytes(rows: list[dict], fieldnames: list[str]) -> bytes:
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    for row in rows:
        writer.writerow({k: (v if v is not None else "") for k, v in row.items()})
    return buf.getvalue().encode("utf-8")


async def build_export(db: SupabaseClient, user: dict) -> bytes:
    """Build a ZIP containing all of the user's data."""
    user_id = user["id"]

    bank_connections = await db.select(
        "bank_connections", filters={"user_id": user_id}, order="connected_at.asc",
    )
    conn_ids = [c["id"] for c in bank_connections]

    transactions: list[dict] = []
    if conn_ids:
        transactions = await db.select(
            "transactions",
            filters={"bank_connection_id": {"in": f"({','.join(str(i) for i in conn_ids)})"}},
            order="date.asc",
        )

    invoices = await db.select(
        "invoices", filters={"user_id": user_id}, order="created_at.asc",
    )
    declarations = await db.select(
        "btw_declarations", filters={"user_id": user_id}, order="year.asc,quarter.asc",
    )

    profile = {
        "id": user_id,
        "email": user.get("email"),
        "company_name": user.get("company_name"),
        "kvk_number": user.get("kvk_number"),
        "btw_number": user.get("btw_number"),
        "created_at": user.get("created_at"),
        "exported_at": datetime.now(timezone.utc).isoformat(),
    }

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("profile.json", json.dumps(profile, indent=2, default=str))
        z.writestr(
            "bank_connections.csv",
            _csv_bytes(bank_connections, [
                "id", "bank_name", "iban", "is_active", "connected_at",
            ]),
        )
        z.writestr(
            "transactions.csv",
            _csv_bytes(transactions, [
                "id", "bank_connection_id", "date", "amount", "is_income",
                "is_business", "description", "counterparty", "category",
                "btw_rate", "classified_by", "external_id", "created_at",
            ]),
        )
        z.writestr(
            "invoices.csv",
            _csv_bytes(invoices, [
                "id", "invoice_number", "client_name", "client_email",
                "amount_excl_btw", "btw_rate", "btw_amount", "amount_incl_btw",
                "description", "issued_date", "due_date", "is_paid", "paid_at",
                "matched_transaction_id", "created_at",
            ]),
        )
        z.writestr(
            "btw_declarations.csv",
            _csv_bytes(declarations, [
                "id", "year", "quarter", "total_income", "total_expenses",
                "btw_collected", "btw_paid", "btw_owed", "status",
                "submitted_at", "created_at",
            ]),
        )
        z.writestr(
            "README.txt",
            "KlaarBoek data export\n"
            f"User: {user.get('email')}\n"
            f"Exported at (UTC): {profile['exported_at']}\n\n"
            "Files:\n"
            "- profile.json      Your account details.\n"
            "- bank_connections.csv\n"
            "- transactions.csv\n"
            "- invoices.csv\n"
            "- btw_declarations.csv\n",
        )

    return buf.getvalue()
