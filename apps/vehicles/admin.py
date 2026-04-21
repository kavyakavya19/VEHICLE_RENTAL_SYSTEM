from django.contrib import admin
from .models import Vehicle, VehicleImage, Brand

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name',)

class VehicleImageInline(admin.TabularInline):
    model = VehicleImage
    extra = 1

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'brand', 'price_per_day', 'is_available', 'availability_status')
    list_filter = ('brand', 'type', 'is_available', 'maintenance_status')
    search_fields = ('name', 'brand__name', 'vehicle_number')
    inlines = [VehicleImageInline]
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Vehicle Info', {'fields': ('name', 'brand', 'type', 'brand_str', 'vehicle_number', 'color', 'image', 'description')}),
        ('Pricing & Status', {'fields': ('price_per_day', 'price_per_hour', 'is_available', 'availability_status', 'maintenance_status')}),
        ('Dates', {'fields': ('created_at', 'updated_at')})
    )
