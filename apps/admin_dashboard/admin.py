from django.contrib import admin
from django.template.response import TemplateResponse
from django.urls import path
from .models import Report
from core.services.report_service import ReportService

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False
        
    def has_delete_permission(self, request, obj=None):
        return False
        
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('', self.admin_site.admin_view(self.report_view), name='admin_dashboard_report_changelist'),
        ]
        return custom_urls + urls

    def report_view(self, request):
        context = dict(
           self.admin_site.each_context(request),
           title='Vehicle Rental Statistics',
           stats=ReportService.get_overall_stats(),
           monthly_revenue=ReportService.get_monthly_revenue(),
           monthly_bookings=ReportService.get_monthly_bookings(),
        )
        return TemplateResponse(request, "admin/admin_dashboard/report.html", context)
