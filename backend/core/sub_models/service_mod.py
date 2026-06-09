# sub_models/service_mod.py

from django.db import models
from .vehicle_mod import Vehicle
from .component_mod import Component


class ServiceRecord(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='service_records')
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    labor_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount_due = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_paid = models.BooleanField(default=False)
    payment_simulated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'service_record'
        ordering = ['-created_at']

    def __str__(self):
        return f"Service #{self.pk} | {self.vehicle.license_plate} | {self.status}"

    def recalculate_total(self):
        issues_total = sum(issue.calculated_price for issue in self.issues.all())
        self.total_amount_due = issues_total + self.labor_charge
        self.save(update_fields=['total_amount_due', 'updated_at'])
        return self.total_amount_due


class ServiceIssue(models.Model):
    ACTION_CHOICES = [
        ('repair', 'Repair Existing'),
        ('new', 'Purchase New'),
    ]

    service_record = models.ForeignKey(ServiceRecord, on_delete=models.CASCADE, related_name='issues')
    description = models.CharField(max_length=500)
    component = models.ForeignKey(Component, on_delete=models.SET_NULL, null=True, blank=True, related_name='used_in_issues')
    action_type = models.CharField(max_length=10, choices=ACTION_CHOICES, default='repair')
    calculated_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'service_issue'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.description} ({self.action_type})"

    def save(self, *args, **kwargs):
        # auto-set price from component based on action chosen
        if self.component:
            if self.action_type == 'repair':
                self.calculated_price = self.component.repair_price
            else:
                self.calculated_price = self.component.new_purchase_price
        super().save(*args, **kwargs)
        self.service_record.recalculate_total()
