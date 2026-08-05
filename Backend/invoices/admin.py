from django.contrib import admin

from .models import Invoice, Refund


class RefundInline(admin.TabularInline):
    model = Refund
    extra = 0


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "order", "status", "issued_by", "issued_at")
    list_filter = ("status",)
    search_fields = ("invoice_number",)
    inlines = [RefundInline]
