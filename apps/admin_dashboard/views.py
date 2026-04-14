from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from core.permissions import IsAdminUserRole
from core.services.report_service import ReportService
from drf_spectacular.utils import extend_schema
from .serializers import OverallStatsSerializer, MonthlyRevenueSerializer, MonthlyBookingSerializer

class ReportsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    @extend_schema(responses=OverallStatsSerializer)
    def get(self, request):
        stats = ReportService.get_overall_stats()
        return Response(stats)

class MonthlyRevenueView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    @extend_schema(responses=MonthlyRevenueSerializer(many=True))
    def get(self, request):
        data = ReportService.get_monthly_revenue()
        return Response(data)

class MonthlyBookingsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    @extend_schema(responses=MonthlyBookingSerializer(many=True))
    def get(self, request):
        data = ReportService.get_monthly_bookings()
        return Response(data)
