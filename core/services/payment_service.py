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
        
        # Calculate pending deductions: Unpaid fines/damages from Booking + new Fine model
        pending_fines_booking = Booking.objects.filter(
            user=user,
            fine_paid=False
        ).aggregate(
            total=Sum('fine_amount') + Sum('damage_charge')
        )['total'] or 0

        pending_fines_model = Fine.objects.filter(
            user=user,
            is_settled=False
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_pending = float(pending_fines_booking) + float(pending_fines_model)

        # We keep the physical wallet fields in sync or just return them
        # We can auto-sync the pending_deductions here just to be safe
        if float(wallet.pending_deductions) != total_pending:
            wallet.pending_deductions = total_pending
            wallet.save()

        return {
            'balance': float(wallet.balance),
            'security_deposit': float(wallet.security_deposit),
            'refundable_balance': float(wallet.refundable_balance),
            'pending_fines': float(wallet.pending_deductions),
            'updated_at': wallet.updated_at
        }
