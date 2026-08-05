from django.conf import settings
from django.db import models


class Payslip(models.Model):
    employee = models.ForeignKey("hr.Employee", on_delete=models.CASCADE, related_name="payslips")
    period_start = models.DateField()
    period_end = models.DateField()
    base_salary = models.DecimalField(max_digits=10, decimal_places=3)
    overtime_hours = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    overtime_amount = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    bonus = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    deductions = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    net_salary = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-period_end"]
        unique_together = ("employee", "period_start", "period_end")

    def __str__(self):
        return f"Payslip {self.employee} {self.period_start}..{self.period_end}"
