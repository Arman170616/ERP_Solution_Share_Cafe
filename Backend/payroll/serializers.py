from decimal import Decimal

from rest_framework import serializers

from hr.models import Employee

from .models import Payslip


class PayslipSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_username = serializers.CharField(source="employee.user.username", read_only=True)
    generated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Payslip
        fields = [
            "id",
            "employee",
            "employee_name",
            "employee_username",
            "period_start",
            "period_end",
            "base_salary",
            "overtime_hours",
            "overtime_amount",
            "bonus",
            "deductions",
            "net_salary",
            "generated_by",
            "generated_by_name",
            "generated_at",
        ]
        read_only_fields = [
            "base_salary",
            "overtime_hours",
            "overtime_amount",
            "net_salary",
            "generated_by",
            "generated_at",
        ]

    def get_employee_name(self, obj):
        # Demo/real accounts here often have no first/last name set (username-only), so
        # fall back rather than showing a blank "Employee" cell on the HR payroll table.
        return obj.employee.user.get_full_name() or obj.employee.user.username

    def get_generated_by_name(self, obj):
        if not obj.generated_by:
            return None
        return obj.generated_by.get_full_name() or obj.generated_by.username


class GeneratePayslipSerializer(serializers.Serializer):
    employee = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all())
    period_start = serializers.DateField()
    period_end = serializers.DateField()
    bonus = serializers.DecimalField(max_digits=10, decimal_places=3, default=Decimal("0"))
    deductions = serializers.DecimalField(max_digits=10, decimal_places=3, default=Decimal("0"))
