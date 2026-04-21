from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth
from apps.users.models import User
from apps.vehicles.models import Vehicle
from apps.bookings.models import Booking
from apps.payments.models import Payment
from apps.reviews.models import Review
from apps.fines.models import Fine

class ReportService:
    @staticmethod
    def get_overall_stats():
        total_users = User.objects.filter(role='USER').count()
        total_vehicles = Vehicle.objects.count()
        total_bookings = Booking.objects.count()
        active_bookings = Booking.objects.filter(booking_status__in=['PENDING', 'CONFIRMED', 'ONGOING', 'PENDING_APPROVAL']).count()
        completed_bookings = Booking.objects.filter(booking_status__in=['COMPLETED', 'REFUNDED']).count()
        cancelled_bookings = Booking.objects.filter(booking_status='CANCELLED').count()
        
        total_revenue = Payment.objects.filter(payment_status='SUCCESS').aggregate(total=Sum('amount'))['total'] or 0
        total_fines = Fine.objects.filter(is_settled=True).aggregate(total=Sum('amount'))['total'] or 0
        
        total_reviews = Review.objects.count()
        average_rating = Review.objects.aggregate(avg=Avg('rating'))['avg'] or 0
        
        most_booked = Booking.objects.values('vehicle__name').annotate(book_count=Count('vehicle')).order_by('-book_count').first()
        most_booked_vehicle = most_booked['vehicle__name'] if most_booked else "None"
        
        return {
            "total_users": total_users,
            "total_vehicles": total_vehicles,
            "total_bookings": total_bookings,
            "active_bookings": active_bookings,
            "completed_bookings": completed_bookings,
            "cancelled_bookings": cancelled_bookings,
            "total_revenue": total_revenue,
            "total_fines": total_fines,
            "total_reviews": total_reviews,
            "average_rating": round(average_rating, 1),
            "most_booked_vehicle": most_booked_vehicle
        }

    @staticmethod
    def get_monthly_revenue():
        monthly_data = Payment.objects.filter(payment_status='SUCCESS') \
            .annotate(month=TruncMonth('created_at')) \
            .values('month') \
            .annotate(revenue=Sum('amount')) \
            .order_by('month')
        
        return [
            {"month": entry['month'].strftime('%b'), "revenue": entry['revenue']}
            for entry in monthly_data
        ]

    @staticmethod
    def get_monthly_bookings():
        monthly_data = Booking.objects \
            .annotate(month=TruncMonth('created_at')) \
            .values('month') \
            .annotate(bookings=Count('id')) \
            .order_by('month')
        
        return [
            {"month": entry['month'].strftime('%b'), "bookings": entry['bookings']}
            for entry in monthly_data
        ]
