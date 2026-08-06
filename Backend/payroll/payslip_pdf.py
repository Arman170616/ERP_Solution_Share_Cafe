from io import BytesIO
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A5
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

LOGO_PATH = Path(__file__).resolve().parent / "assets" / "share-logo.png"
BRAND_COLOR = colors.HexColor("#0f766e")


def generate_payslip_pdf(payslip) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A5, topMargin=14 * mm, bottomMargin=14 * mm)
    styles = getSampleStyleSheet()
    right_style = ParagraphStyle("right", parent=styles["Normal"], alignment=TA_RIGHT)
    muted_style = ParagraphStyle("muted", parent=styles["Normal"], textColor=colors.grey, fontSize=8)

    employee = payslip.employee
    user = employee.user
    employee_name = user.get_full_name() or user.username
    generated_by_name = None
    if payslip.generated_by:
        generated_by_name = payslip.generated_by.get_full_name() or payslip.generated_by.username

    # Letterhead: real logo + company details on the left, "PAYSLIP" + reference on the right.
    logo = Image(str(LOGO_PATH), width=16 * mm, height=16 * mm) if LOGO_PATH.exists() else Paragraph("", styles["Normal"])
    letterhead_left = [
        [logo, Paragraph("<b>Share Cafe</b>", styles["Heading2"])],
    ]
    logo_table = Table(letterhead_left, colWidths=[18 * mm, 60 * mm])
    logo_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 0)]))

    header = Table(
        [
            [
                logo_table,
                Paragraph(f"<b>PAYSLIP</b><br/>Ref #{payslip.id}", right_style),
            ]
        ],
        colWidths=[90 * mm, 40 * mm],
    )
    header.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))

    elements = [
        header,
        Paragraph("Al Saada, Salalah, Oman", muted_style),
        Spacer(1, 10),
    ]

    # Employee + period details, two columns.
    details = Table(
        [
            ["Employee", employee_name, "Pay period", f"{payslip.period_start} to {payslip.period_end}"],
            ["Position", employee.position, "Employee since", str(employee.hire_date)],
            ["Username", user.username, "Payslip date", payslip.generated_at.strftime("%Y-%m-%d")],
        ],
        colWidths=[24 * mm, 44 * mm, 28 * mm, 34 * mm],
    )
    details.setStyle(
        TableStyle(
            [
                ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.grey),
                ("TEXTCOLOR", (2, 0), (2, -1), colors.grey),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("LINEBELOW", (0, -1), (-1, -1), 0.5, colors.HexColor("#e5e5e5")),
            ]
        )
    )
    elements.append(details)
    elements.append(Spacer(1, 12))

    rows = [
        ["Earnings / deductions", "Amount (OMR)"],
        ["Base salary", f"{payslip.base_salary:.3f}"],
        [f"Overtime ({payslip.overtime_hours}h)", f"{payslip.overtime_amount:.3f}"],
        ["Bonus", f"{payslip.bonus:.3f}"],
        ["Deductions", f"-{payslip.deductions:.3f}"],
        ["Net salary", f"{payslip.net_salary:.3f}"],
    ]
    table = Table(rows, colWidths=[80 * mm, 40 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BRAND_COLOR),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("LINEABOVE", (0, -1), (-1, -1), 0.75, colors.black),
                ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#f0fdfa")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    elements.append(table)
    elements.append(Spacer(1, 14))

    footer_bits = [f"Generated {payslip.generated_at:%Y-%m-%d %H:%M}"]
    if generated_by_name:
        footer_bits.append(f"by {generated_by_name}")
    elements.append(Paragraph(" &middot; ".join(footer_bits), muted_style))
    elements.append(Paragraph("This is a system-generated payslip from Share Cafe's payroll records.", muted_style))

    doc.build(elements)
    return buffer.getvalue()
