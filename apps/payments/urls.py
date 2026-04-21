from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, WithdrawalViewSet

router = DefaultRouter()
router.register(r'withdrawals', WithdrawalViewSet, basename='wallet-withdraw')
router.register(r'', PaymentViewSet, basename='payments')

urlpatterns = [
    path('', include(router.urls)),
]
