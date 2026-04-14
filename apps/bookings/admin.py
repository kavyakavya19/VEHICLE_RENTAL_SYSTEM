from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'vehicle', 'start_date', 'end_date', 'total_price', 'booking_status', 'created_at')
    list_filter = ('booking_status', 'start_date', 'end_date')
    search_fields = ('user__email', 'vehicle__name')
    readonly_fields = ('total_price', 'created_at')

    fieldsets = (
        ('Booking Logic', {'fields': ('user', 'vehicle', 'coupon')}),
        ('Dates & Pricing', {'fields': ('start_date', 'end_date', 'total_price')}),
        ('Status', {'fields': ('booking_status', 'created_at')})
    )
