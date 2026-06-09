# serializers/service_serializers.py

from rest_framework import serializers
from core.models import ServiceRecord, ServiceIssue
from .component_serializers import ComponentMinimalSerializer
from .vehicle_serializers import VehicleMinimalSerializer


class ServiceIssueSerializer(serializers.ModelSerializer):
    component_detail = ComponentMinimalSerializer(source='component', read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)

    class Meta:
        model = ServiceIssue
        fields = ['id', 'service_record', 'description', 'component', 'component_detail',
                  'action_type', 'action_type_display', 'calculated_price', 'notes',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'calculated_price', 'component_detail',
                            'action_type_display', 'created_at', 'updated_at']

    def validate(self, data):
        component = data.get('component')
        action_type = data.get('action_type', 'repair')
        if component and action_type == 'new' and not component.is_in_stock():
            raise serializers.ValidationError({'component': f'{component.name} is out of stock.'})
        return data


class ServiceRecordSerializer(serializers.ModelSerializer):
    issues = ServiceIssueSerializer(many=True, read_only=True)
    vehicle_detail = VehicleMinimalSerializer(source='vehicle', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ServiceRecord
        fields = ['id', 'vehicle', 'vehicle_detail', 'description', 'status', 'status_display',
                  'labor_charge', 'total_amount_due', 'is_paid', 'payment_simulated_at',
                  'issues', 'created_at', 'updated_at']
        read_only_fields = ['id', 'total_amount_due', 'is_paid', 'payment_simulated_at',
                            'vehicle_detail', 'status_display', 'issues', 'created_at', 'updated_at']


class ServiceRecordListSerializer(serializers.ModelSerializer):
    vehicle_detail = VehicleMinimalSerializer(source='vehicle', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    issue_count = serializers.SerializerMethodField()

    class Meta:
        model = ServiceRecord
        fields = ['id', 'vehicle', 'vehicle_detail', 'description', 'status', 'status_display',
                  'labor_charge', 'total_amount_due', 'is_paid', 'issue_count',
                  'created_at', 'updated_at']

    def get_issue_count(self, obj):
        return obj.issues.count()
