from django.contrib import admin
from .models import Vehicle, VehicleImage

class VehicleImageInline(admin.TabularInline):
    model = VehicleImage
    extra = 1

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'brand', 'type', 'price_per_day', 'availability_status', 'maintenance_status')
    list_filter = ('availability_status', 'maintenance_status', 'brand', 'type')
    search_fields = ('name', 'brand')
    inlines = [VehicleImageInline]
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Vehicle Info', {'fields': ('name', 'brand', 'type', 'description')}),
        ('Pricing & Status', {'fields': ('price_per_day', 'availability_status', 'maintenance_status')}),
        ('Dates', {'fields': ('created_at', 'updated_at')})
    )
