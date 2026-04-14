from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Fine
from .serializers import FineSerializer
from core.permissions import IsAdminUserRole

class FineViewSet(viewsets.ModelViewSet):
    serializer_class = FineSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Fine.objects.none()
        if getattr(self.request.user, 'role', '') == 'ADMIN':
            return Fine.objects.all()
        return Fine.objects.filter(booking__user=self.request.user)
        
    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        fine = self.get_object()
        if fine.status == 'PAID':
            return Response({'error': 'Fine is already paid.'}, status=status.HTTP_400_BAD_REQUEST)
        fine.status = 'PAID'
        fine.save()
        return Response({'status': 'Fine paid successfully.'})
