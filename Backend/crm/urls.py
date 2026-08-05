from rest_framework.routers import DefaultRouter

from .views import CustomerViewSet, FeedbackViewSet

router = DefaultRouter()
router.register("customers", CustomerViewSet)
router.register("feedback", FeedbackViewSet)

urlpatterns = router.urls
