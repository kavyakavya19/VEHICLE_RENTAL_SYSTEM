from datetime import datetime, date
from django.db.models import Q
from rest_framework.exceptions import ValidationError
from .models import Booking
from apps.vehicles.models import Vehicle

class BookingService:
    @staticmethod
    def check_availability(vehicle_id: int, start_date: date, end_date: date) -> bool:
        if start_date >= end_date:
            raise ValidationError("End date must be after start date.")
            
        conflicting_bookings = Booking.objects.filter(
            vehicle_id=vehicle_id,
            status__in=['APPROVED', 'PENDING']
        ).filter(
            Q(start_date__lte=end_date) & Q(end_date__gte=start_date)
        )
        return not conflicting_bookings.exists()

    @staticmethod
    def calculate_price(vehicle: Vehicle, start_date: date, end_date: date, coupon=None) -> float:
        delta = (end_date - start_date).days
        days = max(1, delta)
        base_price = float(vehicle.price_per_day) * days
        
        if coupon and coupon.active and coupon.valid_from.date() <= start_date <= coupon.valid_to.date():
            discount = float(coupon.discount_percentage) / 100.0
            base_price = base_price * (1 - discount)
        
        return round(base_price, 2)
