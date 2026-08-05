from decimal import Decimal

from hr.models import Attendance

# Baseline used to derive an hourly rate from a monthly base salary: 26 working
# days/month x 8 hours/day, a common Gulf-region payroll convention.
STANDARD_MONTHLY_HOURS = Decimal("208")
OVERTIME_MULTIPLIER = Decimal("1.5")
STANDARD_DAILY_HOURS = Decimal("8")


def calculate_payslip(employee, period_start, period_end, bonus=Decimal("0"), deductions=Decimal("0")):
    """Compute overtime and net salary for an employee over a period from Attendance records."""
    base_salary = employee.base_salary
    hourly_rate = base_salary / STANDARD_MONTHLY_HOURS if base_salary else Decimal("0")

    overtime_hours = Decimal("0")
    for record in Attendance.objects.filter(employee=employee, date__range=(period_start, period_end)):
        worked = Decimal(str(record.hours_worked))
        if worked > STANDARD_DAILY_HOURS:
            overtime_hours += worked - STANDARD_DAILY_HOURS

    overtime_amount = (overtime_hours * hourly_rate * OVERTIME_MULTIPLIER).quantize(Decimal("0.001"))
    net_salary = (base_salary + overtime_amount + bonus - deductions).quantize(Decimal("0.001"))

    return {
        "base_salary": base_salary,
        "overtime_hours": overtime_hours,
        "overtime_amount": overtime_amount,
        "bonus": bonus,
        "deductions": deductions,
        "net_salary": net_salary,
    }
