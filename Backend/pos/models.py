from decimal import Decimal

from django.conf import settings
from django.db import models

OMAN_VAT_RATE = Decimal("0.05")


class Order(models.Model):
    class OrderType(models.TextChoices):
        DINE_IN = "dine_in", "Dine-in"
        TAKEAWAY = "takeaway", "Takeaway"
        DELIVERY = "delivery", "Delivery"
        TALABAT = "talabat", "Talabat"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PREPARING = "preparing", "Preparing"
        READY = "ready", "Ready for pickup"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    order_type = models.CharField(max_length=15, choices=OrderType.choices, default=OrderType.DINE_IN)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    table_number = models.CharField(max_length=20, blank=True)
    customer = models.ForeignKey(
        "crm.Customer", null=True, blank=True, on_delete=models.SET_NULL, related_name="orders"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="orders_taken"
    )
    served_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="orders_served",
        help_text="The staff member who actually took/served this order — may differ from "
        "created_by on a shared terminal login. Defaults to created_by if not set.",
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    tax_rate = models.DecimalField(max_digits=4, decimal_places=3, default=OMAN_VAT_RATE)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.pk} ({self.status})"

    def recalculate_totals(self, save=True):
        items = self.items.all()
        subtotal = sum((item.quantity * item.unit_price - item.discount for item in items), Decimal("0"))
        taxable = subtotal - self.discount_amount
        self.subtotal = subtotal
        self.tax_amount = (taxable * self.tax_rate).quantize(Decimal("0.001"))
        self.total = (taxable + self.tax_amount).quantize(Decimal("0.001"))
        if save:
            self.save(update_fields=["subtotal", "tax_amount", "total", "updated_at"])

    @property
    def amount_paid(self):
        return sum((p.amount for p in self.payments.all()), Decimal("0"))

    @property
    def balance_due(self):
        return self.total - self.amount_paid


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("inventory.Product", on_delete=models.PROTECT, related_name="order_items")
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=3)
    discount = models.DecimalField(max_digits=10, decimal_places=3, default=0)

    def __str__(self):
        return f"{self.quantity} x {self.product}"

    @property
    def subtotal(self):
        return self.quantity * self.unit_price - self.discount


class Payment(models.Model):
    class Method(models.TextChoices):
        CASH = "cash", "Cash"
        CARD = "card", "Card"
        MOBILE = "mobile", "Mobile wallet"
        OTHER = "other", "Other"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="payments")
    method = models.CharField(max_length=10, choices=Method.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=3)
    received_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    paid_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.amount} ({self.method}) for order #{self.order_id}"
