from rest_framework import serializers

class OverallStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_vehicles = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    active_bookings = serializers.IntegerField()
    completed_bookings = serializers.IntegerField()
    cancelled_bookings = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_fines = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_reviews = serializers.IntegerField()
    average_rating = serializers.FloatField()
    most_booked_vehicle = serializers.CharField()

class MonthlyRevenueSerializer(serializers.Serializer):
    month = serializers.CharField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)

class MonthlyBookingSerializer(serializers.Serializer):
    month = serializers.CharField()
    bookings = serializers.IntegerField()
