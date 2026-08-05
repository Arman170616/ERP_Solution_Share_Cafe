from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ActivityLogViewSet,
    BootstrapStatusView,
    IPAccessRuleViewSet,
    LoginView,
    LogoutView,
    MeView,
    SignupView,
    StaffListView,
    UserViewSet,
)

router = DefaultRouter()
router.register("users", UserViewSet)
router.register("ip-rules", IPAccessRuleViewSet)
router.register("activity-logs", ActivityLogViewSet)

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("bootstrap-status/", BootstrapStatusView.as_view(), name="bootstrap_status"),
    path("signup/", SignupView.as_view(), name="signup"),
    path("staff/", StaffListView.as_view(), name="staff_list"),
    path("", include(router.urls)),
]
