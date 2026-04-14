from datetime import date
from django.db.models import Q
from rest_framework.exceptions import ValidationError
from apps.bookings.models import Booking
from django.utils import timezone


class BookingService:

    @staticmethod
    def cleanup_expired_bookings():
        """
        Lazily cancel PENDING bookings older than 15 minutes.
        """
        expiry_limit = timezone.now() - timezone.timedelta(minutes=15)
        expired = Booking.objects.filter(
            booking_status='PENDING',
            created_at__lt=expiry_limit
        )
        if expired.exists():
            expired.update(booking_status='CANCELLED')

    @staticmethod
    def check_vehicle_availability(vehicle_id: int, start_date: date, end_date: date) -> bool:
        """
        Returns True if the vehicle is available (no overlap), False otherwise.

        Overlap condition — a conflict exists when:
            existing_start_date <= new_end_date   (existing booking starts before new one ends)
          AND
            existing_end_date   >= new_start_date (existing booking ends after new one starts)

        Only PENDING and CONFIRMED bookings are considered.
        CANCELLED bookings are completely ignored.
        """
        if start_date >= end_date:
            raise ValidationError("start_date must be before end_date.")

        has_conflict = Booking.objects.filter(
            vehicle_id=vehicle_id,
            booking_status__in=['PENDING', 'CONFIRMED', 'ONGOING'],  # ONGOING also blocks dates
            start_date__lte=end_date,                     # Existing starts before new ends
            end_date__gte=start_date,                     # Existing ends after new starts
        ).exists()

        return not has_conflict  # True = available, False = conflicted

    @staticmethod
    def check_unpaid_fines(user) -> bool:
        """
        Returns True if the user has any unpaid late return fines, False otherwise.
        Checks for fine_amount > 0 and fine_paid = False.
        """
        return Booking.objects.filter(
            user=user,
            fine_amount__gt=0,
            fine_paid=False
        ).exists()

    @staticmethod
    def calculate_price(vehicle, start_date: date, end_date: date) -> dict:
        """
        Returns a dict with days, price_per_day, subtotal, tax, and total.
        days = end_date - start_date (exact calendar days, minimum 1).
        """
        days          = max(1, (end_date - start_date).days)
        price_per_day = float(vehicle.price_per_day)
        subtotal      = round(price_per_day * days, 2)
        tax           = 0  # Extend with GST calculation here if needed
        total         = round(subtotal + tax, 2)
        return {
            'days':          days,
            'price_per_day': price_per_day,
            'subtotal':      subtotal,
            'tax':           tax,
            'total':         total,
        }

    @staticmethod
    def apply_coupon(base_price: float, coupon) -> float:
        """Applies coupon discount to base_price. Returns discounted price."""
        if not coupon or not coupon.is_active:
            return base_price

        if coupon.expiry_date < timezone.now():
            raise ValidationError("Coupon has expired.")

        if coupon.discount_type == 'PERCENT':
            discount = float(coupon.value) / 100.0
            return max(0.0, round(base_price * (1 - discount), 2))
        elif coupon.discount_type == 'FIXED':
            return max(0.0, round(base_price - float(coupon.value), 2))

        return base_price

    @staticmethod
    def create_booking(user, vehicle, start_date: date, end_date: date, coupon=None) -> Booking:
        """
        Creates a booking after availability and date validation.
        Raises ValidationError if dates are invalid or vehicle is unavailable.
        """
        # Clean up stale bookings first
        BookingService.cleanup_expired_bookings()

        today = date.today()
        if start_date < today:
            raise ValidationError("start_date cannot be in the past.")
        if end_date <= start_date:
            raise ValidationError("end_date must be after start_date.")

        # ── FINE CHECK ───────────────────────────────────────────────────────────
        if BookingService.check_unpaid_fines(user):
            raise ValidationError(
                "You have unpaid fines. Please clear your fine from Booking History before making a new booking."
            )

        # ── ONE ACTIVE BOOKING RULE ──────────────────────────────────────────
        active_booking = Booking.objects.filter(
            user=user,
            booking_status__in=['PENDING', 'CONFIRMED', 'ONGOING', 'PENDING_APPROVAL']
        ).first()

        if active_booking:
            # Check if it's a PENDING booking for the same vehicle
            if active_booking.booking_status == 'PENDING' and active_booking.vehicle.id == vehicle.id:
                # We raise a specialized message that the ViewSet can detect
                raise ValidationError({
                    "pending_booking_id": active_booking.id,
                    "message": "You already have a pending booking for this vehicle."
                })
            
            raise ValidationError(
                "You already have an active booking. Please complete or cancel it before booking another vehicle."
            )

        if not BookingService.check_vehicle_availability(vehicle.id, start_date, end_date):
            raise ValidationError("Vehicle is not available for the selected dates.")

        pricing          = BookingService.calculate_price(vehicle, start_date, end_date)
        rental_amount    = pricing['subtotal']
        security_deposit = float(vehicle.security_deposit)
        
        # Apply coupon only to the rental part
        discounted_rental = BookingService.apply_coupon(rental_amount, coupon)
        total_price       = round(discounted_rental + security_deposit, 2)

        booking = Booking.objects.create(
            user=user,
            vehicle=vehicle,
            start_date=start_date,
            end_date=end_date,
            rental_amount=discounted_rental,
            security_deposit=security_deposit,
            total_price=total_price,
            coupon=coupon,
            booking_status='PENDING',
            deposit_paid=False,  # Becomes True on payment success
        )
        return booking
