from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.db.models import Sum
from apps.fines.models import Fine
from apps.payments.models import Wallet, WalletTransaction
import logging

logger = logging.getLogger(__name__)

@transaction.atomic
def process_fine_deduction(fine_id):
    try:
        # Fetch fine + user wallet atomically
        fine = Fine.objects.select_for_update().get(id=fine_id)
        
        # If fine.is_settled -> RETURN (avoid duplicate deduction)
        if fine.is_settled:
            return fine

        wallet = Wallet.objects.select_for_update().get(user=fine.user)

        # 3. If wallet.refundable_balance >= fine.amount:
        if wallet.refundable_balance >= fine.amount:
            deduct_amount = fine.amount
            
            # Deduct full amount
            wallet.refundable_balance -= deduct_amount
            wallet.pending_deductions = max(Decimal('0.00'), wallet.pending_deductions - deduct_amount)
            
            # fine.is_settled = True
            # fine.settled_at = now()
            fine.is_settled = True
            fine.settled_at = timezone.now()
            
            # I am also updating deduct logic to not lose track of the original amount if they change fine.amount,
            # but wait, if it's full amount, we don't modify fine.amount.
            
            # Provide wallet transaction record for transparency
            WalletTransaction.objects.create(
                wallet=wallet,
                booking=fine.booking,
                amount=deduct_amount,
                tx_type='FINE',
                entry_type='DEBIT',
                message=f"Auto-deducted fine {fine.id} for booking {fine.booking.id}"
            )
            
        # 4. Else:
        else:
            # Deduct partial
            deduct_amount = wallet.refundable_balance
            
            if deduct_amount > 0:
                wallet.refundable_balance = Decimal('0.00')
                wallet.pending_deductions = max(Decimal('0.00'), wallet.pending_deductions - deduct_amount)
                
                # Transaction for partial deduct
                WalletTransaction.objects.create(
                    wallet=wallet,
                    booking=fine.booking,
                    amount=deduct_amount,
                    tx_type='FINE',
                    entry_type='DEBIT',
                    message=f"Partially auto-deducted fine {fine.id} for booking {fine.booking.id}"
                )
            
            # remaining = fine.amount - wallet.refundable_balance
            remaining = fine.amount - deduct_amount
            
            # fine.amount = remaining (remaining pending)
            fine.amount = remaining
            # fine.is_settled = False
            fine.is_settled = False

        wallet.save()
        fine.save()
        
        return fine

    except Exception as e:
        logger.error(f"Error processing fine deduction for fine_id {fine_id}: {str(e)}")
        # Never break
        return None

def process_all_pending_fines(user):
    """Auto-deduct all pending fines for a user using their available refundable balance."""
    try:
        pending_fines = Fine.objects.filter(user=user, is_settled=False).order_by('created_at')
        for fine in pending_fines:
            process_fine_deduction(fine.id)
    except Exception as e:
        logger.error(f"Error processing all pending fines for user {user.id}: {str(e)}")

def has_pending_dues(user):
    """
    return sum of all fines where is_settled=False > 0
    """
    total = Fine.objects.filter(user=user, is_settled=False).aggregate(total=Sum('amount'))['total']
    return total > 0 if total else False
