from django.db import models

class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    DISCOUNT_TYPES = (('PERCENT', 'Percentage'), ('FIXED', 'Fixed Amount'))
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    expiry_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.code
