from rest_framework import serializers
from .models import Payment, WithdrawalRequest

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('booking', 'amount', 'payment_status', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature')


class WithdrawalRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = WithdrawalRequest
        fields = '__all__'
        read_only_fields = ('user', 'status', 'created_at', 'processed_at')
