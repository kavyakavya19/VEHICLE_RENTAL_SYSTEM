from rest_framework import viewsets, permissions
from .models import Vehicle, VehicleImage
from .serializers import VehicleSerializer, VehicleImageSerializer
from core.permissions import IsAdminUserOrReadOnly


class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = (IsAdminUserOrReadOnly,)
    filterset_fields = ['type', 'brand', 'availability_status', 'maintenance_status']
    search_fields = ['name', 'brand']
    ordering_fields = ['price_per_day', 'created_at']

    def get_queryset(self):
        """
        ADMIN users see ALL vehicles (including under maintenance).
        Regular/unauthenticated users see ONLY vehicles that are:
          - availability_status = True  (not manually disabled by admin)
          - maintenance_status  = False (not under maintenance)
        This ensures admin changes in the Django admin panel are
        reflected IMMEDIATELY in the user-facing vehicle list.
        """
        user = self.request.user
        is_admin = (
            user.is_authenticated and
            getattr(user, 'role', '') == 'ADMIN'
        )

        if is_admin:
            # Admin sees all vehicles regardless of status
            return Vehicle.objects.all().order_by('-created_at')

        # Regular users / public: only show bookable vehicles
        return Vehicle.objects.filter(
            availability_status=True,
            maintenance_status=False,
        ).order_by('-created_at')


class VehicleImageViewSet(viewsets.ModelViewSet):
    queryset = VehicleImage.objects.all()
    serializer_class = VehicleImageSerializer
    permission_classes = (IsAdminUserOrReadOnly,)
