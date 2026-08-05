from rest_framework import serializers

from .models import Attendance, Employee, Leave, Shift


class EmployeeSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.CharField(source="user.get_full_name", read_only=True)
    ip_address = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            "id",
            "user",
            "username",
            "full_name",
            "position",
            "hire_date",
            "base_salary",
            "is_active",
            "ip_address",
        ]

    def get_ip_address(self, obj):
        """Last known login IP for this employee's account — visible to Admin only via
        this endpoint's permission, matching the SRS's IP-based access control theme."""
        session = getattr(obj.user, "active_session", None)
        return session.ip_address if session else None


class AttendanceSerializer(serializers.ModelSerializer):
    hours_worked = serializers.FloatField(read_only=True)
    employee_name = serializers.CharField(source="employee.user.get_full_name", read_only=True)

    class Meta:
        model = Attendance
        fields = [
            "id",
            "employee",
            "employee_name",
            "date",
            "check_in",
            "check_out",
            "status",
            "hours_worked",
        ]


class ShiftSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.user.get_full_name", read_only=True)

    class Meta:
        model = Shift
        fields = ["id", "employee", "employee_name", "date", "start_time", "end_time", "note"]


class LeaveSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.user.get_full_name", read_only=True)

    class Meta:
        model = Leave
        fields = [
            "id",
            "employee",
            "employee_name",
            "leave_type",
            "start_date",
            "end_date",
            "reason",
            "status",
            "approved_by",
            "created_at",
        ]
        read_only_fields = ["status", "approved_by", "created_at"]
