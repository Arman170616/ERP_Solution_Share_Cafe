from rest_framework import status, viewsets
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import ActiveSession, ActivityLog, IPAccessRule, User
from .permissions import CanManageUserAccounts, IsAdmin, IsManagerOrAdmin
from .serializers import (
    ActivityLogSerializer,
    CustomTokenObtainPairSerializer,
    IPAccessRuleSerializer,
    SignupSerializer,
    UserSerializer,
)
from .utils import get_client_ip


def _issue_session(user, request, refresh, login_action=ActivityLog.Action.LOGIN):
    """Stamp the ActiveSession for `refresh`'s "sid" claim, blacklist any older still-
    outstanding tokens for this user (single-device login), and write activity logs.

    Shared by LoginView and SignupView so both go through identical session bookkeeping.
    """
    ip = get_client_ip(request)
    user_agent = request.META.get("HTTP_USER_AGENT", "")[:255]
    sid = refresh.payload.get("sid")

    had_previous_session = ActiveSession.objects.filter(user=user).exists()
    ActiveSession.objects.update_or_create(
        user=user,
        defaults={"session_id": sid, "ip_address": ip, "device_info": user_agent},
    )

    for outstanding in OutstandingToken.objects.filter(user=user).exclude(jti=refresh["jti"]):
        BlacklistedToken.objects.get_or_create(token=outstanding)

    if had_previous_session:
        ActivityLog.objects.create(
            user=user, action=ActivityLog.Action.SESSION_EXPIRED, ip_address=ip, user_agent=user_agent
        )
    ActivityLog.objects.create(user=user, action=login_action, ip_address=ip, user_agent=user_agent)


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        ip = get_client_ip(request)
        user_agent = request.META.get("HTTP_USER_AGENT", "")[:255]
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except AuthenticationFailed:
            ActivityLog.objects.create(
                action=ActivityLog.Action.LOGIN_FAILED,
                ip_address=ip,
                user_agent=user_agent,
                detail=str(request.data.get("username", ""))[:255],
            )
            raise

        data = serializer.validated_data
        user = serializer.user
        refresh = RefreshToken(data["refresh"])
        _issue_session(user, request, refresh, login_action=ActivityLog.Action.LOGIN)

        return Response(data, status=status.HTTP_200_OK)


class BootstrapStatusView(APIView):
    """Public: lets the frontend decide whether to show the owner-signup form."""

    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"needs_setup": not User.objects.exists()})


class SignupView(APIView):
    """Public, but only succeeds once: creates the first Admin account.

    Once any user exists this always 409s — this system has no self-service
    registration per the SRS (accounts are admin-provisioned), only a one-time
    owner bootstrap for a brand-new deployment.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        if User.objects.exists():
            return Response(
                {"detail": "Setup already completed. Ask an admin for an account."},
                status=status.HTTP_409_CONFLICT,
            )

        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.create_user(
            username=serializer.validated_data["username"],
            email=serializer.validated_data.get("email", ""),
            password=serializer.validated_data["password"],
            role=User.Role.ADMIN,
            is_staff=True,
            is_superuser=True,
        )

        refresh = CustomTokenObtainPairSerializer.get_token(user)
        _issue_session(user, request, refresh, login_action=ActivityLog.Action.SIGNUP)

        return Response(
            {"refresh": str(refresh), "access": str(refresh.access_token)},
            status=status.HTTP_201_CREATED,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_str = request.data.get("refresh")
        if refresh_str:
            try:
                RefreshToken(refresh_str).blacklist()
            except Exception:
                pass
        ActiveSession.objects.filter(user=request.user).delete()
        ActivityLog.objects.create(
            user=request.user,
            action=ActivityLog.Action.LOGOUT,
            ip_address=get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:255],
        )
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("username")
    serializer_class = UserSerializer
    permission_classes = [CanManageUserAccounts]


class StaffListView(APIView):
    """Minimal {id, username, role} list of active Manager/Staff accounts who still have an
    HR Employee profile — deliberately excludes Admin (Employee Performance and "taken by"
    attribution are about staff, not the admin account) and doesn't expose email/phone the
    way UserViewSet does, so any authenticated POS user can use it to populate a "taken by"
    picker. Requiring employee_profile__isnull=False keeps this in sync with the actual HR
    employee list: an account can be is_active=True (e.g. a Manager account with no HR
    profile, or a leftover from before employee-delete started deactivating logins) without
    being someone who should show up as a "taken by" option.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = User.objects.filter(
            is_active=True,
            role__in=[User.Role.MANAGER, User.Role.STAFF],
            employee_profile__isnull=False,
        ).order_by("username")
        return Response([{"id": u.id, "username": u.username, "role": u.role} for u in qs])


class IPAccessRuleViewSet(viewsets.ModelViewSet):
    queryset = IPAccessRule.objects.all()
    serializer_class = IPAccessRuleSerializer
    permission_classes = [IsAdmin]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsManagerOrAdmin]
    filterset_fields = ["user", "action"]
