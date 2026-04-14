from django.db.models import Sum
from apps.payments.models import Payment
from apps.fines.models import Fine

class PaymentService:
    @staticmethod
    def get_wallet_details(user):
        from apps.payments.models import Wallet
        from apps.bookings.models import Booking
        from django.db.models import Sum
        
        wallet, _ = Wallet.objects.get_or_create(user=user)
        balance = float(wallet.balance)
        
        # Calculate held deposits (Confirmed/Ongoing trips where deposit is paid but not yet refunded)
        held_deposit = Booking.objects.filter(
            user=user,
            booking_status__in=['CONFIRMED', 'ONGOING', 'PENDING_APPROVAL'],
            deposit_paid=True,
            deposit_refunded=False
        ).aggregate(total=Sum('security_deposit'))['total'] or 0
        
        held_deposit = float(held_deposit)
        
        # Calculate pending deductions (Unpaid fines + damages)
        pending_fines = Booking.objects.filter(
            user=user,
            fine_paid=False
        ).aggregate(total=Sum('fine_amount') + Sum('damage_charge'))['total'] or 0
        
        pending_fines = float(pending_fines)
        
        return {
            'balance': balance,
            'current_balance': balance,
            'deposit_amount': held_deposit,
            'pending_fines': pending_fines,
            'refundable_amount': max(0, balance - held_deposit),
            'updated_at': wallet.updated_at
        }
