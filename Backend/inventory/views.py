from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.models import User
from accounts.permissions import ReadWriteRolePermission

from .models import Category, Ingredient, Product, ProductIngredient, StockMovement
from .serializers import (
    CategorySerializer,
    IngredientSerializer,
    ProductIngredientSerializer,
    ProductSerializer,
    StockMovementSerializer,
)

# Staff need read access to the menu for POS; Manager/Admin manage operational inventory
# (ingredients/stock). Menu items (Product/ProductIngredient) are Admin-only to define —
# Manager can run inventory day-to-day but doesn't set what's on the menu or its pricing.
INVENTORY_READ_ROLES = (User.Role.ADMIN, User.Role.MANAGER, User.Role.STAFF)
INVENTORY_WRITE_ROLES = (User.Role.ADMIN, User.Role.MANAGER)
MENU_WRITE_ROLES = (User.Role.ADMIN,)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [ReadWriteRolePermission]
    read_roles = INVENTORY_READ_ROLES
    write_roles = INVENTORY_WRITE_ROLES


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [ReadWriteRolePermission]
    read_roles = INVENTORY_READ_ROLES
    write_roles = MENU_WRITE_ROLES
    filterset_fields = ["category", "is_active"]


class ProductIngredientViewSet(viewsets.ModelViewSet):
    queryset = ProductIngredient.objects.all()
    serializer_class = ProductIngredientSerializer
    permission_classes = [ReadWriteRolePermission]
    read_roles = INVENTORY_READ_ROLES
    write_roles = MENU_WRITE_ROLES
    filterset_fields = ["product", "ingredient"]


class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [ReadWriteRolePermission]
    read_roles = INVENTORY_READ_ROLES
    write_roles = INVENTORY_WRITE_ROLES

    @action(detail=False, methods=["get"])
    def low_stock(self, request):
        qs = [i for i in self.get_queryset() if i.is_low_stock]
        return Response(IngredientSerializer(qs, many=True).data)

    @action(detail=False, methods=["get"])
    def expiring_soon(self, request):
        from datetime import timedelta

        from django.utils import timezone

        horizon = timezone.now().date() + timedelta(days=int(request.query_params.get("days", 7)))
        qs = self.get_queryset().filter(expiry_date__isnull=False, expiry_date__lte=horizon)
        return Response(IngredientSerializer(qs, many=True).data)


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [ReadWriteRolePermission]
    read_roles = INVENTORY_READ_ROLES
    write_roles = INVENTORY_WRITE_ROLES
    filterset_fields = ["ingredient", "movement_type"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
