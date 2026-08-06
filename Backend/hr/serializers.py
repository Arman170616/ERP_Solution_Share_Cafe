from rest_framework import serializers

from accounts.models import ActivityLog

from .models import Attendance, Employee, Leave, Shift


class EmployeeSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.CharField(source="user.get_full_name", read_only=True)
    ip_address = serializers.SerializerMethodField()
    last_login_at = serializers.SerializerMethodField()

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
            "last_login_at",
        ]

    def _last_login(self, obj):
        return (
            ActivityLog.objects.filter(user=obj.user, action=ActivityLog.Action.LOGIN)
            .order_by("-created_at")
            .first()
        )

    def get_ip_address(self, obj):
        """IP from the employee's most recent login — read from the permanent ActivityLog,
        not the ActiveSession (which is deleted on logout, so it'd go blank the moment
        someone signs out). Visible to Admin only via this endpoint's permission, matching
        the SRS's IP-based access control theme."""
        log = self._last_login(obj)
        return log.ip_address if log else None

    def get_last_login_at(self, obj):
        log = self._last_login(obj)
        return log.created_at if log else None


class AttendanceSerializer(serializers.ModelSerializer):
    hours_worked = serializers.FloatField(read_only=True)
    employee_name = serializers.CharField(source="employee.user.get_full_name", read_only=True)
    marked_by_name = serializers.CharField(source="marked_by.get_full_name", read_only=True, default=None)
    approved_by_name = serializers.CharField(source="approved_by.get_full_name", read_only=True, default=None)

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
            "approval_status",
            "marked_by",
            "marked_by_name",
            "approved_by",
            "approved_by_name",
        ]
        read_only_fields = ["approval_status", "marked_by", "approved_by"]


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
