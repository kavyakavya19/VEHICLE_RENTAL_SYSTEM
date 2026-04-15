from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'phone', 'licence_number', 'licence_image', 'role', 'is_profile_complete', 'is_verified', 'verification_status', 'verification_remarks', 'date_joined', 'updated_at')
        read_only_fields = ('role', 'is_verified', 'verification_status', 'verification_remarks')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    email = serializers.EmailField(required=True)
    name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('name', 'email', 'password')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            name=validated_data.get('name', '')
        )
        # Securely hash the password before saving
        user.set_password(validated_data['password'])
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'phone', 'licence_number', 'licence_image', 'role', 'is_profile_complete', 'is_verified', 'verification_status', 'verification_remarks')

class ProfileCompleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('phone', 'licence_number', 'licence_image')

    def update(self, instance, validated_data):
        instance.phone = validated_data.get('phone', instance.phone)
        instance.licence_number = validated_data.get('licence_number', instance.licence_number)
        
        licence_image = validated_data.get('licence_image')
        if licence_image:
            instance.licence_image = licence_image
            
        if instance.phone and instance.licence_number and instance.licence_image:
            instance.is_profile_complete = True
            
        instance.save()
        return instance
