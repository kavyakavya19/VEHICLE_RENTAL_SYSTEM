from django.contrib import admin
from .models import Fine

@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'user', 'amount', 'is_deducted', 'created_by', 'created_at')
    list_filter = ('is_deducted',)
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Fine Info', {'fields': ('booking', 'user', 'amount', 'reason')}),
        ('Status', {'fields': ('is_deducted', 'created_by', 'created_at')})
    )
