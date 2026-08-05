from django.contrib import admin

from .models import Customer, Feedback


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "membership_card_number", "loyalty_points")
    search_fields = ("name", "phone", "membership_card_number")


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("customer", "rating", "order", "created_at")
    list_filter = ("rating",)
