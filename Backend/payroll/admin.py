from django.contrib import admin

from .models import Payslip


@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = ("employee", "period_start", "period_end", "net_salary", "generated_at")
    search_fields = ("employee__user__username",)
