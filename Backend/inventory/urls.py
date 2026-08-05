from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    IngredientViewSet,
    ProductIngredientViewSet,
    ProductViewSet,
    StockMovementViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet)
router.register("products", ProductViewSet)
router.register("product-ingredients", ProductIngredientViewSet)
router.register("ingredients", IngredientViewSet)
router.register("stock-movements", StockMovementViewSet)

urlpatterns = router.urls
