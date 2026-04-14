from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Enquiry
from .serializers import EnquirySerializer
from core.permissions import IsAdminUserRole
from django.core.mail import send_mail
from django.conf import settings

class EnquiryViewSet(viewsets.ModelViewSet):
    queryset = Enquiry.objects.all().order_by('-created_at')
    serializer_class = EnquirySerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.AllowAny()]
        if self.action in ['my_enquiries']:
            return [permissions.IsAuthenticated()]
        # List and partial_update (reply) are admin only
        return [IsAdminUserRole()]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        instance = serializer.save(user=user)
        
        # Notify ADMIN (Optional High Impact)
        try:
            send_mail(
                subject='New Customer Enquiry Received',
                message=f"New enquiry from {instance.name} ({instance.email}).\n\nMessage: {instance.message}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_EMAIL],
                fail_silently=True
            )
        except:
            pass

    @action(detail=False, methods=['get'], url_path='my')
    def my_enquiries(self, request):
        enquiries = Enquiry.objects.filter(user=request.user).order_by('-created_at')
        serializer = self.get_serializer(enquiries, many=True)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        # This is used for Admin Reply
        response = super().partial_update(request, *args, **kwargs)
        instance = self.get_object()
        
        # If enquiry is resolved and has a reply, notify the user
        if instance.status == 'RESOLVED' and instance.admin_reply:
            try:
                send_mail(
                    subject='Response to your Enquiry',
                    message=f"Hello {instance.name},\n\nOur admin has replied to your enquiry:\n\n{instance.admin_reply}\n\nThank you for choosing us!",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.email],
                    fail_silently=True
                )
            except:
                pass
        
        return response
