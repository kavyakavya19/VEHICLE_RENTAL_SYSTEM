from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    UserProfileSerializer, 
    ProfileCompleteSerializer,
    LoginSerializer
)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        print(f"Registration request for email: {request.data.get('email')}")
        return super().create(request, *args, **kwargs)

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        print(f"Login request for email: {email}")
        
        user = User.objects.filter(email=email).first()
        
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "is_profile_complete": user.is_profile_complete
                }
            })
        
        return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

class UserViewSet(viewsets.GenericViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['get'])
    def profile(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put'], url_path='complete-profile')
    def complete_profile(self, request):
        serializer = ProfileCompleteSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'Profile updated', 
                'is_profile_complete': request.user.is_profile_complete
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='upload-license')
    def upload_license(self, request):
        licence_number = request.data.get('licence_number')
        licence_image = request.FILES.get('licence_image')

        if not licence_number or not licence_image:
            return Response({"error": "Both licence_number and licence_image are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        
        if user.verification_status == 'APPROVED':
            return Response({"error": "Your license is already verified and approved."}, status=status.HTTP_400_BAD_REQUEST)
        
        if user.verification_status == 'PENDING':
             return Response({"error": "Your license verification is already in progress."}, status=status.HTTP_400_BAD_REQUEST)

        user.licence_number = licence_number
        user.licence_image = licence_image
        user.verification_status = 'PENDING'
        user.is_verified = False
        user.save()

        return Response({"message": "License submitted for verification"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='verification-status')
    def verification_status(self, request):
        user = request.user
        return Response({
            "status": user.verification_status,
            "is_verified": user.is_verified,
            "remarks": user.verification_remarks
        }, status=status.HTTP_200_OK)

import os
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

class GoogleLoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        token = request.data.get('credential')
        if not token:
            return Response({"error": "No credential provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client_id = os.getenv('NEXT_PUBLIC_GOOGLE_CLIENT_ID')
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)

            email = idinfo.get('email')
            name = idinfo.get('name')

            if not email:
                return Response({"error": "Google token missing email"}, status=status.HTTP_400_BAD_REQUEST)

            # Find or create user
            user, created = User.objects.get_or_create(email=email)
            if created:
                user.name = name or email.split('@')[0]
                user.set_unusable_password()
                user.save()

            # Generate tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "is_profile_complete": getattr(user, 'is_profile_complete', False)
                }
            })

        except ValueError as e:
            # Invalid token
            print("Google OAuth verification failed:", e)
            return Response({"error": "Invalid Google token"}, status=status.HTTP_401_UNAUTHORIZED)


from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings

class ForgotPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            
            # The URL will be in Next.js
            # e.g. http://localhost:3000/reset-password/<uid>/<token>
            frontend_url = os.getenv('NEXT_PUBLIC_FRONTEND_URL', 'http://localhost:3000')
            reset_link = f"{frontend_url}/reset-password/{uid}/{token}"

            subject = "Reset your Perfect Wheels password"
            message = f"Hello,\n\nPlease click the link below to reset your password:\n\n{reset_link}\n\nIf you did not request this, please ignore this email."
            from_email = settings.EMAIL_HOST_USER

            try:
                send_mail(subject, message, from_email, [email], fail_silently=False)
            except Exception as e:
                print(f"Error sending email: {e}")
                # We can still return success to not leak that it failed, or we can log it.

        return Response({"message": "If this email exists, a reset link has been sent"}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not all([uidb64, token, new_password]):
            return Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password successfully reset"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
