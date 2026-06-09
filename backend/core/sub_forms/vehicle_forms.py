# sub_forms/vehicle_forms.py

from django import forms
from core.models import Vehicle


class VehicleForm(forms.ModelForm):

    class Meta:
        model = Vehicle
        fields = ['license_plate', 'make', 'model', 'year', 'owner_name', 'owner_phone', 'owner_email']

    def clean_license_plate(self):
        plate = self.cleaned_data.get('license_plate', '')
        return plate.strip().upper()
