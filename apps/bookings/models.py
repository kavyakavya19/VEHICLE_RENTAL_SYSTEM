from django.db import models
from django.conf import settings
from apps.vehicles.models import Vehicle
from apps.coupons.models import Coupon


class Booking(models.Model):
    """
    Represents a vehicle reservation made by a User.

    Status lifecycle:
        PENDING → CONFIRMED → ONGOING
                                  ↓ (on time)        ↓ (late)
                              COMPLETED         PENDING_APPROVAL
                                                      ↓ (fine paid)
                                                  COMPLETED
        Any active status → CANCELLED
    """
    BOOKING_STATUS_CHOICES = (
        ('PENDING',          'Pending'),           # Created, awaiting payment
        ('CONFIRMED',        'Confirmed'),          # Payment done
        ('ONGOING',          'Ongoing'),            # Trip in progress
        ('PENDING_APPROVAL', 'Pending Approval'),   # Late return / Damages — admin must review
        ('COMPLETED',        'Completed'),          # Trip done, fine confirmed (if any)
        ('REFUNDED',         'Refunded'),           # Security deposit refunded
        ('CANCELLED',        'Cancelled'),          # Booking cancelled
    )

    user    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='bookings')
    coupon  = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)

    start_date     = models.DateField()
    end_date       = models.DateField()
    
    # ── Financial Breakdown ──────────────────────────────────────────────────
    rental_amount      = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    security_deposit   = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price        = models.DecimalField(max_digits=10, decimal_places=2, help_text="Total = Rental + Deposit - Coupon")
    
    booking_status = models.CharField(max_length=20, choices=BOOKING_STATUS_CHOICES, default='PENDING')
    created_at     = models.DateTimeField(auto_now_add=True)

    # ── Late Return & Damage fields ──────────────────────────────────────────
    actual_return_date = models.DateField(null=True, blank=True)
    late_days          = models.IntegerField(default=0)
    fine_amount        = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    damage_charge      = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                            help_text="Estimated cost for repairs found after return")
    
    # ── Refund Logic ─────────────────────────────────────────────────────────
    refund_amount      = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                            help_text="Refund = Deposit - Fine - Damage (Max 0)")
    deposit_paid       = models.BooleanField(default=False)
    deposit_refunded   = models.BooleanField(default=False)
    fine_paid          = models.BooleanField(default=False)
    
    invoice_file       = models.FileField(upload_to='invoices/', null=True, blank=True)

    def __str__(self):
        return f"Booking #{self.id} — {self.vehicle} [{self.booking_status}]"
