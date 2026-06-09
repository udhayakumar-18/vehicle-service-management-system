# serializers/component_serializers.py

from rest_framework import serializers
from core.models import Component


class ComponentSerializer(serializers.ModelSerializer):
    is_in_stock = serializers.SerializerMethodField()

    class Meta:
        model = Component
        fields = ['id', 'name', 'description', 'repair_price', 'new_purchase_price',
                  'stock_quantity', 'is_in_stock', 'created_at', 'updated_at']
        read_only_fields = ['id', 'is_in_stock', 'created_at', 'updated_at']

    def get_is_in_stock(self, obj):
        return obj.is_in_stock()

    def validate_repair_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Repair price cannot be negative.")
        return value

    def validate_new_purchase_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Purchase price cannot be negative.")
        return value


class ComponentMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = ['id', 'name', 'repair_price', 'new_purchase_price']
