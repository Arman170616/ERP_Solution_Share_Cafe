from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import SAFE_METHODS
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsManagerOrAdmin, IsStaffOrAbove

from .models import Attendance, Employee, Leave, Shift
from .serializers import AttendanceSerializer, EmployeeSerializer, LeaveSerializer, ShiftSerializer


class MyEmployeeView(APIView):
    """Self-service: a Staff/Manager account's own HR Employee profile, for the personal
    HR & Payroll view — deliberately a separate endpoint from EmployeeViewSet (which stays
    Manager/Admin-only for browsing *other* people's records) rather than relaxing that
    viewset's permissions."""

    permission_classes = [IsStaffOrAbove]

    def get(self, request):
        employee = getattr(request.user, "employee_profile", None)
        if not employee:
            return Response({"detail": "No HR employee profile is linked to this account."}, status=404)
        return Response(EmployeeSerializer(employee).data)


class EmployeeViewSet(viewsets.ModelViewSet):
    """Manager can see everyone in HR but can only ever create/edit/remove a Staff-role
    employee's record — never another Manager's or an Admin's — mirroring the same
    "onboard Staff only" boundary CanManageUserAccounts already enforces on user accounts.
    Admin has no such restriction."""

    queryset = Employee.objects.select_related("user", "user__active_session").all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsManagerOrAdmin]

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if user.role == User.Role.MANAGER and self.request.method not in SAFE_METHODS and obj.user.role != User.Role.STAFF:
            raise PermissionDenied("Managers can only edit or remove Staff-role employees.")
        return obj

    def perform_create(self, serializer):
        user = self.request.user
        target = serializer.validated_data.get("user")
        if user.role == User.Role.MANAGER and target and target.role != User.Role.STAFF:
            raise PermissionDenied("Managers can only add Staff-role employees.")
        serializer.save()

    def perform_destroy(self, instance):
        # Deactivating (not deleting) their login means: they instantly drop off the POS
        # "taken by" picker (which only lists is_active=True users) and any still-valid
        # JWT of theirs stops authenticating (SimpleJWT checks is_active on every request)
        # — while preserving the account for historical order/activity-log references.
        user = instance.user
        instance.delete()
        user.is_active = False
        user.save(update_fields=["is_active"])


class AttendanceViewSet(viewsets.ModelViewSet):
    """Attendance workflow: Staff can only see/mark their own attendance (self check-in/
    check-out), which lands as approval_status="pending". Manager/Admin see everyone's,
    can mark on an employee's behalf (auto-approved, since they're already the approver),
    and are the only ones who can approve/reject a Staff-submitted record."""

    queryset = Attendance.objects.select_related("employee__user", "marked_by", "approved_by").all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsStaffOrAbove]
    filterset_fields = ["employee", "date", "status", "approval_status"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == User.Role.STAFF:
            qs = qs.filter(employee__user=user)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == User.Role.STAFF:
            employee = getattr(user, "employee_profile", None)
            if not employee:
                raise PermissionDenied("No HR employee profile is linked to this account.")
            serializer.save(employee=employee, marked_by=user, approval_status=Attendance.ApprovalStatus.PENDING)
        else:
            serializer.save(marked_by=user, approval_status=Attendance.ApprovalStatus.APPROVED, approved_by=user)

    def perform_update(self, serializer):
        # Staff editing their own record (e.g. adding a check-out time) re-opens it for
        # approval rather than silently keeping a stale approved/rejected status.
        user = self.request.user
        if user.role == User.Role.STAFF:
            serializer.save(approval_status=Attendance.ApprovalStatus.PENDING, approved_by=None)
        else:
            serializer.save()

    @action(detail=True, methods=["post"], permission_classes=[IsManagerOrAdmin])
    def approve(self, request, pk=None):
        record = self.get_object()
        record.approval_status = Attendance.ApprovalStatus.APPROVED
        record.approved_by = request.user
        record.save(update_fields=["approval_status", "approved_by"])
        return Response(AttendanceSerializer(record).data)

    @action(detail=True, methods=["post"], permission_classes=[IsManagerOrAdmin])
    def reject(self, request, pk=None):
        record = self.get_object()
        record.approval_status = Attendance.ApprovalStatus.REJECTED
        record.approved_by = request.user
        record.save(update_fields=["approval_status", "approved_by"])
        return Response(AttendanceSerializer(record).data)


class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.select_related("employee__user").all()
    serializer_class = ShiftSerializer
    permission_classes = [IsManagerOrAdmin]
    filterset_fields = ["employee", "date"]


class LeaveViewSet(viewsets.ModelViewSet):
    """Staff can submit and view only their own leave requests; Manager/Admin see and
    approve/reject everyone's, same as before."""

    queryset = Leave.objects.select_related("employee__user").all()
    serializer_class = LeaveSerializer
    permission_classes = [IsStaffOrAbove]
    filterset_fields = ["employee", "status", "leave_type"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == User.Role.STAFF:
            qs = qs.filter(employee__user=user)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == User.Role.STAFF:
            employee = getattr(user, "employee_profile", None)
            if not employee:
                raise PermissionDenied("No HR employee profile is linked to this account.")
            serializer.save(employee=employee)
        else:
            serializer.save()

    @action(detail=True, methods=["post"], permission_classes=[IsManagerOrAdmin])
    def approve(self, request, pk=None):
        leave = self.get_object()
        leave.status = Leave.Status.APPROVED
        leave.approved_by = request.user
        leave.save(update_fields=["status", "approved_by"])
        return Response(LeaveSerializer(leave).data)

    @action(detail=True, methods=["post"], permission_classes=[IsManagerOrAdmin])
    def reject(self, request, pk=None):
        leave = self.get_object()
        leave.status = Leave.Status.REJECTED
        leave.approved_by = request.user
        leave.save(update_fields=["status", "approved_by"])
        return Response(LeaveSerializer(leave).data)
