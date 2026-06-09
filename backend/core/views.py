from .sub_views.component_views import ComponentListCreateView, ComponentDetailView
from .sub_views.vehicle_views import VehicleListCreateView, VehicleDetailView
from .sub_views.service_views import (
    ServiceRecordListCreateView,
    ServiceRecordDetailView,
    ServiceIssueListCreateView,
    ServiceIssueDetailView,
    PaymentSimulationView,
)
from .sub_views.revenue_views import (
    RevenueSummaryView,
    DailyRevenueView,
    MonthlyRevenueView,
    YearlyRevenueView,
)
from .sub_views.invoice_views import InvoiceListView, InvoiceDetailView
