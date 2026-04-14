import logging
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.conf import settings
from django.db import transaction
from .models import Payment
from .serializers import PaymentSerializer
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

    # ───────────────────────────────────────────────
    # POST /api/payments/create-order/
    # Creates a Razorpay order on the backend and
    # returns order details + the Razorpay key to use
    # in the frontend checkout (no env vars needed).
    # ───────────────────────────────────────────────
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='create-order')
    def create_order(self, request):
        booking_id = request.data.get('booking_id')

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
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

            # Amount in paise (INR smallest unit)
            amount_in_paise = int(float(booking.total_price) * 100)

            razorpay_order = client.order.create({
                'amount': amount_in_paise,
                'currency': 'INR',
                'payment_capture': 1,  # Auto-capture
                'notes': {
                    'booking_id': str(booking.id),
                    'user_id': str(request.user.id),
                }
            })

            # Store/update the payment record — reset to PENDING even if previous attempt failed
            Payment.objects.update_or_create(
                booking=booking,
                defaults={
                    'amount':             booking.total_price,
                    'razorpay_order_id':  razorpay_order['id'],
                    'razorpay_payment_id': None,
                    'razorpay_signature':  None,
                    'payment_status':     'PENDING',
                }
            )

            logger.info(f"Razorpay order created: {razorpay_order['id']} for booking #{booking.id}")

            return Response({
                'order_id':     razorpay_order['id'],
                'amount':       amount_in_paise,
                'currency':     'INR',
                'booking_id':   booking.id,
                'razorpay_key': settings.RAZORPAY_KEY_ID,
            }, status=status.HTTP_200_OK)

        except razorpay.errors.BadRequestError as e:
            logger.error(f"Razorpay BadRequestError: {e}")
            return Response({'error': f'Razorpay error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"create_order error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ─────────────────────────────────────────────────────────
    # POST /api/payments/cancel-payment/
    # Called when:
    #   - Razorpay payment.failed event fires (payment declined)
    #   - User closes the Razorpay modal without paying
    # Sets Payment → FAILED, Booking → CANCELLED
    # ─────────────────────────────────────────────────────────
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

    # ─────────────────────────────────────────────────────────
    # POST /api/payments/verify/
    # Verifies Razorpay signature on backend (NEVER on frontend)
    # Updates Payment → SUCCESS and Booking → CONFIRMED on success
    # Updates Payment → FAILED and Booking → CANCELLED on failure
    # ─────────────────────────────────────────────────────────
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

            # ✅ Verify signature using Razorpay SDK — this is the security check
            client.utility.verify_payment_signature({
                'razorpay_order_id':   razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature':  razorpay_signature,
            })

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

                # ── Wallet Update ───────────────────────────────────────────
                from .models import Wallet, WalletTransaction
                wallet, _ = Wallet.objects.get_or_create(user=request.user)
                wallet.balance += booking.security_deposit
                wallet.save()

                # Log Transaction
                WalletTransaction.objects.create(
                    wallet=wallet,
                    booking=booking,
                    amount=booking.security_deposit,
                    tx_type='PAYMENT',
                    message=f"Security Deposit for Booking #{booking.id}"
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
