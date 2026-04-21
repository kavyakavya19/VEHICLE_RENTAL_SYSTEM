from django.db import models
from apps.bookings.models import Booking
from django.conf import settings

class Fine(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='fines')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='fines')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='fines_created')
    created_at = models.DateTimeField(auto_now_add=True)
    is_deducted = models.BooleanField(default=False)
    is_settled = models.BooleanField(default=False)
    settled_at = models.DateTimeField(null=True, blank=True)
    def __str__(self):
        return f"Fine #{self.id} for Booking #{self.booking_id}"
