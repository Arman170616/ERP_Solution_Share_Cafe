from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "recipient", "notif_type", "message", "is_read", "created_at"]
        read_only_fields = ["recipient", "notif_type", "message", "created_at"]
