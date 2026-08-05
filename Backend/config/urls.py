from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "Share Cafe Management System"
admin.site.site_title = "Share Cafe Admin"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/inventory/", include("inventory.urls")),
    path("api/pos/", include("pos.urls")),
    path("api/invoices/", include("invoices.urls")),
    path("api/hr/", include("hr.urls")),
    path("api/payroll/", include("payroll.urls")),
    path("api/crm/", include("crm.urls")),
    path("api/analytics/", include("analytics.urls")),
    path("api/notifications/", include("notifications.urls")),
]
