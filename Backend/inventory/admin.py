from django.contrib import admin

from .models import Category, Ingredient, Product, ProductIngredient, StockMovement


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)


class ProductIngredientInline(admin.TabularInline):
    model = ProductIngredient
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "cost_price", "is_active")
    list_filter = ("category", "is_active")
    search_fields = ("name",)
    inlines = [ProductIngredientInline]


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ("name", "unit", "quantity_on_hand", "reorder_threshold", "expiry_date")
    search_fields = ("name",)


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ("ingredient", "movement_type", "quantity", "created_by", "created_at")
    list_filter = ("movement_type",)
    search_fields = ("ingredient__name", "reference")
