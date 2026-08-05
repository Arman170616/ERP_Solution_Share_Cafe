from rest_framework import serializers

from .models import Category, Ingredient, Product, ProductIngredient, StockMovement


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class ProductIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(source="ingredient.name", read_only=True)

    class Meta:
        model = ProductIngredient
        fields = ["id", "product", "ingredient", "ingredient_name", "quantity_required"]


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)
    recipe_lines = ProductIngredientSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "category",
            "category_name",
            "price",
            "cost_price",
            "description",
            "is_active",
            "recipe_lines",
            "created_at",
        ]


class IngredientSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Ingredient
        fields = [
            "id",
            "name",
            "unit",
            "quantity_on_hand",
            "reorder_threshold",
            "cost_per_unit",
            "expiry_date",
            "is_low_stock",
            "created_at",
        ]
        read_only_fields = ["quantity_on_hand"]


class StockMovementSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(source="ingredient.name", read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            "id",
            "ingredient",
            "ingredient_name",
            "movement_type",
            "quantity",
            "unit_cost",
            "reference",
            "note",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["created_by", "created_at"]
