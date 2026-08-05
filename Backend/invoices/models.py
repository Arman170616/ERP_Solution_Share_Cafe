from django.conf import settings
from django.db import models


class Invoice(models.Model):
    class Status(models.TextChoices):
        ISSUED = "issued", "Issued"
        PARTIALLY_REFUNDED = "partially_refunded", "Partially refunded"
        REFUNDED = "refunded", "Refunded"
        CANCELLED = "cancelled", "Cancelled"

    order = models.OneToOneField("pos.Order", on_delete=models.CASCADE, related_name="invoice")
    invoice_number = models.CharField(max_length=30, unique=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ISSUED)
    issued_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-issued_at"]

    def __str__(self):
        return self.invoice_number or f"Invoice for order #{self.order_id}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.invoice_number:
            self.invoice_number = f"INV-{self.pk:06d}"
            super().save(update_fields=["invoice_number"])

    @property
    def total_refunded(self):
        return sum((r.amount for r in self.refunds.all()), 0)


class Refund(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="refunds")
    amount = models.DecimalField(max_digits=10, decimal_places=3)
    reason = models.CharField(max_length=255, blank=True)
    refunded_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    refunded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-refunded_at"]

    def __str__(self):
        return f"Refund {self.amount} for {self.invoice.invoice_number}"
