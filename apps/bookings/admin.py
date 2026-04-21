from django.contrib import admin
from .models import Booking
from apps.fines.models import Fine

class FineInline(admin.TabularInline):
    model = Fine
    extra = 0
    fields = ('amount', 'reason', 'is_deducted', 'created_by', 'created_at')
    readonly_fields = ('created_at',)

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'vehicle', 'start_date', 'end_date', 'total_price', 'booking_status', 'created_at')
    list_filter = ('booking_status', 'start_date', 'end_date')
    search_fields = ('user__email', 'vehicle__name')
    readonly_fields = ('total_price', 'created_at')
    inlines = [FineInline]

    fieldsets = (
        ('Booking Logic', {'fields': ('user', 'vehicle', 'coupon')}),
        ('Dates & Pricing', {'fields': ('start_date', 'end_date', 'total_price')}),
        ('Status', {'fields': ('booking_status', 'created_at')})
    )

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for obj in formset.deleted_objects:
            obj.delete()
        for instance in instances:
            if isinstance(instance, Fine) and not instance.pk:
                instance.created_by = request.user
                instance.user = instance.booking.user
            instance.save()
        formset.save_m2m()
