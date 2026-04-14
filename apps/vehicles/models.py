from django.db import models

class Vehicle(models.Model):
    name                = models.CharField(max_length=255)
    type                = models.CharField(max_length=100)
    brand               = models.CharField(max_length=100)
    price_per_day       = models.DecimalField(max_digits=10, decimal_places=2, help_text="Base price for 24-hour rental")
    late_fee_per_day    = models.DecimalField(max_digits=10, decimal_places=2, default=500,
                            help_text="Daily fine added for late returns")
    security_deposit    = models.DecimalField(max_digits=10, decimal_places=2, default=2000,
                            help_text="Refundable deposit paid at booking")
    color               = models.CharField(max_length=50, blank=True, null=True)
    vehicle_number      = models.CharField(max_length=50, blank=True, null=True, unique=True)
    condition           = models.CharField(max_length=100, blank=True, null=True, default='Excellent')
    availability_status = models.BooleanField(default=True)
    maintenance_status  = models.BooleanField(default=False)
    description         = models.TextField(blank=True)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):

        return f"{self.brand} {self.name}"

class VehicleImage(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='vehicles/')
