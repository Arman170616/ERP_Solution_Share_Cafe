from django.db import migrations, models


def backfill_served_by(apps, schema_editor):
    Order = apps.get_model("pos", "Order")
    Order.objects.filter(served_by__isnull=True, created_by__isnull=False).update(
        served_by=models.F("created_by")
    )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('pos', '0002_order_served_by'),
    ]

    operations = [
        migrations.RunPython(backfill_served_by, noop),
    ]
