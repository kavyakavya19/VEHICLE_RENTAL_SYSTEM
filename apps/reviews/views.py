from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer
from apps.bookings.models import Booking

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'my_reviews']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        user = self.request.user
        booking = serializer.validated_data.get('booking')
        
        if not booking:
            raise ValidationError({'booking': "Booking ID is required."})

        if booking.user != user:
            raise ValidationError("You can only review your own bookings.")
            
        if booking.booking_status != 'COMPLETED':
            raise ValidationError("You can only review a completed booking.")
            
        if hasattr(booking, 'review') or Review.objects.filter(booking=booking).exists():
            raise ValidationError("This booking has already been reviewed.")
            
        serializer.save(user=user, vehicle=booking.vehicle)

    @action(detail=False, methods=['get'], url_path='my-reviews')
    def my_reviews(self, request):
        reviews = Review.objects.filter(user=request.user).order_by('-created_at')
        return Response(ReviewSerializer(reviews, many=True).data)
