from django.conf import settings
from django.db import models


class Notification(models.Model):
    class NotifType(models.TextChoices):
        LOW_STOCK = "low_stock", "Low stock"
        EXPIRY = "expiry", "Expiry alert"
        DAILY_SALES = "daily_sales", "Daily sales report"
        ATTENDANCE = "attendance", "Employee attendance"
        SYSTEM = "system", "System"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="notifications",
        help_text="Blank = broadcast to Admin/Manager roles",
    )
    notif_type = models.CharField(max_length=15, choices=NotifType.choices)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.notif_type}] {self.message}"
