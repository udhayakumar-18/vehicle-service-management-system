# sub_forms/component_forms.py

from django import forms
from core.models import Component


class ComponentForm(forms.ModelForm):

    class Meta:
        model = Component
        fields = ['name', 'description', 'repair_price', 'new_purchase_price', 'stock_quantity']

    def clean_repair_price(self):
        val = self.cleaned_data.get('repair_price')
        if val is not None and val < 0:
            raise forms.ValidationError("Repair price cannot be negative.")
        return val

    def clean_new_purchase_price(self):
        val = self.cleaned_data.get('new_purchase_price')
        if val is not None and val < 0:
            raise forms.ValidationError("Purchase price cannot be negative.")
        return val
