from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsManagerOrAdmin

from .models import Invoice, Refund
from .pdf import generate_invoice_pdf
from .serializers import InvoiceSerializer, RefundSerializer


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().select_related("order")
    serializer_class = InvoiceSerializer
    filterset_fields = ["status", "order"]

    def get_permissions(self):
        # Any authenticated staff can issue/view invoices at checkout; refunds and
        # cancellations are a manager/admin decision.
        if self.action in ("cancel", "refund", "destroy"):
            return [IsManagerOrAdmin()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(issued_by=self.request.user)

    @action(detail=True, methods=["get"])
    def pdf(self, request, pk=None):
        invoice = self.get_object()
        pdf_bytes = generate_invoice_pdf(invoice)
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{invoice.invoice_number}.pdf"'
        return response

    @action(detail=True, methods=["post"])
    def refund(self, request, pk=None):
        invoice = self.get_object()
        serializer = RefundSerializer(data={**request.data, "invoice": invoice.id})
        serializer.is_valid(raise_exception=True)
        serializer.save(refunded_by=request.user)

        total_refunded = invoice.total_refunded
        invoice.status = (
            Invoice.Status.REFUNDED
            if total_refunded >= invoice.order.total
            else Invoice.Status.PARTIALLY_REFUNDED
        )
        invoice.save(update_fields=["status"])
        return Response(InvoiceSerializer(invoice).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = Invoice.Status.CANCELLED
        invoice.save(update_fields=["status"])
        return Response(InvoiceSerializer(invoice).data)
