from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import CanCancelOrder

from .models import Order, Payment
from .serializers import OrderCreateSerializer, OrderSerializer, PaymentSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().prefetch_related("items", "payments")
    filterset_fields = ["status", "order_type", "customer"]

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer

    def get_permissions(self):
        # Cancelling/deleting an order is explicitly off-limits for Manager (Admin and
        # Staff can still do it) per the client's RBAC clarification.
        if self.action in ("cancel", "destroy"):
            return [CanCancelOrder()]
        return super().get_permissions()

    @action(detail=True, methods=["post"])
    def add_payment(self, request, pk=None):
        order = self.get_object()
        serializer = PaymentSerializer(data={**request.data, "order": order.id})
        serializer.is_valid(raise_exception=True)
        serializer.save(received_by=request.user)
        # `order` was fetched through a prefetch_related("payments") queryset, so its
        # cached related manager is now stale — refetch to reflect the payment just added.
        order = self.get_queryset().get(pk=order.pk)
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status != Order.Status.CANCELLED:
            order.status = Order.Status.CANCELLED
            order.save(update_fields=["status", "updated_at"])
        return Response(OrderSerializer(order).data)

    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        date_str = request.query_params.get("date")
        target_date = timezone.datetime.fromisoformat(date_str).date() if date_str else timezone.localdate()

        orders_today = Order.objects.filter(created_at__date=target_date).exclude(
            status=Order.Status.CANCELLED
        )
        revenue = orders_today.aggregate(total=Sum("total"))["total"] or 0
        payment_summary = list(
            Payment.objects.filter(order__in=orders_today)
            .values("method")
            .annotate(total=Sum("amount"), count=Count("id"))
        )
        return Response(
            {
                "date": target_date,
                "total_orders": orders_today.count(),
                "revenue": revenue,
                "payment_summary": payment_summary,
            }
        )


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    filterset_fields = ["order", "method"]
