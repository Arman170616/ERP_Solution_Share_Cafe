from rest_framework.routers import DefaultRouter

from .views import OrderViewSet, PaymentViewSet

router = DefaultRouter()
router.register("orders", OrderViewSet)
router.register("payments", PaymentViewSet)

urlpatterns = router.urls
