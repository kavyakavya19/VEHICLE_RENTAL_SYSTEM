from django.contrib import admin
from .models import Coupon

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'discount_type', 'value', 'expiry_date', 'is_active')
    list_filter = ('discount_type', 'is_active', 'expiry_date')
    search_fields = ('code',)
    
    fieldsets = (
        ('Coupon Setup', {'fields': ('code', 'discount_type', 'value')}),
        ('Validation', {'fields': ('expiry_date', 'is_active')})
    )
