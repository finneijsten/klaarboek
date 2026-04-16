"""Shared BTW (VAT) calculation helpers.

btw_rate values in the wild: "21", "21%", 21, 21.0, "9", "0", "exempt", None.
Everything funnels through `parse_btw_rate` -> Decimal percentage or None
(None == exempt / unknown, contributes 0 BTW).
"""
from decimal import Decimal, ROUND_HALF_UP

# Canonical codes stored in the DB. Anything else is coerced on read.
CANONICAL = {"21", "9", "0", "exempt"}

_D100 = Decimal("100")


def parse_btw_rate(raw) -> Decimal | None:
    """Return the BTW rate as a Decimal percentage (e.g. Decimal('21')),
    or None for exempt / unknown / missing."""
    if raw is None:
        return None
    if isinstance(raw, (int, float)):
        return Decimal(str(raw))
    s = str(raw).strip().rstrip("%")
    if not s or s.lower() == "exempt":
        return None
    try:
        return Decimal(s)
    except Exception:
        return None


def canonical_btw_rate(raw) -> str | None:
    """Canonicalise any incoming btw_rate to one of CANONICAL, or None."""
    rate = parse_btw_rate(raw)
    if rate is None:
        if raw is not None and str(raw).strip().lower() == "exempt":
            return "exempt"
        return None
    if rate == 21:
        return "21"
    if rate == 9:
        return "9"
    if rate == 0:
        return "0"
    # Non-standard rate — store the numeric string.
    return str(rate.normalize())


def _q2(d: Decimal) -> float:
    return float(d.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def btw_from_gross(amount: float | Decimal, rate_pct: Decimal | None) -> Decimal:
    """Given a gross (incl. BTW) amount and a rate percentage, return the BTW portion."""
    if rate_pct is None or rate_pct == 0:
        return Decimal("0")
    amt = Decimal(str(amount))
    return amt * rate_pct / (_D100 + rate_pct)


def summarise_transactions(transactions: list[dict]) -> dict:
    """Walk a transaction list and produce consistent totals + BTW.

    Assumes transaction `amount` is positive (magnitude) and `is_income` gives
    direction. Non-business transactions are excluded from BTW totals but kept
    in income/expense? No — for BTW purposes we exclude non-business.
    For dashboard income/expense we include everything flagged business=True.
    """
    total_income = Decimal("0")
    total_expenses = Decimal("0")
    btw_collected = Decimal("0")
    btw_paid = Decimal("0")

    for tx in transactions:
        if not tx.get("is_business", True):
            continue
        amount = Decimal(str(abs(float(tx.get("amount") or 0))))
        rate = parse_btw_rate(tx.get("btw_rate"))
        btw = btw_from_gross(amount, rate)
        if tx.get("is_income"):
            total_income += amount
            btw_collected += btw
        else:
            total_expenses += amount
            btw_paid += btw

    return {
        "total_income": _q2(total_income),
        "total_expenses": _q2(total_expenses),
        "btw_collected": _q2(btw_collected),
        "btw_paid": _q2(btw_paid),
        "btw_owed": _q2(btw_collected - btw_paid),
        "profit": _q2(total_income - total_expenses),
    }
