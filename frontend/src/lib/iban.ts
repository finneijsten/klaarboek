// Client-side IBAN helpers. Basic shape check + ISO 7064 mod-97 validation,
// matching backend/app/iban.py so the form feedback doesn't disagree with the
// server.

export function normaliseIban(raw: string): string {
  return (raw || "").replace(/\s+/g, "").toUpperCase();
}

export function formatIban(raw: string): string {
  const n = normaliseIban(raw);
  // Group into 4-char blocks ("NL91 ABNA 0417 1643 00").
  return n.replace(/(.{4})/g, "$1 ").trim();
}

export function isValidIban(raw: string): boolean {
  const iban = normaliseIban(raw);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const digits = rearranged
    .split("")
    .map((ch) => (/[A-Z]/.test(ch) ? ch.charCodeAt(0) - 55 : ch))
    .join("");
  // BigInt so we don't lose precision on 30+ digit strings.
  try {
    return BigInt(digits) % 97n === 1n;
  } catch {
    return false;
  }
}
