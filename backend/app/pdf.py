"""Invoice PDF generator using ReportLab."""
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def generate_invoice_pdf(invoice: dict, user: dict) -> bytes:
    """Generate a professional invoice PDF and return bytes."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                            topMargin=20 * mm, bottomMargin=20 * mm)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("InvoiceTitle", parent=styles["Heading1"],
                                  fontSize=24, textColor=colors.HexColor("#0D9668"),
                                  spaceAfter=10)
    normal = styles["Normal"]
    bold_style = ParagraphStyle("Bold", parent=normal, fontName="Helvetica-Bold")

    elements = []

    # Header
    elements.append(Paragraph("KLAARBOEK", title_style))
    elements.append(Spacer(1, 5 * mm))

    # Company info
    company_name = user.get("company_name") or "—"
    kvk = user.get("kvk_number") or "—"
    btw = user.get("btw_number") or "—"
    email = user.get("email") or "—"

    company_info = f"""
    <b>{company_name}</b><br/>
    KVK: {kvk}<br/>
    BTW: {btw}<br/>
    E-mail: {email}
    """
    elements.append(Paragraph(company_info, normal))
    elements.append(Spacer(1, 10 * mm))

    # Invoice details
    inv_number = invoice.get("invoice_number") or "—"
    client = invoice.get("client_name") or "—"
    created = invoice.get("created_at", "")[:10]
    due = invoice.get("due_date") or "—"
    if isinstance(due, str) and len(due) > 10:
        due = due[:10]

    details = f"""
    <b>Factuur: {inv_number}</b><br/>
    Klant: {client}<br/>
    Datum: {created}<br/>
    Vervaldatum: {due}
    """
    elements.append(Paragraph(details, normal))
    elements.append(Spacer(1, 10 * mm))

    # Line items table
    amount_excl = invoice.get("amount_excl_btw", 0)
    btw_rate = invoice.get("btw_rate", 21)
    btw_amount = invoice.get("btw_amount", 0)
    amount_incl = invoice.get("amount_incl_btw", 0)

    line_description = invoice.get("description") or f"Diensten voor {client}"
    data = [
        ["Omschrijving", "BTW", "Bedrag excl.", "BTW bedrag", "Bedrag incl."],
        [
            line_description,
            f"{btw_rate}%",
            f"\u20ac {amount_excl:,.2f}",
            f"\u20ac {btw_amount:,.2f}",
            f"\u20ac {amount_incl:,.2f}",
        ],
        ["", "", "", "", ""],
        [
            "", "", Paragraph("<b>Subtotaal</b>", bold_style), "",
            f"\u20ac {amount_excl:,.2f}",
        ],
        [
            "", "", Paragraph(f"<b>BTW ({btw_rate}%)</b>", bold_style), "",
            f"\u20ac {btw_amount:,.2f}",
        ],
        [
            "", "", Paragraph("<b>Totaal</b>", bold_style), "",
            Paragraph(f"<b>\u20ac {amount_incl:,.2f}</b>", bold_style),
        ],
    ]

    table = Table(data, colWidths=[60 * mm, 20 * mm, 30 * mm, 25 * mm, 30 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0D9668")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, 1), 0.5, colors.HexColor("#E0DCD5")),
        ("LINEBELOW", (2, 3), (-1, 3), 0.5, colors.HexColor("#E0DCD5")),
        ("LINEBELOW", (2, 4), (-1, 4), 0.5, colors.HexColor("#E0DCD5")),
        ("LINEBELOW", (2, 5), (-1, 5), 1, colors.HexColor("#0D9668")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 15 * mm))

    # Payment status
    is_paid = invoice.get("is_paid", False)
    status = "BETAALD" if is_paid else "OPENSTAAND"
    status_color = "#0D9668" if is_paid else "#E67E22"
    status_style = ParagraphStyle("Status", parent=styles["Heading2"],
                                   textColor=colors.HexColor(status_color))
    elements.append(Paragraph(f"Status: {status}", status_style))
    elements.append(Spacer(1, 10 * mm))

    # Footer
    footer_style = ParagraphStyle("Footer", parent=normal, fontSize=8,
                                   textColor=colors.HexColor("#636E72"))
    elements.append(Paragraph(
        f"Gegenereerd door KlaarBoek | {company_name} | KVK: {kvk} | BTW: {btw}",
        footer_style,
    ))

    doc.build(elements)
    return buffer.getvalue()
