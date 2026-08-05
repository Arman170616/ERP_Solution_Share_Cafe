from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A5
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet


def generate_invoice_pdf(invoice) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A5, topMargin=15 * mm, bottomMargin=15 * mm)
    styles = getSampleStyleSheet()
    order = invoice.order

    elements = [
        Paragraph("Share Cafe", styles["Title"]),
        Paragraph("Al Saada, Salalah, Oman", styles["Normal"]),
        Spacer(1, 8),
        Paragraph(f"Invoice: {invoice.invoice_number}", styles["Heading2"]),
        Paragraph(f"Date: {invoice.issued_at:%Y-%m-%d %H:%M}", styles["Normal"]),
        Paragraph(f"Order type: {order.get_order_type_display()}", styles["Normal"]),
        Spacer(1, 10),
    ]

    data = [["Item", "Qty", "Unit Price", "Subtotal"]]
    for item in order.items.all():
        data.append([item.product.name, str(item.quantity), f"{item.unit_price:.3f}", f"{item.subtotal:.3f}"])

    table = Table(data, colWidths=[70 * mm, 15 * mm, 25 * mm, 25 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f766e")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
            ]
        )
    )
    elements.append(table)
    elements.append(Spacer(1, 10))

    totals = [
        ["Subtotal", f"{order.subtotal:.3f}"],
        ["Discount", f"{order.discount_amount:.3f}"],
        [f"VAT ({order.tax_rate * 100:.0f}%)", f"{order.tax_amount:.3f}"],
        ["Total", f"{order.total:.3f}"],
    ]
    totals_table = Table(totals, colWidths=[110 * mm, 25 * mm])
    totals_table.setStyle(
        TableStyle(
            [
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
                ("LINEABOVE", (0, -1), (-1, -1), 0.75, colors.black),
                ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ]
        )
    )
    elements.append(totals_table)
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"Status: {invoice.get_status_display()}", styles["Normal"]))

    doc.build(elements)
    return buffer.getvalue()
