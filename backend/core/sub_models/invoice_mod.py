# sub_models/invoice_mod.py

from django.db import models
from .service_mod import ServiceRecord


class Invoice(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('bank_transfer', 'Bank Transfer'),
    ]

    invoice_number = models.CharField(max_length=20, unique=True)
    service_record = models.OneToOneField(
        ServiceRecord,
        on_delete=models.CASCADE,
        related_name='invoice'
    )
    owner_name = models.CharField(max_length=200)
    owner_phone = models.CharField(max_length=20, blank=True, null=True)
    vehicle_info = models.CharField(max_length=300)      # e.g. "2020 Toyota Camry (TN-01-AB-1234)"
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    labor_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    notes = models.TextField(blank=True, null=True)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invoice'
        ordering = ['-issued_at']

    def __str__(self):
        return f"{self.invoice_number} | {self.owner_name} | {self.total_amount}"

    @staticmethod
    def generate_invoice_number():
        from django.utils import timezone
        import random
        year = timezone.now().year
        rand = random.randint(1000, 9999)
        # make sure it's unique
        num = f"INV-{year}-{rand}"
        while Invoice.objects.filter(invoice_number=num).exists():
            rand = random.randint(1000, 9999)
            num = f"INV-{year}-{rand}"
        return num
