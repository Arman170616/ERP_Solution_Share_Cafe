from django.http import HttpResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from accounts.models import User
from accounts.permissions import IsManagerOrAdmin, IsStaffOrAbove

from .models import Payslip
from .serializers import GeneratePayslipSerializer, PayslipSerializer
from .services import calculate_payslip


class PayslipViewSet(viewsets.ModelViewSet):
    """Staff can view (and download the PDF of) only their own payslips; generating and
    deleting payslips stays Manager/Admin-only."""

    queryset = Payslip.objects.select_related("employee__user").all()
    serializer_class = PayslipSerializer
    permission_classes = [IsStaffOrAbove]
    filterset_fields = ["employee"]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.role == User.Role.STAFF:
            qs = qs.filter(employee__user=self.request.user)
        return qs

    def create(self, request, *args, **kwargs):
        if request.user.role == User.Role.STAFF:
            raise PermissionDenied("Only Manager/Admin can generate payslips.")
        input_serializer = GeneratePayslipSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data

        calc = calculate_payslip(
            data["employee"], data["period_start"], data["period_end"], data["bonus"], data["deductions"]
        )
        payslip = Payslip.objects.create(
            employee=data["employee"],
            period_start=data["period_start"],
            period_end=data["period_end"],
            generated_by=request.user,
            **calc,
        )
        return Response(PayslipSerializer(payslip).data, status=status.HTTP_201_CREATED)

    def perform_destroy(self, instance):
        if self.request.user.role == User.Role.STAFF:
            raise PermissionDenied("Only Manager/Admin can delete payslips.")
        instance.delete()

    @action(detail=True, methods=["get"])
    def pdf(self, request, pk=None):
        payslip = self.get_object()
        from .payslip_pdf import generate_payslip_pdf

        pdf_bytes = generate_payslip_pdf(payslip)
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = (
            f'attachment; filename="payslip-{payslip.employee.user.username}-{payslip.period_end}.pdf"'
        )
        return response
