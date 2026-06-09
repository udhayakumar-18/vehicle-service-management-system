# serializers/invoice_serializers.py

from rest_framework import serializers
from core.models import Invoice, ServiceIssue


class InvoiceLineItemSerializer(serializers.Serializer):
    """Read-only serializer for itemized invoice line items (from service issues)."""
    description = serializers.CharField()
    component = serializers.CharField()
    action_type = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)


class InvoiceSerializer(serializers.ModelSerializer):
    line_items = serializers.SerializerMethodField()
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'service_record',
            'owner_name', 'owner_phone', 'vehicle_info',
            'line_items',
            'subtotal', 'labor_charge', 'total_amount',
            'payment_method', 'payment_method_display',
            'notes', 'issued_at',
        ]
        read_only_fields = fields

    def get_line_items(self, obj):
        issues = ServiceIssue.objects.filter(service_record=obj.service_record).select_related('component')
        return [
            {
                'description': issue.description,
                'component': issue.component.name if issue.component else 'N/A',
                'action_type': issue.get_action_type_display(),
                'price': str(issue.calculated_price),
            }
            for issue in issues
        ]
