from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Customer, Feedback
from .serializers import CustomerSerializer, FeedbackSerializer, OrderSummarySerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filterset_fields = ["membership_card_number"]

    @action(detail=True, methods=["get"])
    def purchase_history(self, request, pk=None):
        customer = self.get_object()
        orders = customer.orders.exclude(status="cancelled").order_by("-created_at")
        return Response(OrderSummarySerializer(orders, many=True).data)


class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.select_related("customer").all()
    serializer_class = FeedbackSerializer
    filterset_fields = ["customer", "order", "rating"]
