from django.db import models
from django.conf import settings
from apps.bookings.models import Booking

class Payment(models.Model):
    STATUS_CHOICES = (('PENDING', 'Pending'), ('SUCCESS', 'Success'), ('FAILED', 'Failed'))
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    razorpay_order_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_signature = models.CharField(max_length=200, null=True, blank=True)
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment #{self.id} for Booking #{self.booking.id} - {self.payment_status}"


class Wallet(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    refundable_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pending_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wallet of {self.user.email} - Balance: ₹{self.balance}"


class WalletTransaction(models.Model):
    TX_TYPES = (
        ('REFUND', 'Refund'),
        ('PAYMENT', 'Payment'),
        ('FINE', 'Fine Deduction'),
        ('DEPOSIT_PAYMENT', 'Security Deposit Payment'),
        ('DEPOSIT_RELEASE', 'Security Deposit Released'),
        ('WITHDRAWAL', 'Withdrawal'),
    )
    ENTRY_TYPES = (
        ('CREDIT', 'Credit'),
        ('DEBIT', 'Debit'),
    )
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    tx_type = models.CharField(max_length=20, choices=TX_TYPES)
    entry_type = models.CharField(max_length=10, choices=ENTRY_TYPES, default='CREDIT')
    message = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tx_type} ({self.entry_type}) - ₹{self.amount} ({self.wallet.user.email})"


class WithdrawalRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='withdrawal_requests')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    bank_account_number = models.CharField(max_length=50)
    ifsc_code = models.CharField(max_length=20)
    account_holder_name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Withdrawal {self.id} - {self.user.email} - {self.status}"
