from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from hr.models import Attendance
from inventory.models import Ingredient, StockMovement

from .models import Notification


def _create_if_not_pending(notif_type, message):
    """Avoid spamming duplicate unread alerts for the same condition."""
    if not Notification.objects.filter(notif_type=notif_type, message=message, is_read=False).exists():
        Notification.objects.create(notif_type=notif_type, message=message)


@receiver(post_save, sender=StockMovement)
def check_low_stock_on_movement(sender, instance, created, **kwargs):
    if not created:
        return
    ingredient = instance.ingredient
    ingredient.refresh_from_db(fields=["quantity_on_hand", "reorder_threshold"])
    if ingredient.is_low_stock:
        _create_if_not_pending(
            Notification.NotifType.LOW_STOCK,
            f"Low stock: {ingredient.name} at {ingredient.quantity_on_hand} {ingredient.unit}",
        )


@receiver(post_save, sender=Ingredient)
def check_expiry_on_ingredient_save(sender, instance, **kwargs):
    if not instance.expiry_date:
        return
    days_left = (instance.expiry_date - timezone.now().date()).days
    if 0 <= days_left <= 7:
        _create_if_not_pending(
            Notification.NotifType.EXPIRY,
            f"Expiring soon: {instance.name} on {instance.expiry_date}",
        )


@receiver(post_save, sender=Attendance)
def notify_absence(sender, instance, created, **kwargs):
    if instance.status == Attendance.Status.ABSENT:
        _create_if_not_pending(
            Notification.NotifType.ATTENDANCE,
            f"{instance.employee} marked absent on {instance.date}",
        )
