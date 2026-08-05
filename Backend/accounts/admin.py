from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import ActiveSession, ActivityLog, IPAccessRule, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("Cafe role", {"fields": ("role", "phone")}),)
    list_display = ("username", "email", "role", "is_active", "is_staff")
    list_filter = UserAdmin.list_filter + ("role",)


@admin.register(IPAccessRule)
class IPAccessRuleAdmin(admin.ModelAdmin):
    list_display = ("ip_or_cidr", "rule_type", "label", "created_by", "created_at")
    list_filter = ("rule_type",)


@admin.register(ActiveSession)
class ActiveSessionAdmin(admin.ModelAdmin):
    list_display = ("user", "ip_address", "device_info", "last_seen")
    search_fields = ("user__username",)


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("action", "user", "ip_address", "created_at")
    list_filter = ("action",)
    search_fields = ("user__username", "detail")
