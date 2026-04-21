import logging
from decimal import Decimal
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.conf import settings
from django.db import transaction
from .models import Payment, Wallet, WalletTransaction, WithdrawalRequest
from .serializers import PaymentSerializer, WithdrawalRequestSerializer
from core.permissions import IsAdminUserRole
from apps.bookings.models import Booking
import razorpay

logger = logging.getLogger(__name__)


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUserRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Payment.objects.none()
        if getattr(self.request.user, 'role', '') == 'ADMIN':
            return Payment.objects.all()
        return Payment.objects.filter(booking__user=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def wallet(self, request):
        from core.services.payment_service import PaymentService
        data = PaymentService.get_wallet_details(request.user)
        return Response(data)


    # POST /api/payments/create-order/
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='create-order')
    def create_order(self, request):
        booking_id = request.data.get('booking_id')
        use_wallet = request.data.get('use_wallet', True) # By default, try to use wallet

        if not booking_id:
            return Response({'error': 'booking_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking_id = int(booking_id)
        except (ValueError, TypeError):
            return Response({'error': 'booking_id must be a valid integer'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

        if booking.booking_status == 'CONFIRMED':
            return Response(
                {'error': 'This booking is already confirmed (payment already done).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if booking.booking_status == 'CANCELLED':
            return Response(
                {'error': 'This booking has been cancelled and cannot be paid for.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if booking.booking_status not in ['PENDING']:
            return Response(
                {'error': f'Cannot create payment for a booking with status: {booking.booking_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from apps.payments.models import Wallet, WalletTransaction
            wallet, _ = Wallet.objects.get_or_create(user=request.user)
            
            total_due = booking.total_price
            wallet_deduction = 0
            refundable_deduction = 0
            balance_deduction = 0
            
            if use_wallet:
                from core.services.booking_service import BookingService
                breakdown = BookingService.calculate_wallet_deductions(
                    request.user, 
                    booking.rental_amount, 
                    booking.security_deposit
                )
                
                wallet_deduction = breakdown['total_wallet_deduction']
                total_due = breakdown['total_external_payment']
                
                # Serialized breakdown for metadata
                import json
                def decimal_default(obj):
                    if isinstance(obj, Decimal): return str(obj)
                    raise TypeError
                breakdown_json = json.dumps(breakdown, default=decimal_default)
            else:
                total_due = booking.total_price
                wallet_deduction = 0
                breakdown_json = "{}"

            # If total_due is 0, we can bypass Razorpay entirely!
            if total_due == 0:
                with transaction.atomic():
                    from core.services.booking_service import BookingService
                    # Re-calculate to safely update wallet fields
                    breakdown = BookingService.calculate_wallet_deductions(
                        request.user, booking.rental_amount, booking.security_deposit
                    )
                    
                    # Deduct from wallet
                    wallet.refundable_balance -= (breakdown['deposit']['from_refundable'] + breakdown['rental']['from_refundable'])
                    wallet.balance -= (breakdown['deposit']['from_balance'] + breakdown['rental']['from_balance'])
                    
                    # Lock security deposit
                    wallet.security_deposit += booking.security_deposit
                    wallet.save()
                    
                    # Create Payment record (auto-confirmed)
                    payment, _ = Payment.objects.update_or_create(
                        booking=booking,
                        defaults={
                            'amount': booking.total_price,
                            'razorpay_order_id': 'wallet_' + str(booking.id),
                            'razorpay_payment_id': 'wallet_' + str(booking.id),
                            'razorpay_signature': 'wallet_auto',
                            'payment_status': 'SUCCESS',
                        }
                    )
                    
                    # Log transactions
                    for category in ['deposit', 'rental']:
                        for source, amount in breakdown[category].items():
                            if amount > 0 and source != 'external':
                                WalletTransaction.objects.create(
                                    wallet=wallet, booking=booking, amount=amount,
                                    tx_type='PAYMENT', entry_type='DEBIT',
                                    message=f"Used {source.replace('from_', '').title()} for {category.title()} (Booking #{booking.id})"
                                )
                    
                    WalletTransaction.objects.create(wallet=wallet, booking=booking, amount=booking.security_deposit, tx_type='DEPOSIT_PAYMENT', entry_type='CREDIT', message=f"Security Deposit reserved (Booking #{booking.id})")
                    
                    booking.booking_status = 'CONFIRMED'
                    booking.deposit_paid = True
                    booking.save()
                    
                return Response({
                    'status': 'SUCCESS_WALLET',
                    'message': 'Paid entirely via Wallet. Booking confirmed!',
                    'booking_id': booking.id,
                }, status=status.HTTP_200_OK)
                    
                return Response({
                    'status': 'SUCCESS_WALLET',
                    'message': 'Paid entirely via Wallet. Booking confirmed!',
                    'booking_id': booking.id,
                }, status=status.HTTP_200_OK)

            # Otherwise, create a Razorpay order ONLY for the remaining total_due
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

            amount_in_paise = int(float(total_due) * 100)

            razorpay_order = client.order.create({
                'amount': amount_in_paise,
                'currency': 'INR',
                'payment_capture': 1,
                'notes': {
                    'booking_id': str(booking.id),
                    'user_id': str(request.user.id),
                    'wallet_breakdown': breakdown_json
                }
            })

            Payment.objects.update_or_create(
                booking=booking,
                defaults={
                    'amount': booking.total_price,
                    'razorpay_order_id': razorpay_order['id'],
                    'razorpay_payment_id': None,
                    'razorpay_signature': None,
                    'payment_status': 'PENDING',
                }
            )

            # Pass the breakdown to the frontend
            return Response({
                'order_id': razorpay_order['id'],
                'amount': amount_in_paise,
                'currency': 'INR',
                'booking_id': booking.id,
                'razorpay_key': settings.RAZORPAY_KEY_ID,
                'wallet_deduction': float(wallet_deduction),
                'breakdown': json.loads(breakdown_json) if use_wallet else {}
            }, status=status.HTTP_200_OK)

        except razorpay.errors.BadRequestError as e:
            return Response({'error': f'Razorpay error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"create_order error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    # POST /api/payments/cancel-payment/
    # Called when:
    #    Razorpay payment.failed event fires (payment declined)
    #    User closes the Razorpay modal without paying
    # Sets Payment → FAILED, Booking → CANCELLED

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='cancel-payment')
    def cancel_payment(self, request):
        booking_id = request.data.get('booking_id')
        reason     = request.data.get('reason', 'Payment not completed')  # FAILED or DISMISSED

        if not booking_id:
            return Response({'error': 'booking_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking_id = int(booking_id)
        except (ValueError, TypeError):
            return Response({'error': 'booking_id must be a valid integer'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

        # Only cancel PENDING bookings — do not touch already CONFIRMED/COMPLETED
        if booking.booking_status != 'PENDING':
            return Response(
                {'error': f'Cannot cancel payment for booking with status: {booking.booking_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Update payment record if it exists
            try:
                payment = Payment.objects.get(booking=booking)
                payment.payment_status = 'FAILED'
                payment.save()
            except Payment.DoesNotExist:
                pass  # No payment record yet (modal closed before order was created)

            # Cancel the booking — frees the dates for other users
            booking.booking_status = 'CANCELLED'
            booking.save()

        logger.info(f"Payment cancelled for booking #{booking_id}. Reason: {reason}")

        return Response({
            'status':  'CANCELLED',
            'message': 'Booking cancelled due to payment failure.',
            'booking_id': booking_id,
        }, status=status.HTTP_200_OK)


    # POST /api/payments/verify/
    # Verifies Razorpay signature on backend (NEVER on frontend)
    # Updates Payment → SUCCESS and Booking → CONFIRMED on success
    # Updates Payment → FAILED and Booking → CANCELLED on failure
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='verify')
    def verify_payment(self, request):
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id   = request.data.get('razorpay_order_id')
        razorpay_signature  = request.data.get('razorpay_signature')
        booking_id          = request.data.get('booking_id')

        if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature, booking_id]):
            return Response(
                {'error': 'razorpay_payment_id, razorpay_order_id, razorpay_signature, and booking_id are all required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            booking_id = int(booking_id)
        except (ValueError, TypeError):
            return Response({'error': 'booking_id must be a valid integer'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the payment record and verify ownership
        try:
            payment = Payment.objects.select_related('booking__user').get(
                razorpay_order_id=razorpay_order_id,
                booking__id=booking_id,
                booking__user=request.user
            )
        except Payment.DoesNotExist:
            return Response({'error': 'Payment record not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

            #  Verify signature using Razorpay SDK — this is the security check
            client.utility.verify_payment_signature({
                'razorpay_order_id':   razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature':  razorpay_signature,
            })

            # Fetch order so we can see how much wallet balance was virtually committed
            razorpay_order = client.order.fetch(razorpay_order_id)

            # Signature valid — update payment + booking atomically
            with transaction.atomic():
                payment.razorpay_payment_id = razorpay_payment_id
                payment.razorpay_signature  = razorpay_signature
                payment.payment_status      = 'SUCCESS'
                payment.save()

                booking = payment.booking
                booking.booking_status = 'CONFIRMED'
                booking.deposit_paid = True
                booking.save()

                # ── Wallet Update
                from .models import Wallet, WalletTransaction
                import json
                wallet, _ = Wallet.objects.get_or_create(user=request.user)

                breakdown_str = razorpay_order.get('notes', {}).get('wallet_breakdown', '{}')
                try:
                    breakdown = json.loads(breakdown_str)
                except Exception:
                    breakdown = {}

                if breakdown:
                    # Apply deductions based on stored breakdown (converting strings back to Decimal)
                    for category in ['deposit', 'rental']:
                        cat_data = breakdown.get(category, {})
                        for source in ['from_refundable', 'from_balance']:
                            amount = Decimal(str(cat_data.get(source, '0')))
                            if amount > 0:
                                if source == 'from_refundable':
                                    wallet.refundable_balance -= amount
                                else:
                                    wallet.balance -= amount
                                
                                WalletTransaction.objects.create(
                                    wallet=wallet, booking=booking, amount=amount,
                                    tx_type='PAYMENT', entry_type='DEBIT',
                                    message=f"Used {source.replace('from_', '').title()} for {category.title()} (Booking #{booking.id})"
                                )
                
                # Lock security deposit
                wallet.security_deposit += booking.security_deposit
                wallet.save()

                WalletTransaction.objects.create(
                    wallet=wallet,
                    booking=booking,
                    amount=booking.security_deposit,
                    tx_type='DEPOSIT_PAYMENT',
                    entry_type='CREDIT',
                    message=f"Security Deposit reserved (Booking #{booking.id})"
                )

            logger.info(f"Payment verified and Wallet credited: {razorpay_payment_id} for booking #{booking_id}")

            return Response({
                'status': 'SUCCESS',
                'message': 'Payment verified successfully. Booking confirmed!',
                'booking_id': booking_id,
            }, status=status.HTTP_200_OK)

        except razorpay.errors.SignatureVerificationError:
            # Signature invalid — mark as failed atomically
            logger.warning(f"Signature verification FAILED for order: {razorpay_order_id}")
            with transaction.atomic():
                payment.payment_status = 'FAILED'
                payment.save()
                payment.booking.booking_status = 'CANCELLED'
                payment.booking.save()
            return Response(
                {'error': 'Payment signature verification failed. This payment is invalid.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"verify_payment error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # POST /api/payments/wallet/withdraw/
    # Withdraws from refundable_balance

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='wallet/withdraw')
    def withdraw(self, request):
        amount = request.data.get('amount')
        
        from apps.fines.services import has_pending_dues
        if has_pending_dues(request.user):
            return Response({'error': 'You have pending dues. Please clear them first.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not amount:
            return Response({'error': 'amount is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            from decimal import Decimal
            amount = Decimal(str(amount))
            if amount <= 0:
                raise ValueError()
        except Exception:
            return Response({'error': 'amount must be a valid positive number'}, status=status.HTTP_400_BAD_REQUEST)
            
        from apps.payments.models import Wallet, WalletTransaction
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        
        if amount > wallet.refundable_balance:
            return Response({'error': f'Insufficient refundable balance. You can withdraw up to ₹{wallet.refundable_balance}'}, status=status.HTTP_400_BAD_REQUEST)
            
        with transaction.atomic():
            wallet.refundable_balance -= amount
            wallet.save()
            
            WalletTransaction.objects.create(
                wallet=wallet,
                amount=amount,
                tx_type='WITHDRAWAL',
                entry_type='DEBIT',
                message="Funds withdrawn to bank account"
            )
            
        return Response({
            'status': 'SUCCESS',
            'message': f'Successfully initiated withdrawal of ₹{amount}',
            'withdrawn_amount': amount,
            'remaining_refundable_balance': wallet.refundable_balance
        }, status=status.HTTP_200_OK)


class WithdrawalViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WithdrawalRequestSerializer

    def get_queryset(self):
        # Users only see their own requests
        return WithdrawalRequest.objects.filter(user=self.request.user).order_by('-created_at')

    @transaction.atomic
    def perform_create(self, serializer):
        from apps.fines.services import has_pending_dues
        if has_pending_dues(self.request.user):
            raise serializers.ValidationError({'error': 'You have pending dues. Please clear them first.'})
            
        amount = serializer.validated_data['amount']
        
        if amount <= 0:
            raise serializers.ValidationError({'amount': 'Amount must be a positive value.'})

        wallet, _ = Wallet.objects.get_or_create(user=self.request.user)
        
        if wallet.refundable_balance < amount:
            raise serializers.ValidationError({'amount': f'Insufficient refundable balance. Available: ₹{wallet.refundable_balance}'})

        # Deduct balance immediately
        wallet.refundable_balance -= amount
        wallet.save()

        # Create transaction record
        WalletTransaction.objects.create(
            wallet=wallet,
            amount=amount,
            tx_type='WITHDRAWAL',
            entry_type='DEBIT',
            message=f"Withdrawal request of ₹{amount} initiated."
        )

        # Save request with user
        serializer.save(user=self.request.user, status='PENDING')
