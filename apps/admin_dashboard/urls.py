from django.urls import path
from .views import ReportsView, MonthlyRevenueView, MonthlyBookingsView

urlpatterns = [
    path('reports/', ReportsView.as_view(), name='dashboard-reports'),
    path('reports/monthly-revenue/', MonthlyRevenueView.as_view(), name='dashboard-monthly-revenue'),
    path('reports/monthly-bookings/', MonthlyBookingsView.as_view(), name='dashboard-monthly-bookings'),
]
