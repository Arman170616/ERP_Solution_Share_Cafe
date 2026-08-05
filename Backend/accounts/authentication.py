from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import ActiveSession


class SingleDeviceJWTAuthentication(JWTAuthentication):
    """Rejects a valid JWT if a newer login on another device has superseded it.

    Each login stamps a fresh random "sid" claim into the token pair and records it
    on the user's ActiveSession row. A later login overwrites that row with a new sid,
    so any still-unexpired token from the earlier device instantly stops authenticating.
    """

    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        sid = validated_token.get("sid")
        if sid is None:
            return user
        try:
            session = ActiveSession.objects.get(user=user)
        except ActiveSession.DoesNotExist:
            raise AuthenticationFailed("Session expired. Please log in again.", code="session_expired")
        if session.session_id != sid:
            raise AuthenticationFailed(
                "This account was logged in from another device.", code="session_expired"
            )
        return user
