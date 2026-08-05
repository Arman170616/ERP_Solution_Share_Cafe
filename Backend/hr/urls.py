from rest_framework.routers import DefaultRouter

from .views import AttendanceViewSet, EmployeeViewSet, LeaveViewSet, ShiftViewSet

router = DefaultRouter()
router.register("employees", EmployeeViewSet)
router.register("attendance", AttendanceViewSet)
router.register("shifts", ShiftViewSet)
router.register("leave", LeaveViewSet)

urlpatterns = router.urls
