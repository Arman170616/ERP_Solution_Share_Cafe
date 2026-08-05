from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from pos.models import Payment

from .models import Customer


@receiver(post_save, sender=Payment)
def award_loyalty_points(sender, instance, created, **kwargs):
    """1 loyalty point per whole currency unit paid, per SRS 8 (Loyalty points)."""
    if not created:
        return
    customer = instance.order.customer
    if customer is None:
        return
    points = int(instance.amount)
    if points > 0:
        Customer.objects.filter(pk=customer.pk).update(
            loyalty_points=models.F("loyalty_points") + points
        )
