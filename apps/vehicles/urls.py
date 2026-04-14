from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet, VehicleImageViewSet

router = DefaultRouter()
router.register(r'images', VehicleImageViewSet, basename='vehicle-images')
router.register(r'', VehicleViewSet, basename='vehicles')

urlpatterns = [
    path('', include(router.urls)),
]
