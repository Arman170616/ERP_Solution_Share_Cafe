from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BestSellersView,
    CashflowView,
    CustomerTrafficView,
    EmployeePerformanceView,
    ExpenseViewSet,
    OverviewView,
    PeakHoursView,
    RevenueProfitView,
    SalesReportView,
)

router = DefaultRouter()
router.register("expenses", ExpenseViewSet)

urlpatterns = [
    path("overview/", OverviewView.as_view(), name="analytics-overview"),
    path("sales/", SalesReportView.as_view(), name="analytics-sales"),
    path("best-sellers/", BestSellersView.as_view(), name="analytics-best-sellers"),
    path("peak-hours/", PeakHoursView.as_view(), name="analytics-peak-hours"),
    path("customer-traffic/", CustomerTrafficView.as_view(), name="analytics-customer-traffic"),
    path("revenue-profit/", RevenueProfitView.as_view(), name="analytics-revenue-profit"),
    path("cashflow/", CashflowView.as_view(), name="analytics-cashflow"),
    path("employee-performance/", EmployeePerformanceView.as_view(), name="analytics-employee-performance"),
    path("", include(router.urls)),
]
