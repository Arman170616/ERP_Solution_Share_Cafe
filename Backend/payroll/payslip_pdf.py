from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A5
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def generate_payslip_pdf(payslip) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A5, topMargin=15 * mm, bottomMargin=15 * mm)
    styles = getSampleStyleSheet()
    employee = payslip.employee

    elements = [
        Paragraph("Share Cafe - Payslip", styles["Title"]),
        Paragraph(employee.user.get_full_name() or employee.user.username, styles["Normal"]),
        Paragraph(f"Position: {employee.position}", styles["Normal"]),
        Paragraph(f"Period: {payslip.period_start} to {payslip.period_end}", styles["Normal"]),
        Spacer(1, 10),
    ]

    rows = [
        ["Base salary", f"{payslip.base_salary:.3f}"],
        ["Overtime hours", f"{payslip.overtime_hours}"],
        ["Overtime amount", f"{payslip.overtime_amount:.3f}"],
        ["Bonus", f"{payslip.bonus:.3f}"],
        ["Deductions", f"-{payslip.deductions:.3f}"],
        ["Net salary", f"{payslip.net_salary:.3f}"],
    ]
    table = Table(rows, colWidths=[80 * mm, 40 * mm])
    table.setStyle(
        TableStyle(
            [
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("LINEABOVE", (0, -1), (-1, -1), 0.75, colors.black),
                ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ]
        )
    )
    elements.append(table)

    doc.build(elements)
    return buffer.getvalue()
