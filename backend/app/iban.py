"""Lightweight IBAN validation for the banks endpoints.

Does basic shape + ISO 7064 mod-97 check. Not a full country-format check, but
catches typos like missing country code or extra digits which is the usual
failure mode.
"""
import re

_IBAN_RE = re.compile(r"^[A-Z]{2}\d{2}[A-Z0-9]+$")


def normalise_iban(raw: str) -> str:
    return re.sub(r"\s+", "", (raw or "")).upper()


def is_valid_iban(raw: str) -> bool:
    iban = normalise_iban(raw)
    if not iban or len(iban) < 15 or len(iban) > 34 or not _IBAN_RE.match(iban):
        return False
    # Move first 4 chars to end, convert letters to digits (A=10 ... Z=35).
    rearranged = iban[4:] + iban[:4]
    digits = "".join(str(ord(ch) - 55) if ch.isalpha() else ch for ch in rearranged)
    try:
        return int(digits) % 97 == 1
    except ValueError:
        return False
