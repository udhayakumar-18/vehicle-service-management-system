from django.urls import path
from core.views import (
    ComponentListCreateView, ComponentDetailView,
    VehicleListCreateView, VehicleDetailView,
    ServiceRecordListCreateView, ServiceRecordDetailView,
    ServiceIssueListCreateView, ServiceIssueDetailView,
    PaymentSimulationView,
    RevenueSummaryView, DailyRevenueView, MonthlyRevenueView, YearlyRevenueView,
    InvoiceListView, InvoiceDetailView,
)

urlpatterns = [
    path('components/', ComponentListCreateView.as_view(), name='component-list'),
    path('components/<int:pk>/', ComponentDetailView.as_view(), name='component-detail'),

    path('vehicles/', VehicleListCreateView.as_view(), name='vehicle-list'),
    path('vehicles/<int:pk>/', VehicleDetailView.as_view(), name='vehicle-detail'),

    path('services/', ServiceRecordListCreateView.as_view(), name='service-list'),
    path('services/<int:pk>/', ServiceRecordDetailView.as_view(), name='service-detail'),
    path('services/<int:service_id>/issues/', ServiceIssueListCreateView.as_view(), name='service-issues'),
    path('services/<int:pk>/pay/', PaymentSimulationView.as_view(), name='service-pay'),

    path('issues/<int:pk>/', ServiceIssueDetailView.as_view(), name='issue-detail'),

    path('revenue/summary/', RevenueSummaryView.as_view(), name='revenue-summary'),
    path('revenue/daily/', DailyRevenueView.as_view(), name='revenue-daily'),
    path('revenue/monthly/', MonthlyRevenueView.as_view(), name='revenue-monthly'),
    path('revenue/yearly/', YearlyRevenueView.as_view(), name='revenue-yearly'),

    path('invoices/', InvoiceListView.as_view(), name='invoice-list'),
    path('invoices/service/<int:service_id>/', InvoiceDetailView.as_view(), name='invoice-detail'),
]
