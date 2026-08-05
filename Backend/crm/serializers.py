from rest_framework import serializers

from .models import Customer, Feedback


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "membership_card_number",
            "loyalty_points",
            "created_at",
        ]
        read_only_fields = ["loyalty_points"]


class FeedbackSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.name", read_only=True)

    class Meta:
        model = Feedback
        fields = ["id", "customer", "customer_name", "order", "rating", "comment", "created_at"]


class OrderSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    order_type = serializers.CharField()
    status = serializers.CharField()
    total = serializers.DecimalField(max_digits=10, decimal_places=3)
    created_at = serializers.DateTimeField()
