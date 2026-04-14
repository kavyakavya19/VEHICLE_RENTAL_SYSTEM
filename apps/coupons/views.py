from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Coupon
from .serializers import CouponSerializer
from core.permissions import IsAdminUserRole

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'apply']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]

    @action(detail=False, methods=['post'], url_path='apply')
    def apply(self, request):
        code = request.data.get('code')
        amount = request.data.get('amount')
        
        if not code or amount is None:
            return Response({'error': 'code and amount are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            amount = float(amount)
            coupon = Coupon.objects.get(code=code, is_active=True)
            
            from django.utils import timezone
            if coupon.expiry_date and coupon.expiry_date < timezone.now():
                return Response({'error': 'Coupon has expired'}, status=status.HTTP_400_BAD_REQUEST)
                
            discount = 0
            if coupon.discount_type == 'PERCENT':
                discount = amount * (float(coupon.value) / 100.0)
            elif coupon.discount_type == 'FIXED':
                discount = float(coupon.value)
                
            discount = min(discount, amount) # restrict discount to not exceed amount
            final_amount = amount - discount
            
            return Response({'discount': discount, 'final_amount': final_amount})
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid or inactive coupon'}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
