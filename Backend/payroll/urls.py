from rest_framework.routers import DefaultRouter

from .views import PayslipViewSet

router = DefaultRouter()
router.register("payslips", PayslipViewSet)

urlpatterns = router.urls
