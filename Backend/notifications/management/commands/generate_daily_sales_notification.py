from django.core.management.base import BaseCommand
from django.db.models import Count, Sum
from django.utils import timezone

from notifications.models import Notification
from pos.models import Order


class Command(BaseCommand):
    """SRS 11: Daily sales report notification. Intended to be run once/day via cron."""

    help = "Creates a broadcast notification summarizing yesterday's sales."

    def handle(self, *args, **options):
        target_date = timezone.localdate() - timezone.timedelta(days=1)
        orders = Order.objects.filter(created_at__date=target_date).exclude(status=Order.Status.CANCELLED)
        summary = orders.aggregate(revenue=Sum("total"), order_count=Count("id"))
        revenue = summary["revenue"] or 0
        order_count = summary["order_count"] or 0

        Notification.objects.create(
            notif_type=Notification.NotifType.DAILY_SALES,
            message=f"Sales for {target_date}: {order_count} orders, revenue {revenue}",
        )
        self.stdout.write(self.style.SUCCESS(f"Daily sales notification created for {target_date}"))
