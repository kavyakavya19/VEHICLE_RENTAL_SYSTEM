from django.db import models
from cloudinary.models import CloudinaryField

class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    logo = models.ImageField(upload_to='brands/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Vehicle(models.Model):
    name                = models.CharField(max_length=255)
    type                = models.CharField(max_length=100)
    brand_str           = models.CharField(max_length=100, null=True, blank=True) # Renamed from 'brand'
    brand               = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='vehicles')
    price_per_day       = models.DecimalField(max_digits=10, decimal_places=2, help_text="Base price for 24-hour rental")
    price_per_hour      = models.DecimalField(max_digits=10, decimal_places=2, default=100, help_text="Base price for 1-hour rental")
    late_fee_per_day    = models.DecimalField(max_digits=10, decimal_places=2, default=500,
                            help_text="Daily fine added for late returns")
    fine_per_hour       = models.DecimalField(max_digits=10, decimal_places=2, default=100,
                            help_text="Hourly fine added for late returns")
    security_deposit    = models.DecimalField(max_digits=10, decimal_places=2, default=2000,
                            help_text="Refundable deposit paid at booking")
    color               = models.CharField(max_length=50, blank=True, null=True)
    vehicle_number      = models.CharField(max_length=50, blank=True, null=True, unique=True)
    condition           = models.CharField(max_length=100, blank=True, null=True, default='Excellent')
    availability_status = models.BooleanField(default=True)
    is_available        = models.BooleanField(default=True)
    maintenance_status  = models.BooleanField(default=False)
    image               = CloudinaryField('image', folder='vehicles', null=True, blank=True)
    description         = models.TextField(blank=True)
    
    # Detailed Specs
    mileage             = models.CharField(max_length=50, blank=True, null=True, default='15 km/pl')
    engine              = models.CharField(max_length=100, blank=True, null=True, default='1200cc')
    transmission        = models.CharField(max_length=50, blank=True, null=True, default='Manual')
    fuel_type           = models.CharField(max_length=50, blank=True, null=True, default='Petrol')
    seats               = models.IntegerField(default=5)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):

        return f"{self.brand} {self.name}"

class VehicleImage(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='images')
    image = CloudinaryField('image', folder='vehicles', null=True, blank=True)
