from rest_framework import serializers
from .models import Review
from apps.users.serializers import UserSerializer

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ('id', 'user', 'vehicle', 'booking', 'rating', 'comment', 'created_at')
        read_only_fields = ('user', 'vehicle')
