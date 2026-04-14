from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from .models import Review
from .serializers import ReviewSerializer
from apps.bookings.models import Booking

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        user = self.request.user
        vehicle = serializer.validated_data['vehicle']
        
        # User can review only after completed booking
        if not Booking.objects.filter(user=user, vehicle=vehicle, booking_status='COMPLETED').exists():
            raise ValidationError("You can only review a vehicle after completing a booking for it.")
            
        serializer.save(user=user)
