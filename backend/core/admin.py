from django.contrib import admin
from core.models import Component, Vehicle, ServiceRecord, ServiceIssue, Invoice


@admin.register(Component)
class ComponentAdmin(admin.ModelAdmin):
    list_display = ['name', 'repair_price', 'new_purchase_price', 'stock_quantity', 'created_at']
    search_fields = ['name']
    ordering = ['name']


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['license_plate', 'make', 'model', 'year', 'owner_name', 'created_at']
    search_fields = ['license_plate', 'owner_name', 'make']
    ordering = ['-created_at']


class ServiceIssueInline(admin.TabularInline):
    model = ServiceIssue
    extra = 0
    fields = ['description', 'component', 'action_type', 'calculated_price']
    readonly_fields = ['calculated_price']


@admin.register(ServiceRecord)
class ServiceRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'vehicle', 'status', 'total_amount_due', 'is_paid', 'created_at']
    list_filter = ['status', 'is_paid']
    search_fields = ['vehicle__license_plate', 'vehicle__owner_name']
    readonly_fields = ['total_amount_due', 'payment_simulated_at']
    inlines = [ServiceIssueInline]


@admin.register(ServiceIssue)
class ServiceIssueAdmin(admin.ModelAdmin):
    list_display = ['description', 'service_record', 'component', 'action_type', 'calculated_price']
    list_filter = ['action_type']


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'owner_name', 'total_amount', 'payment_method', 'issued_at']
    list_filter = ['payment_method']
    search_fields = ['invoice_number', 'owner_name', 'vehicle_info']
    readonly_fields = ['issued_at']
