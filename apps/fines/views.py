from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum
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
            return Fine.objects.all().order_by('-created_at')
        return Fine.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        """Auto-set created_by and user from booking when admin creates a fine."""
        from .services import process_fine_deduction
        booking = serializer.validated_data['booking']
        fine = serializer.save(
            created_by=self.request.user,
            user=booking.user,
        )
        process_fine_deduction(fine.id)

    # ── USER ENDPOINTS ──

    @action(detail=False, methods=['get'], url_path='my-fines')
    def my_fines(self, request):
        """Fine History: all fines for the current user."""
        fines = Fine.objects.filter(user=request.user).order_by('-created_at')
        data = [
            {
                'id': f.id,
                'booking_id': f.booking_id,
                'amount': float(f.amount),
                'reason': f.reason,
                'is_deducted': f.is_deducted,
                'is_settled': f.is_settled,
                'date': f.created_at.isoformat(),
            }
            for f in fines
        ]
        return Response(data)

    @action(detail=False, methods=['get'], url_path='pending-deductions')
    def pending_deductions(self, request):
        """Pending Deductions: sum of fines not yet deducted."""
        total = Fine.objects.filter(
            user=request.user,
            is_settled=False,
        ).aggregate(total=Sum('amount'))['total'] or 0

        pending_fines = Fine.objects.filter(
            user=request.user,
            is_settled=False,
        ).values('id', 'booking_id', 'amount', 'reason', 'created_at', 'is_settled')

        return Response({
            'total_pending': float(total),
            'pending_fines': list(pending_fines),
        })

    @action(detail=True, methods=['post'], url_path='settle')
    def settle(self, request, pk=None):
        """User manually settles a fine from their refundable balance."""
        fine = self.get_object()
        
        if fine.is_settled:
            return Response({'message': 'Fine is already settled.'}, status=status.HTTP_400_BAD_REQUEST)
            
        from .services import process_fine_deduction
        updated_fine = process_fine_deduction(fine.id)
        
        if not updated_fine:
            return Response({'error': 'Error processing settlement.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        if updated_fine.is_settled:
            return Response({'message': 'Fine fully settled successfully!'})
        else:
            return Response({
                'message': 'Partial settlement successful.',
                'pending_amount': str(updated_fine.amount)
            })

    @action(detail=False, methods=['post'], url_path='pay')
    def pay(self, request):
        """User optionally pays remaining dues for a fine."""
        fine_id = request.data.get('fine_id')
        amount = request.data.get('amount')
        
        if not fine_id or amount is None:
            return Response({'error': 'fine_id and amount are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            fine = self.get_queryset().get(id=fine_id)
        except Fine.DoesNotExist:
            return Response({'error': 'Fine not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        if fine.is_settled:
            return Response({'message': 'Fine is already settled.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            payment_amount = Decimal(str(amount))
            if payment_amount <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return Response({'error': 'Valid positive amount is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        from django.db import transaction
        from apps.payments.models import Wallet, WalletTransaction
        
        with transaction.atomic():
            fine = Fine.objects.select_for_update().get(id=fine.id)
            if fine.is_settled:
                # in case it got settled in the meantime
                return Response({'message': 'Fine is already settled.'}, status=status.HTTP_400_BAD_REQUEST)
                
            actual_payment = min(payment_amount, fine.amount)
            fine.amount -= actual_payment
            
            if fine.amount == Decimal('0.00'):
                from django.utils import timezone
                fine.is_settled = True
                fine.settled_at = timezone.now()
                
            fine.save()
            
            # Record direct fine payment in wallet transaction logic?
            # It may simply represent external payment gateway, but since they don't have gateway in prompt,
            # we simulate direct successful payment.
            wallet = Wallet.objects.get(user=request.user)
            wallet.pending_deductions = max(Decimal('0.00'), wallet.pending_deductions - actual_payment)
            wallet.save()
            
            WalletTransaction.objects.create(
                wallet=wallet,
                booking=fine.booking,
                amount=actual_payment,
                tx_type='FINE',
                entry_type='DEBIT',
                message=f"Direct payment for fine {fine.id}"
            )
            
        return Response({
            'message': 'Payment successful.',
            'remaining_amount': str(fine.amount),
            'is_settled': fine.is_settled
        })

