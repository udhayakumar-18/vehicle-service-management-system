# sub_forms/service_forms.py

from django import forms
from core.models import ServiceRecord, ServiceIssue


class ServiceRecordForm(forms.ModelForm):

    class Meta:
        model = ServiceRecord
        fields = ['vehicle', 'description', 'labor_charge', 'status']


class ServiceIssueForm(forms.ModelForm):

    class Meta:
        model = ServiceIssue
        fields = ['service_record', 'description', 'component', 'action_type', 'notes']

    def clean(self):
        cleaned_data = super().clean()
        component = cleaned_data.get('component')
        action_type = cleaned_data.get('action_type')
        if component and action_type == 'new' and not component.is_in_stock():
            raise forms.ValidationError(f"{component.name} is out of stock.")
        return cleaned_data


class PaymentSimulationForm(forms.Form):
    PAYMENT_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('bank_transfer', 'Bank Transfer'),
    ]
    payment_method = forms.ChoiceField(choices=PAYMENT_CHOICES)
