from django.contrib import admin
from django.utils import timezone
from django.db import transaction
from .models import Payment, WithdrawalRequest, Wallet, WalletTransaction

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'amount', 'payment_status', 'razorpay_order_id', 'created_at')
    list_filter = ('payment_status',)
    readonly_fields = ('razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'created_at')

    fieldsets = (
        ('Payment Details', {'fields': ('booking', 'amount', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature')}),
        ('Status', {'fields': ('payment_status', 'created_at')})
    )


@admin.register(WithdrawalRequest)
class WithdrawalRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'amount', 'status', 'created_at', 'processed_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'bank_account_number', 'account_holder_name')
    readonly_fields = ('created_at', 'processed_at')

    def save_model(self, request, obj, form, change):
        if change: # If updating an existing request
            old_obj = WithdrawalRequest.objects.get(pk=obj.pk)
            
            if old_obj.status == 'PENDING' and obj.status == 'APPROVED':
                obj.processed_at = timezone.now()
                # Manual bank transfer is assumed done as per prompt
                
            elif old_obj.status == 'PENDING' and obj.status == 'REJECTED':
                # Refund back to wallet.refundable_balance
                with transaction.atomic():
                    wallet, _ = Wallet.objects.get_or_create(user=obj.user)
                    wallet.refundable_balance += obj.amount
                    wallet.save()
                    
                    WalletTransaction.objects.create(
                        wallet=wallet,
                        amount=obj.amount,
                        tx_type='REFUND',
                        entry_type='CREDIT',
                        message=f"Refund from rejected withdrawal request #{obj.id}"
                    )
            
            # Prevent changing status once it's already APPROVED or REJECTED
            elif old_obj.status in ['APPROVED', 'REJECTED']:
                obj.status = old_obj.status
                
        super().save_model(request, obj, form, change)
