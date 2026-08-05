from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.models import User

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    http_method_names = ["get", "post", "delete", "head", "options"]
    filterset_fields = ["notif_type", "is_read"]

    def get_queryset(self):
        user = self.request.user
        qs = Notification.objects.all()
        if user.role in (User.Role.ADMIN, User.Role.MANAGER):
            return qs.filter(Q(recipient=user) | Q(recipient__isnull=True))
        return qs.filter(recipient=user)

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({"detail": "All notifications marked as read."})
