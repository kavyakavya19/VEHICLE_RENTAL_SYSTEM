from rest_framework import serializers
from .models import Vehicle, VehicleImage


class VehicleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleImage
        fields = ('id', 'image')


class VehicleSerializer(serializers.ModelSerializer):
    images        = VehicleImageSerializer(many=True, read_only=True)
    image         = serializers.SerializerMethodField()
    vehicle_type  = serializers.SerializerMethodField()
    is_bookable   = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = (
            'id', 'name', 'type', 'vehicle_type', 'brand', 'price_per_day',
            'late_fee_per_day',
            'color', 'vehicle_number', 'condition',
            'availability_status', 'maintenance_status',
            'is_bookable',
            'description', 'images', 'image',
            'created_at', 'updated_at',
        )
        # availability_status and maintenance_status are NOT read-only:
        # admins must be able to update them via API / Django admin.
        read_only_fields = ('created_at', 'updated_at')

    def get_image(self, obj):
        first_image = obj.images.first()
        if first_image and first_image.image:
            return first_image.image.url
        return None

    def get_vehicle_type(self, obj):
        return obj.type

    def get_is_bookable(self, obj):
        """True only when neither maintenance nor manually disabled."""
        return obj.availability_status is True and obj.maintenance_status is False
