from django.db import models
from apps.bookings.models import Booking

class Fine(models.Model):
    FINE_TYPES = (('LATE', 'Late Return'), ('DAMAGE', 'Damage'))
    STATUS_CHOICES = (('UNPAID', 'Unpaid'), ('PAID', 'Paid'))
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='fines')
    fine_type = models.CharField(max_length=20, choices=FINE_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    proof_image = models.ImageField(upload_to='fines/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='UNPAID')
    created_at = models.DateTimeField(auto_now_add=True)
