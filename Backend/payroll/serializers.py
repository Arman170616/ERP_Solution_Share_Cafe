from decimal import Decimal

from rest_framework import serializers

from hr.models import Employee

from .models import Payslip


class PayslipSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.user.get_full_name", read_only=True)

    class Meta:
        model = Payslip
        fields = [
            "id",
            "employee",
            "employee_name",
            "period_start",
            "period_end",
            "base_salary",
            "overtime_hours",
            "overtime_amount",
            "bonus",
            "deductions",
            "net_salary",
            "generated_by",
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


class GeneratePayslipSerializer(serializers.Serializer):
    employee = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all())
    period_start = serializers.DateField()
    period_end = serializers.DateField()
    bonus = serializers.DecimalField(max_digits=10, decimal_places=3, default=Decimal("0"))
    deductions = serializers.DecimalField(max_digits=10, decimal_places=3, default=Decimal("0"))
