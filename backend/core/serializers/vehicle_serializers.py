# serializers/vehicle_serializers.py

from rest_framework import serializers
from core.models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = ['id', 'license_plate', 'make', 'model', 'year',
                  'owner_name', 'owner_phone', 'owner_email',
                  'full_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'full_name', 'created_at', 'updated_at']

    def get_full_name(self, obj):
        return obj.get_full_name()

    def validate_license_plate(self, value):
        return value.strip().upper()


class VehicleMinimalSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = ['id', 'license_plate', 'owner_name', 'full_name']

    def get_full_name(self, obj):
        return obj.get_full_name()
