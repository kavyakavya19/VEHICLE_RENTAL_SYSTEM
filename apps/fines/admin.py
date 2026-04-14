from django.contrib import admin
from .models import Fine

@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'fine_type', 'amount', 'status', 'created_at')
    list_filter = ('fine_type', 'status')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Fine Info', {'fields': ('booking', 'fine_type', 'amount', 'proof_image')}),
        ('Status', {'fields': ('status', 'created_at')})
    )
