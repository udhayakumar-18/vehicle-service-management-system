# sub_models/vehicle_mod.py

from django.db import models


class Vehicle(models.Model):
    license_plate = models.CharField(max_length=20, unique=True)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.PositiveIntegerField(null=True, blank=True)
    owner_name = models.CharField(max_length=200)
    owner_phone = models.CharField(max_length=20, blank=True, null=True)
    owner_email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vehicle'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.license_plate} - {self.owner_name}"

    def get_full_name(self):
        if self.year:
            return f"{self.year} {self.make} {self.model}"
        return f"{self.make} {self.model}"
