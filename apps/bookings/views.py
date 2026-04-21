from rest_framework import viewsets, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Booking
from .serializers import BookingReadSerializer, BookingWriteSerializer, MyBookingSerializer
from core.services.booking_service import BookingService
from core.permissions import IsAdminUserRole
from core.utils.pdf_generator import InvoiceGenerator
from django.http import FileResponse
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from apps.payments.models import Wallet, WalletTransaction
from apps.vehicles.models import Vehicle
from apps.fines.services import process_all_pending_fines
from core.services.payment_service import PaymentService

from decimal import Decimal
import os
import logging

try:
    from datetime import datetime
except ImportError:
    pass

logger = logging.getLogger(__name__)

class BookingViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Booking.objects.none()
        if getattr(self.request.user, 'role', '') == 'ADMIN':
            return Booking.objects.all()
        return Booking.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return BookingWriteSerializer
        return BookingReadSerializer

    def create(self, request, *args, **kwargs):
        if not getattr(request.user, 'is_verified', False):
            return Response(
                {"error": "Please verify your driving license before booking"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        vehicle = serializer.validated_data['vehicle']
        start_date = serializer.validated_data['start_date']
        end_date = serializer.validated_data['end_date']
        booking_type = serializer.validated_data.get('booking_type', 'DAILY')
        coupon = serializer.validated_data.get('coupon')
        
        try:
            booking = BookingService.create_booking(
                user=request.user,
                vehicle=vehicle,
                start_date=start_date,
                end_date=end_date,
                booking_type=booking_type,
                coupon=coupon
            )
        except ValidationError as e:
            # Check if this is our specialized "pending booking exists" error
            if isinstance(e.detail, dict) and 'pending_booking_id' in e.detail:
                return Response({
                    "message": "You already have a pending booking for this vehicle.",
                    "booking_id": e.detail['pending_booking_id']
                }, status=status.HTTP_200_OK)
            raise e
        
        read_serializer = BookingReadSerializer(booking)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='my-bookings')
    def my_bookings(self, request):
        bookings = (
            Booking.objects
            .select_related('vehicle', 'payment')   # join payment in single query
            .filter(user=request.user)
            .order_by('-created_at')                # newest first
        )
        serializer = MyBookingSerializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='summary')
    def summary(self, request):
        """
        Consolidated dashboard summary: Wallet, Stats, Active Booking, and Alerts.
        """
        user = request.user
        # 1. Wallet
        wallet_data = PaymentService.get_wallet_details(user)
        
        # 2. Stats
        bookings = Booking.objects.filter(user=user)
        stats = {
            'total': bookings.count(),
            'completed': bookings.filter(booking_status='COMPLETED').count(),
            'cancelled': bookings.filter(booking_status='CANCELLED').count(),
            'pending_payment': bookings.filter(booking_status='PENDING').count(),
        }
        
        # 3. Active Booking
        active_booking = bookings.filter(
            booking_status__in=['PENDING', 'CONFIRMED', 'ONGOING', 'PENDING_APPROVAL']
        ).first()
        active_booking_data = MyBookingSerializer(active_booking).data if active_booking else None
        
        # 4. Alerts
        alerts = []
        if active_booking:
            if active_booking.booking_status == 'PENDING':
                alerts.append({'type': 'warning', 'message': 'You have a pending payment for your booking.'})
            elif active_booking.booking_status == 'CONFIRMED':
                alerts.append({'type': 'info', 'message': f'Your booking for {active_booking.vehicle.name} is confirmed!'})
            elif active_booking.booking_status == 'ONGOING':
                alerts.append({'type': 'success', 'message': 'You have an ongoing trip. Drive safely!'})
        
        if wallet_data['pending_fines'] > 0:
            alerts.append({'type': 'error', 'message': f'You have ₹{wallet_data["pending_fines"]} in pending fines/damages.'})

        return Response({
            'wallet': wallet_data,
            'stats': stats,
            'active_booking': active_booking_data,
            'alerts': alerts
        })



    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def approve(self, request, pk=None):
        booking = self.get_object()
        if booking.booking_status == 'CANCELLED':
            return Response({'error': 'Cannot approve a cancelled booking.'}, status=status.HTTP_400_BAD_REQUEST)
        booking.booking_status = 'CONFIRMED'
        booking.save()
        return Response({'status': 'Booking confirmed'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if request.user != booking.user and getattr(request.user, 'role', '') != 'ADMIN':
            return Response(status=status.HTTP_403_FORBIDDEN)
        if booking.booking_status == 'COMPLETED':
            return Response({'error': 'Cannot cancel a completed booking.'}, status=status.HTTP_400_BAD_REQUEST)
        if booking.booking_status == 'CANCELLED':
            return Response({'error': 'Booking is already cancelled.'}, status=status.HTTP_400_BAD_REQUEST)
        booking.booking_status = 'CANCELLED'
        booking.save()
        return Response({'status': 'Booking cancelled'})

    # START TRIP  —  CONFIRMED → ONGOING

    @action(detail=True, methods=['post'], url_path='start-trip',
            permission_classes=[permissions.IsAuthenticated])
    def start_trip(self, request, pk=None):
        booking = self.get_object()

        # ── Ownership / admin check 
        is_admin = getattr(request.user, 'role', '') == 'ADMIN'
        if request.user != booking.user and not is_admin:
            return Response(
                {'error': 'You do not have permission to start this trip.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # ── Status guard
        if booking.booking_status == 'CANCELLED':
            return Response(
                {'error': 'Cannot start a cancelled booking.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if booking.booking_status == 'ONGOING':
            return Response(
                {'error': 'Trip has already started.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if booking.booking_status == 'COMPLETED':
            return Response(
                {'error': 'This booking is already completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if booking.booking_status != 'CONFIRMED':
            return Response(
                {'error': f'Cannot start trip. Current status is {booking.booking_status}. Expected CONFIRMED.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Date guard — cannot start before booking start_date 
        from django.utils import timezone
        now = timezone.now()
        if now.date() < booking.start_date.date():
            return Response(
                {'error': f'Trip cannot start before the booking date ({booking.start_date.date()}).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Update booking + vehicle
        booking.booking_status = 'ONGOING'
        booking.save()

        # Mark vehicle as unavailable while trip is in progress
        vehicle = booking.vehicle
        vehicle.availability_status = False
        vehicle.save(update_fields=['availability_status'])

        return Response({
            'status':  'ONGOING',
            'message': f'Trip started! Enjoy your ride. Vehicle: {vehicle.brand} {vehicle.name}.',
            'booking_id': booking.id,
        }, status=status.HTTP_200_OK)

    # END TRIP  —  ONGOING → COMPLETED  or  ONGOING → PENDING_APPROVAL (late)
    @action(detail=True, methods=['post'], url_path='end-trip',
            permission_classes=[permissions.IsAuthenticated])
    def end_trip(self, request, pk=None):
        from django.utils import timezone
        booking = self.get_object()

        # ── Ownership / admin check 
        is_admin = getattr(request.user, 'role', '') == 'ADMIN'
        if request.user != booking.user and not is_admin:
            return Response(
                {'error': 'You do not have permission to end this trip.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # ── Status guard 
        if booking.booking_status == 'CANCELLED':
            return Response({'error': 'Cannot end a cancelled booking.'}, status=status.HTTP_400_BAD_REQUEST)
        if booking.booking_status == 'COMPLETED':
            return Response({'error': 'Trip has already been completed.'}, status=status.HTTP_400_BAD_REQUEST)
        if booking.booking_status != 'ONGOING':
            return Response(
                {'error': f'Cannot end trip. Current status is {booking.booking_status}. Expected ONGOING.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        now = timezone.now()
        vehicle = booking.vehicle

        # ── Late return detection 
        booking.actual_return_time = now

        fine_data = BookingService.calculate_fine(vehicle, booking.end_date, now)

        if fine_data['fine_amount'] > 0:
            # ── LATE RETURN 
            booking.late_days          = fine_data['extra_hours']
            booking.fine_amount        = fine_data['fine_amount']
            booking.fine_paid          = False
            booking.booking_status     = 'PENDING_APPROVAL'
            booking.save()

            return Response({
                'status':       'PENDING_APPROVAL',
                'message':      f"Vehicle returned {fine_data['extra_hours']} hour(s) late. A fine of ₹{fine_data['fine_amount']:.2f} has been raised. Please await admin approval.",
                'booking_id':   booking.id,
                'late_days':    fine_data['extra_hours'],
                'fine_amount':  fine_data['fine_amount'],
                'per_hour_rate': fine_data['fine_per_hour'],
                'end_date':     str(booking.end_date),
                'return_date':  str(now),
            }, status=status.HTTP_200_OK)

        else:
            # ── ON TIME RETURN
            with transaction.atomic():
                booking.booking_status = 'COMPLETED'
                booking.save()

                # Release security deposit (On-time = No fines)
                BookingService.release_security_deposit(booking)

                # Restore vehicle availability
                vehicle.availability_status = True
                vehicle.save(update_fields=['availability_status'])

            try:
                process_all_pending_fines(booking.user)
            except Exception as e:
                logger.error(f"Failed to process pending fines: {e}")

            return Response({
                'status':     'COMPLETED',
                'message':    'Trip completed on time! Thank you for riding with Perfect Wheels.',
                'booking_id': booking.id,
            }, status=status.HTTP_200_OK)

    # APPROVE RETURN  (Admin only)  —  Reviews late return, confirms fine
    # POST /api/bookings/{id}/approve-return/
    @action(detail=True, methods=['post'], url_path='approve-return',
            permission_classes=[IsAdminUserRole])
    def approve_return(self, request, pk=None):
        booking = self.get_object()

        if booking.booking_status != 'PENDING_APPROVAL':
            return Response(
                {'error': f'This booking is not pending approval. Current status: {booking.booking_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Admin may optionally override the fine amount
        override_fine = request.data.get('fine_amount')
        if override_fine is not None:
            try:
                booking.fine_amount = round(float(override_fine), 2)
            except (ValueError, TypeError):
                return Response({'error': 'fine_amount must be a valid number.'}, status=status.HTTP_400_BAD_REQUEST)

        # Status stays PENDING_APPROVAL until user pays the fine
        booking.save()

        return Response({
            'status':     'PENDING_APPROVAL',
            'message':    f'Fine of ₹{booking.fine_amount} confirmed. Waiting for user to pay.',
            'booking_id': booking.id,
            'fine_amount': float(booking.fine_amount),
            'late_days':   booking.late_days,
        }, status=status.HTTP_200_OK)

    # COMPLETE TRIP (Admin Only) — Calculate refund + damage, settle deposit
    # POST /api/bookings/{id}/complete-trip-admin/
    @action(detail=True, methods=['post'], url_path='complete-trip-admin',
            permission_classes=[IsAdminUserRole])
    def complete_trip_admin(self, request, pk=None):
        booking = self.get_object()

        if booking.booking_status not in ['PENDING_APPROVAL', 'COMPLETED']:
            return Response(
                {'error': f'Cannot complete trip from status: {booking.booking_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        fine_amount   = float(request.data.get('fine_amount', booking.fine_amount))
        damage_charge = float(request.data.get('damage_charge', 0))
        
        # ── Deposit Adjustment Logic
        total_to_deduct = Decimal(str(fine_amount)) + Decimal(str(damage_charge))
        deposit         = Decimal(str(booking.security_deposit))
        refund_amount   = float(max(Decimal('0'), deposit - total_to_deduct))
        
        with transaction.atomic():
            booking.fine_amount   = Decimal(str(fine_amount))
            booking.damage_charge = Decimal(str(damage_charge))
            booking.booking_status = 'COMPLETED'
            booking.save()

            # Release security deposit using centralized logic
            BookingService.release_security_deposit(booking)

            # Restore vehicle availability if not already done
            vehicle = booking.vehicle
            vehicle.availability_status = True
            vehicle.save(update_fields=['availability_status'])

        try:
            process_all_pending_fines(booking.user)
        except Exception as e:
            logger.error(f"Failed to process pending fines: {e}")

        return Response({
            'status': 'REFUNDED',
            'message': f'Trip finalized. Refund of ₹{refund_amount} credited to refundable balance.',
            'refund_amount': refund_amount,
            'booking_id': booking.id
        }, status=status.HTTP_200_OK)

    
    # PAY FINE  (User)  —  User pays the late return fine
    # POST /api/bookings/{id}/pay-fine/
    # After payment:  fine_paid=True, booking → COMPLETED, vehicle → available
    @action(detail=True, methods=['post'], url_path='pay-fine',
            permission_classes=[permissions.IsAuthenticated])
    def pay_fine(self, request, pk=None):
        booking = self.get_object()

        #  Ownership check
        is_admin = getattr(request.user, 'role', '') == 'ADMIN'
        if request.user != booking.user and not is_admin:
            return Response(
                {'error': 'You do not have permission to pay this fine.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if booking.booking_status != 'PENDING_APPROVAL':
            return Response(
                {'error': f'No fine to pay. Current status: {booking.booking_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if booking.fine_paid:
            return Response({'error': 'Fine has already been paid.'}, status=status.HTTP_400_BAD_REQUEST)

        from django.db import transaction
        with transaction.atomic():
            booking.fine_paid      = True
            booking.booking_status = 'COMPLETED'
            booking.save()

            # Release security deposit (after fine is paid)
            BookingService.release_security_deposit(booking)

            # Restore vehicle availability
            vehicle = booking.vehicle
            vehicle.availability_status = True
            vehicle.save(update_fields=['availability_status'])

        try:
            process_all_pending_fines(booking.user)
        except Exception as e:
            logger.error(f"Failed to process pending fines: {e}")

        return Response({
            'status':     'COMPLETED',
            'message':    f'Fine of ₹{booking.fine_amount} paid. Booking completed. Thank you!',
            'booking_id': booking.id,
        }, status=status.HTTP_200_OK)

    # DOWNLOAD INVOICE  (User/Admin)
    # GET /api/bookings/{id}/invoice/

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def invoice(self, request, pk=None):
        booking = self.get_queryset().select_related('user', 'vehicle', 'payment').get(pk=pk)

        # get_queryset already filters by user=request.user (non-admins)
        # and all (admins). So we just double-check logic here for safety.
        if (getattr(request.user, 'role', '') != 'ADMIN') and (booking.user != request.user):
             return Response(
                {'error': 'You do not have permission to download this invoice.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Ensure booking is paid/confirmed/completed
        if booking.booking_status in ['PENDING', 'CANCELLED']:
             return Response(
                {'error': 'Invoice is not available for bookings that are cancelled or pending payment.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cache check: If file already exists, don't re-generate
        if booking.invoice_file:
            # Check if file actually exists on filesystem
            if os.path.exists(booking.invoice_file.path):
                return FileResponse(open(booking.invoice_file.path, 'rb'), content_type='application/pdf')

        # Generate PDF 
        try:
            relative_path = InvoiceGenerator.generate_invoice_pdf(booking)
            booking.invoice_file = relative_path
            booking.save(update_fields=['invoice_file'])
            
            return FileResponse(open(booking.invoice_file.path, 'rb'), content_type='application/pdf')
        except Exception as e:
            # logger.error(f"Invoice generation failed for booking #{booking.id}: {e}")
            return Response(
                {'error': f'Failed to generate invoice: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    @action(detail=False, methods=['post'], url_path='check-availability')
    def check_availability(self, request):
        if not getattr(request.user, 'is_verified', False):
            return Response({
                'available': False,
                'message': 'Please verify your driving license before booking',
                'needs_verification': True
            }, status=status.HTTP_200_OK)

        from django.utils import timezone
        from django.utils.dateparse import parse_datetime
        from apps.vehicles.models import Vehicle

        vehicle_id = request.data.get('vehicle_id')
        start_date = request.data.get('start_date')
        end_date   = request.data.get('end_date')
        booking_type = request.data.get('booking_type', 'DAILY')

        #  1. Presence check 
        if not all([vehicle_id is not None and vehicle_id != '', start_date, end_date]):
            return Response(
                {'error': 'vehicle_id, start_date, and end_date are required', 'received': request.data},
                status=status.HTTP_400_BAD_REQUEST
            )

        #  2. Cast vehicle_id to int
        try:
            vehicle_id = int(vehicle_id)
        except (ValueError, TypeError):
            return Response(
                {'error': f'vehicle_id must be a valid integer, got: {vehicle_id}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Parse & validate dates
        try:
            if isinstance(start_date, str):
                start_date = parse_datetime(start_date)
                if start_date and timezone.is_naive(start_date):
                    start_date = timezone.make_aware(start_date)
            if isinstance(end_date, str):
                end_date = parse_datetime(end_date)
                if end_date and timezone.is_naive(end_date):
                    end_date = timezone.make_aware(end_date)
            
            if not start_date or not end_date:
                # Fallback to date parsing for DAILY if ISO datetime failed
                from datetime import datetime
                try:
                    start_date = timezone.make_aware(datetime.strptime(request.data.get('start_date')[:10], '%Y-%m-%d'))
                    end_date = timezone.make_aware(datetime.strptime(request.data.get('end_date')[:10], '%Y-%m-%d'))
                except:
                    raise ValueError("Invalid date format")
        except Exception:
            return Response(
                {'error': 'Dates must be valid ISO format strings (YYYY-MM-DD or YYYY-MM-DDTHH:MM)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        now = timezone.now()
        if start_date < now:
            return Response(
                {'error': 'start_date cannot be in the past'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if end_date <= start_date:
            return Response(
                {'error': 'end_date must be after start_date'},
                status=status.HTTP_400_BAD_REQUEST
            )

        #  4. Fetch vehicle 
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id)
        except Vehicle.DoesNotExist:
            return Response(
                {'error': f'Vehicle with id={vehicle_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # ── 4b. Check vehicle operational status
        if vehicle.maintenance_status:
            return Response({
                'available': False,
                'message': 'This vehicle is currently under maintenance and cannot be booked.',
            }, status=status.HTTP_200_OK)

        if not vehicle.availability_status:
            return Response({
                'available': False,
                'message': 'This vehicle is not currently available for booking.',
            }, status=status.HTTP_200_OK)

        #  4c. Check for unpaid fines
        if BookingService.check_unpaid_fines(request.user):
             return Response({
                'available': False,
                'message': 'You have unpaid fines. Please clear your fine from Booking History before making a new booking.',
                'block_booking': True
            }, status=status.HTTP_200_OK)

        #  5. Overlap check (Strict inequality for datetime precision)
        has_conflict = Booking.objects.filter(
            vehicle=vehicle,
            booking_status__in=['PENDING', 'CONFIRMED', 'ONGOING', 'PENDING_APPROVAL'],
            start_date__lt=end_date,
            end_date__gt=start_date,
        ).exists()

        if has_conflict:
            return Response({
                'available': False,
                'message': 'Vehicle is already booked for the selected dates/times. Please choose a different slot.',
            }, status=status.HTTP_200_OK)

        # 6. Vehicle is available — return pricing
        try:
            pricing = BookingService.calculate_price(vehicle, start_date, end_date, booking_type)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        #  7. Get user's wallet balances
        from apps.payments.models import Wallet
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        
        res_data = {
            'available':     True,
            'vehicle_id':    vehicle.id,
            'vehicle_name':  f'{vehicle.brand} {vehicle.name}',
            'price_per_day': pricing['price_per_day'],
            'days':          pricing['days'],
            'subtotal':      pricing['subtotal'],
            'tax':           pricing['tax'],
            'total':         pricing['total'],
            'security_deposit': float(vehicle.security_deposit),
            'start_date':    str(start_date),
            'end_date':      str(end_date),
            'wallet_balance': float(wallet.balance),
            'refundable_balance': float(wallet.refundable_balance),
        }
        
        if booking_type == 'HOURLY':
            res_data['hours'] = pricing.get('hours')
            res_data['price_per_hour'] = pricing.get('price_per_hour')

        return Response(res_data, status=status.HTTP_200_OK)

