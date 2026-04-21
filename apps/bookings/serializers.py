from rest_framework import serializers
from .models import Booking
from apps.vehicles.serializers import VehicleSerializer
from apps.users.serializers import UserSerializer
from apps.coupons.serializers import CouponSerializer
from apps.coupons.models import Coupon


class BookingReadSerializer(serializers.ModelSerializer):
    vehicle = VehicleSerializer(read_only=True)
    user    = UserSerializer(read_only=True)
    coupon  = CouponSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'


class BookingWriteSerializer(serializers.ModelSerializer):
    coupon_code = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Booking
        fields = ('vehicle', 'coupon_code', 'start_date', 'end_date', 'booking_type')

    def validate(self, data):
        if data.get('start_date') and data.get('end_date') and data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("End date must be after start date.")

        coupon_code = data.pop('coupon_code', None)
        data['coupon'] = None
        if coupon_code:
            try:
                data['coupon'] = Coupon.objects.get(code=coupon_code, is_active=True)
            except Coupon.DoesNotExist:
                raise serializers.ValidationError({"coupon_code": "Invalid or inactive coupon."})

        return data


class MyBookingSerializer(serializers.ModelSerializer):
    """
    Serializer for the user-facing booking history.
    Includes full payment details so admins updating payment_status
    in the Django admin panel is IMMEDIATELY reflected here.
    """
    vehicle_name   = serializers.CharField(source='vehicle.name', read_only=True)
    vehicle_brand  = serializers.CharField(source='vehicle.brand', read_only=True)
    vehicle        = serializers.CharField(source='vehicle.name', read_only=True)
    status         = serializers.CharField(source='booking_status', read_only=True)

    # ── Payment fields — nested from the related Payment record 
    payment_status    = serializers.SerializerMethodField()
    payment_id        = serializers.SerializerMethodField()
    payment_amount    = serializers.SerializerMethodField()
    razorpay_order_id = serializers.SerializerMethodField()

    class Meta:
        model  = Booking
        fields = (
            'id', 'vehicle', 'vehicle_name', 'vehicle_brand',
            'start_date', 'end_date', 'booking_type',
            'total_price', 'booking_status', 'status',
            # payment fields
            'payment_status', 'payment_id', 'payment_amount', 'razorpay_order_id',
            # late return & refund fields
            'actual_return_time', 'late_days', 'fine_amount', 'fine_paid',
            'rental_amount', 'security_deposit', 'damage_charge', 'refund_amount',
            'deposit_paid', 'deposit_refunded',
            'created_at', 'has_review',
        )

    has_review = serializers.SerializerMethodField()

    def get_has_review(self, obj):
        return hasattr(obj, 'review')

    def get_payment_status(self, obj):
        """Returns payment status: PENDING / SUCCESS / FAILED — or None if no payment record."""
        if hasattr(obj, 'payment') and obj.payment:
            return obj.payment.payment_status
        return None

    def get_payment_id(self, obj):
        if hasattr(obj, 'payment') and obj.payment:
            return obj.payment.razorpay_payment_id
        return None

    def get_payment_amount(self, obj):
        if hasattr(obj, 'payment') and obj.payment:
            return str(obj.payment.amount)
        return None

    def get_razorpay_order_id(self, obj):
        if hasattr(obj, 'payment') and obj.payment:
            return obj.payment.razorpay_order_id
        return None
