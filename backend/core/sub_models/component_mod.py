# sub_models/component_mod.py

from django.db import models


class Component(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True, null=True)
    repair_price = models.DecimalField(max_digits=10, decimal_places=2)
    new_purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'component'
        ordering = ['name']

    def __str__(self):
        return self.name

    def is_in_stock(self):
        return self.stock_quantity > 0
