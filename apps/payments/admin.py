from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'amount', 'payment_status', 'razorpay_order_id', 'created_at')
    list_filter = ('payment_status',)
    readonly_fields = ('razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'created_at')

    fieldsets = (
        ('Payment Details', {'fields': ('booking', 'amount', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature')}),
        ('Status', {'fields': ('payment_status', 'created_at')})
    )
