from django.http import HttpResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsAdmin

from .models import Payslip
from .serializers import GeneratePayslipSerializer, PayslipSerializer
from .services import calculate_payslip


class PayslipViewSet(viewsets.ModelViewSet):
    queryset = Payslip.objects.select_related("employee__user").all()
    serializer_class = PayslipSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ["employee"]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def create(self, request, *args, **kwargs):
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
