from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsManagerOrAdmin

from .models import Attendance, Employee, Leave, Shift
from .serializers import AttendanceSerializer, EmployeeSerializer, LeaveSerializer, ShiftSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related("user", "user__active_session").all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsManagerOrAdmin]


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related("employee__user").all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsManagerOrAdmin]
    filterset_fields = ["employee", "date", "status"]


class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.select_related("employee__user").all()
    serializer_class = ShiftSerializer
    permission_classes = [IsManagerOrAdmin]
    filterset_fields = ["employee", "date"]


class LeaveViewSet(viewsets.ModelViewSet):
    queryset = Leave.objects.select_related("employee__user").all()
    serializer_class = LeaveSerializer
    permission_classes = [IsManagerOrAdmin]
    filterset_fields = ["employee", "status", "leave_type"]

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        leave = self.get_object()
        leave.status = Leave.Status.APPROVED
        leave.approved_by = request.user
        leave.save(update_fields=["status", "approved_by"])
        return Response(LeaveSerializer(leave).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        leave = self.get_object()
        leave.status = Leave.Status.REJECTED
        leave.approved_by = request.user
        leave.save(update_fields=["status", "approved_by"])
        return Response(LeaveSerializer(leave).data)
