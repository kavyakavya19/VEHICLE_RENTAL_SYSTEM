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
            booking_status__in=['PENDING', 'CONFIRMED', 'ONGOING'],
            start_date__lt=end_date,                     # Existing starts strictly before new ends
            end_date__gt=start_date,                     # Existing ends strictly after new starts
        ).exists()

        return not has_conflict  # True = available, False = conflicted

    @staticmethod
    def check_unpaid_fines(user) -> bool:
        """
        Returns True if the user has any unpaid late return fines, False otherwise.
        Checks for fine_amount > 0 and fine_paid = False.
        Also checks new fine dues.
        """
        has_booking_fines = Booking.objects.filter(
            user=user,
            fine_amount__gt=0,
            fine_paid=False
        ).exists()
        
        from apps.fines.services import has_pending_dues
        return has_booking_fines or has_pending_dues(user)

    @staticmethod
    def calculate_price(vehicle, start_date, end_date, booking_type='DAILY') -> dict:
        import math
        
        if booking_type == 'HOURLY':
            delta = end_date - start_date
            total_seconds = delta.total_seconds()
            hours = math.ceil(total_seconds / 3600.0)
            
            if hours < 2:
                raise ValidationError("Minimum booking duration for hourly rental is 2 hours.")
                
            price_per_hour = float(vehicle.price_per_hour)
            price_per_day = float(vehicle.price_per_day)
            
            if hours < 8:
                subtotal = hours * price_per_hour
            elif hours <= 24:
                subtotal = price_per_day
            else:
                days = math.ceil(hours / 24.0)
                subtotal = days * price_per_day
                
            tax = 0
            total = round(subtotal + tax, 2)
            return {
                'days': math.ceil(hours / 24.0),
                'hours': hours,
                'price_per_day': price_per_day,
                'price_per_hour': price_per_hour,
                'subtotal': subtotal,
                'tax': tax,
                'total': total,
            }
        else:
            days          = max(1, (end_date - start_date).days)
            price_per_day = float(vehicle.price_per_day)
            subtotal      = round(price_per_day * days, 2)
            tax           = 0
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
    def calculate_fine(vehicle, end_date, return_time) -> dict:
        """
        Calculates late fee based on hourly delay. 
        Even 1 minute late results in 1 full hour fine.
        """
        import math
        from django.utils import timezone
        
        if return_time <= end_date:
            return {'fine_amount': 0.0, 'extra_hours': 0}
            
        delay = return_time - end_date
        extra_hours = math.ceil(delay.total_seconds() / 3600.0)
        fine_per_hour = float(vehicle.fine_per_hour)
        fine_amount = round(extra_hours * fine_per_hour, 2)
        
        return {
            'fine_amount': fine_amount,
            'extra_hours': extra_hours,
            'fine_per_hour': fine_per_hour
        }

    @staticmethod
    def calculate_wallet_deductions(user, rental_amount, deposit_amount):
        """
        Calculates how much can be covered by wallet (Refundable first, then Balance).
        Returns a breakdown for UI and backend processing.
        """
        from apps.payments.models import Wallet
        from decimal import Decimal
        
        wallet, _ = Wallet.objects.get_or_create(user=user)
        ref_bal = wallet.refundable_balance
        bal = wallet.balance
        
        rental = Decimal(str(rental_amount))
        deposit = Decimal(str(deposit_amount))
        
        breakdown = {
            'deposit': {
                'from_refundable': Decimal('0'),
                'from_balance': Decimal('0'),
                'external': Decimal('0'),
            },
            'rental': {
                'from_refundable': Decimal('0'),
                'from_balance': Decimal('0'),
                'external': Decimal('0'),
            },
            'total_wallet_deduction': Decimal('0'),
            'total_external_payment': Decimal('0')
        }
        
        # 1. Fulfill DEPOSIT first
        # Source: Refundable
        take_rec = min(ref_bal, deposit)
        breakdown['deposit']['from_refundable'] = take_rec
        ref_bal -= take_rec
        rem_deposit = deposit - take_rec
        
        # Source: Balance
        take_bal = min(bal, rem_deposit)
        breakdown['deposit']['from_balance'] = take_bal
        bal -= take_bal
        breakdown['deposit']['external'] = rem_deposit - take_bal
        
        # 2. Fulfill RENTAL next
        # Source: Remaining Refundable
        take_rec_rent = min(ref_bal, rental)
        breakdown['rental']['from_refundable'] = take_rec_rent
        ref_bal -= take_rec_rent
        rem_rental = rental - take_rec_rent
        
        # Source: Remaining Balance
        take_bal_rent = min(bal, rem_rental)
        breakdown['rental']['from_balance'] = take_bal_rent
        bal -= take_bal_rent
        breakdown['rental']['external'] = rem_rental - take_bal_rent
        
        breakdown['total_wallet_deduction'] = (
            breakdown['deposit']['from_refundable'] + breakdown['deposit']['from_balance'] +
            breakdown['rental']['from_refundable'] + breakdown['rental']['from_balance']
        )
        breakdown['total_external_payment'] = breakdown['deposit']['external'] + breakdown['rental']['external']
        
        return breakdown

    @staticmethod
    def create_booking(user, vehicle, start_date, end_date, booking_type='DAILY', coupon=None) -> Booking:
        """
        Creates a booking after availability and date validation.
        Raises ValidationError if dates are invalid or vehicle is unavailable.
        """
        # Clean up stale bookings first
        BookingService.cleanup_expired_bookings()

        now = timezone.now()
        if start_date < now:
            raise ValidationError("start_date cannot be in the past.")
        if end_date <= start_date:
            raise ValidationError("end_date must be after start_date.")

        # ── FINE CHECK
        if BookingService.check_unpaid_fines(user):
            raise ValidationError(
                "You have unpaid fines. Please clear your fine from Booking History before making a new booking."
            )

        # ── ONE ACTIVE BOOKING RULE
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

        pricing          = BookingService.calculate_price(vehicle, start_date, end_date, booking_type)
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
            booking_type=booking_type,
            rental_amount=discounted_rental,
            security_deposit=security_deposit,
            total_price=total_price,
            coupon=coupon,
            booking_status='PENDING',
            deposit_paid=False,  # Becomes True on payment success
        )
        return booking

    @staticmethod
    def release_security_deposit(booking):
        """
        Moves the security deposit from locked wallet.security_deposit to wallet.refundable_balance.
        Deducts fines and damage charges if present.
        """
        from apps.fines.models import Fine
        from apps.payments.models import Wallet, WalletTransaction
        from django.db import transaction
        from decimal import Decimal

        if booking.deposit_released:
            return False, "Deposit already released."

        deposit = Decimal(str(booking.security_deposit))
        
        # Calculate new fines
        unsettled_fines = booking.fines.filter(is_settled=False)
        total_new_fines = sum((fine.amount for fine in unsettled_fines), Decimal('0'))

        total_deduction = Decimal(str(booking.fine_amount)) + Decimal(str(booking.damage_charge)) + total_new_fines
        refund_amount = max(Decimal('0'), deposit - total_deduction)

        with transaction.atomic():
            wallet, _ = Wallet.objects.get_or_create(user=booking.user)
            
            # 1. Update Wallet
            wallet.security_deposit = max(Decimal('0'), wallet.security_deposit - deposit)
            wallet.refundable_balance += refund_amount
            wallet.save()

            # 1.5 Update Fines
            for fine in unsettled_fines:
                fine.is_deducted = True
                fine.is_settled = True
                fine.save(update_fields=['is_deducted', 'is_settled'])

            # 2. Mark Booking
            booking.deposit_released = True
            booking.save(update_fields=['deposit_released'])

            # 3. Create Transaction Logs
            if total_deduction > 0:
                 WalletTransaction.objects.create(
                     wallet=wallet,
                     booking=booking,
                     amount=total_deduction,
                     tx_type='FINE',
                     entry_type='DEBIT',
                     message=f"Deduction for late fine/damage (Booking #{booking.id})"
                 )

            if refund_amount > 0:
                 WalletTransaction.objects.create(
                     wallet=wallet,
                     booking=booking,
                     amount=refund_amount,
                     tx_type='DEPOSIT_RELEASE',
                     entry_type='CREDIT',
                     message=f"Security deposit released to refundable balance (Booking #{booking.id})"
                 )

        return True, f"Released ₹{refund_amount} to refundable balance."
