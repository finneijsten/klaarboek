"""Parse Dutch bank CSV exports into normalised transactions.

Supports the most common header variants from ING, Rabobank, ABN AMRO, Bunq,
Knab, and Revolut without requiring the user to pick a bank. We probe headers
to decide the layout. Each returned row is a dict ready for insertion into the
`transactions` table (minus bank_connection_id).
"""
from __future__ import annotations

import csv
import io
import re
from datetime import datetime
from typing import Iterable


_AMOUNT_RE = re.compile(r"[^0-9,.\-]")


def _parse_amount(raw: str) -> float:
    if raw is None:
        return 0.0
    s = _AMOUNT_RE.sub("", str(raw)).strip()
    if not s:
        return 0.0
    # Handle European "1.234,56" and international "1,234.56" / "1234.56"
    if "," in s and "." in s:
        if s.rfind(",") > s.rfind("."):
            s = s.replace(".", "").replace(",", ".")
        else:
            s = s.replace(",", "")
    elif "," in s:
        s = s.replace(".", "").replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return 0.0


def _parse_date(raw: str) -> str | None:
    if not raw:
        return None
    raw = str(raw).strip()
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%Y%m%d", "%d/%m/%Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(raw, fmt).date().isoformat()
        except ValueError:
            continue
    return None


def _pick(row: dict, *keys: str) -> str:
    for k in keys:
        for rk in row:
            if rk and rk.strip().lower() == k.lower():
                val = row[rk]
                if val:
                    return str(val).strip()
    return ""


def parse_csv(data: bytes | str) -> list[dict]:
    """Parse bytes/text of a CSV export into transaction dicts.

    Each dict has: date, amount (positive magnitude), description, counterparty,
    is_income, external_id (optional).
    """
    text = data.decode("utf-8-sig", errors="replace") if isinstance(data, bytes) else data
    # Sniff delimiter among comma/semicolon/tab.
    sample = text[:2048]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
    except csv.Error:
        class _D(csv.Dialect):
            delimiter = ","
            quotechar = '"'
            doublequote = True
            skipinitialspace = True
            lineterminator = "\n"
            quoting = csv.QUOTE_MINIMAL
        dialect = _D()

    reader = csv.DictReader(io.StringIO(text), dialect=dialect)
    return [row for row in (_normalise_row(r) for r in reader) if row]


def _normalise_row(row: dict) -> dict | None:
    # Date
    date = _parse_date(
        _pick(row, "Date", "Datum", "Transactiedatum", "Started Date", "Boekdatum")
    )
    if not date:
        return None

    # Amount — some banks have separate "Af Bij" column, ING has "Af Bij" with
    # a signed "Bedrag (EUR)".
    raw_amount = _pick(
        row, "Amount", "Bedrag", "Bedrag (EUR)", "Bedrag EUR", "Amount (EUR)",
    )
    amount = _parse_amount(raw_amount)

    # Direction: ING uses "Af Bij" (Af=out, Bij=in). Rabobank has "Af Bij Code".
    direction = _pick(row, "Af Bij", "Debit/credit", "Af/Bij", "Type")
    if direction:
        dir_l = direction.strip().lower()
        if dir_l in ("af", "debit", "dr", "d", "uitgaand"):
            amount = -abs(amount)
        elif dir_l in ("bij", "credit", "cr", "c", "inkomend"):
            amount = abs(amount)

    if amount == 0.0:
        return None

    is_income = amount > 0
    amount = abs(amount)

    description = _pick(
        row, "Description", "Omschrijving", "Mededelingen", "Notificaties",
        "Details", "Naam / Omschrijving",
    )
    counterparty = _pick(
        row, "Counterparty", "Tegenrekening", "Naam tegenpartij",
        "Name", "Merchant", "Beneficiary",
    )
    external_id = _pick(
        row, "Transaction ID", "Volgnr", "Reference", "Reference number",
    ) or None

    return {
        "date": date,
        "amount": amount,
        "is_income": is_income,
        "description": description or None,
        "counterparty": counterparty or None,
        "external_id": external_id,
    }


def dedupe(rows: Iterable[dict], existing_ext_ids: set[str]) -> list[dict]:
    out = []
    seen = set(existing_ext_ids)
    for row in rows:
        ext = row.get("external_id")
        if ext and ext in seen:
            continue
        if ext:
            seen.add(ext)
        out.append(row)
    return out
