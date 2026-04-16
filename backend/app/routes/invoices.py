import re

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response

from app.database import SupabaseClient, get_db
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse
from app.auth import get_current_user
from app.pdf import generate_invoice_pdf

router = APIRouter(prefix="/invoices", tags=["invoices"])


_NUMBER_SUFFIX_RE = re.compile(r"(\d+)\s*$")


async def _next_invoice_number(db: SupabaseClient, user_id: int) -> str:
    """Generate the next invoice number for a user.

    Uses MAX(trailing integer) + 1 rather than count(*) so that deletions
    don't cause unique-constraint collisions.
    """
    existing = await db.select("invoices", columns="invoice_number",
                               filters={"user_id": user_id})
    highest = 0
    for inv in existing:
        num = inv.get("invoice_number") or ""
        m = _NUMBER_SUFFIX_RE.search(num)
        if m:
            try:
                highest = max(highest, int(m.group(1)))
            except ValueError:
                pass
    return f"KB-{user_id}-{highest + 1:04d}"


@router.get("/", response_model=list[InvoiceResponse])
async def list_invoices(
    limit: int = 50,
    offset: int = 0,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    invoices = await db.select(
        "invoices",
        filters={"user_id": user["id"]},
        order="created_at.desc",
        limit=limit,
        offset=offset,
    )
    return invoices


@router.post("/", response_model=InvoiceResponse, status_code=201)
async def create_invoice(
    data: InvoiceCreate,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    btw_amount = round(data.amount_excl_btw * (data.btw_rate / 100), 2)
    amount_incl_btw = round(data.amount_excl_btw + btw_amount, 2)

    invoice_number = data.invoice_number or await _next_invoice_number(db, user["id"])

    invoice = await db.insert("invoices", {
        "user_id": user["id"],
        "invoice_number": invoice_number,
        "client_name": data.client_name,
        "amount_excl_btw": data.amount_excl_btw,
        "btw_rate": data.btw_rate,
        "btw_amount": btw_amount,
        "amount_incl_btw": amount_incl_btw,
        "due_date": data.due_date,
        "is_paid": False,
    })
    return invoice


@router.patch("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: int,
    data: InvoiceUpdate,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    existing = await db.select("invoices", filters={"id": invoice_id, "user_id": user["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Factuur niet gevonden")

    update_data = data.model_dump(exclude_none=True)

    # Recalculate BTW if amounts changed
    if "amount_excl_btw" in update_data or "btw_rate" in update_data:
        excl = update_data.get("amount_excl_btw", existing[0]["amount_excl_btw"])
        rate = update_data.get("btw_rate", existing[0]["btw_rate"])
        update_data["btw_amount"] = round(excl * (rate / 100), 2)
        update_data["amount_incl_btw"] = round(excl + update_data["btw_amount"], 2)

    result = await db.update("invoices", {"id": invoice_id, "user_id": user["id"]}, update_data)
    return result[0]


@router.delete("/{invoice_id}", status_code=204)
async def delete_invoice(
    invoice_id: int,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    existing = await db.select("invoices", filters={"id": invoice_id, "user_id": user["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Factuur niet gevonden")

    await db.delete("invoices", {"id": invoice_id, "user_id": user["id"]})


@router.get("/{invoice_id}/pdf")
async def download_invoice_pdf(
    invoice_id: int,
    user: dict = Depends(get_current_user),
    db: SupabaseClient = Depends(get_db),
):
    existing = await db.select("invoices", filters={"id": invoice_id, "user_id": user["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Factuur niet gevonden")

    invoice = existing[0]
    pdf_bytes = generate_invoice_pdf(invoice, user)
    filename = f"factuur_{invoice.get('invoice_number', invoice_id)}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
