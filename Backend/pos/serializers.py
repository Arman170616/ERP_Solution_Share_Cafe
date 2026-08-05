from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from inventory.models import Product, StockMovement

from .models import Order, OrderItem, Payment


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=3, read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "quantity", "unit_price", "discount", "subtotal"]
        read_only_fields = ["unit_price"]


class OrderItemInputSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.filter(is_active=True))
    quantity = serializers.IntegerField(min_value=1)
    discount = serializers.DecimalField(max_digits=10, decimal_places=3, default=Decimal("0"))


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "order", "method", "amount", "received_by", "paid_at"]
        read_only_fields = ["received_by", "paid_at"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    amount_paid = serializers.DecimalField(max_digits=10, decimal_places=3, read_only=True)
    balance_due = serializers.DecimalField(max_digits=10, decimal_places=3, read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True, default=None)
    served_by_username = serializers.CharField(source="served_by.username", read_only=True, default=None)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_type",
            "status",
            "table_number",
            "customer",
            "created_by",
            "created_by_username",
            "served_by",
            "served_by_username",
            "subtotal",
            "discount_amount",
            "tax_rate",
            "tax_amount",
            "total",
            "amount_paid",
            "balance_due",
            "notes",
            "items",
            "payments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["subtotal", "tax_amount", "total", "created_by"]


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemInputSerializer(many=True)
    served_by = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.filter(is_active=True), required=False, allow_null=True
    )

    class Meta:
        model = Order
        fields = ["order_type", "table_number", "customer", "discount_amount", "notes", "served_by", "items"]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("An order needs at least one item.")
        return items

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        request = self.context["request"]
        # "Taken by" defaults to whoever is logged in, but a shared terminal can attribute
        # the sale to a different staff member (e.g. a cashier ringing up a colleague's table).
        validated_data.setdefault("served_by", request.user)
        order = Order.objects.create(created_by=request.user, **validated_data)

        for item_data in items_data:
            product = item_data["product"]
            order_item = OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data["quantity"],
                unit_price=product.price,
                discount=item_data["discount"],
            )
            for recipe_line in product.recipe_lines.select_related("ingredient"):
                StockMovement.objects.create(
                    ingredient=recipe_line.ingredient,
                    movement_type=StockMovement.MovementType.SALE,
                    quantity=-(recipe_line.quantity_required * order_item.quantity),
                    reference=f"Order #{order.id}",
                    created_by=request.user,
                )

        order.recalculate_totals()
        return order

    def to_representation(self, instance):
        return OrderSerializer(instance, context=self.context).data
