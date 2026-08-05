from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    """A menu item that can be sold through POS."""

    name = models.CharField(max_length=150)
    category = models.ForeignKey(
        Category, null=True, blank=True, on_delete=models.SET_NULL, related_name="products"
    )
    price = models.DecimalField(max_digits=10, decimal_places=3)
    cost_price = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Ingredient(models.Model):
    """A raw stock item consumed when products are sold, or purchased directly."""

    name = models.CharField(max_length=150)
    unit = models.CharField(max_length=20, help_text="e.g. kg, l, pcs")
    quantity_on_hand = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    reorder_threshold = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    expiry_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def is_low_stock(self):
        return self.quantity_on_hand <= self.reorder_threshold


class ProductIngredient(models.Model):
    """Recipe line: how much of an ingredient one unit of a product consumes."""

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="recipe_lines")
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, related_name="used_in")
    quantity_required = models.DecimalField(max_digits=10, decimal_places=3)

    class Meta:
        unique_together = ("product", "ingredient")

    def __str__(self):
        return f"{self.product} needs {self.quantity_required} {self.ingredient.unit} {self.ingredient}"


class StockMovement(models.Model):
    """A single ledger entry against an ingredient's stock.

    `quantity` is signed: positive increases quantity_on_hand (purchases, positive
    adjustments), negative decreases it (sales, wastage, negative adjustments). This one
    table covers "stock movement," "purchase records," and "wastage report" from the SRS.
    """

    class MovementType(models.TextChoices):
        PURCHASE = "purchase", "Purchase"
        SALE = "sale", "Sale"
        ADJUSTMENT = "adjustment", "Adjustment"
        WASTAGE = "wastage", "Wastage"

    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, related_name="movements")
    movement_type = models.CharField(max_length=15, choices=MovementType.choices)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    reference = models.CharField(max_length=150, blank=True, help_text="e.g. order #, supplier note")
    note = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.movement_type} {self.quantity} {self.ingredient}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new:
            Ingredient.objects.filter(pk=self.ingredient_id).update(
                quantity_on_hand=models.F("quantity_on_hand") + self.quantity
            )
