from rest_framework import serializers

from .models import Invoice, Refund


class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = ["id", "invoice", "amount", "reason", "refunded_by", "refunded_at"]
        read_only_fields = ["refunded_by", "refunded_at"]


class InvoiceSerializer(serializers.ModelSerializer):
    refunds = RefundSerializer(many=True, read_only=True)
    total_refunded = serializers.DecimalField(max_digits=10, decimal_places=3, read_only=True)
    order_total = serializers.DecimalField(source="order.total", max_digits=10, decimal_places=3, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "order",
            "invoice_number",
            "status",
            "order_total",
            "total_refunded",
            "refunds",
            "issued_by",
            "issued_at",
        ]
        read_only_fields = ["invoice_number", "status", "issued_by", "issued_at"]
