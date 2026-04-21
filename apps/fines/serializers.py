from rest_framework import serializers
from .models import Fine

class FineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fine
        fields = '__all__'
        read_only_fields = ('created_by', 'is_deducted', 'created_at')
