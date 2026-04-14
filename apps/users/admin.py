from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'phone', 'role', 'verification_status', 'is_verified', 'created_at_display')
    list_filter = ('role', 'is_verified', 'verification_status')
    search_fields = ('name', 'email', 'phone', 'licence_number')
    ordering = ('date_joined',)
    readonly_fields = ('is_verified', 'date_joined', 'updated_at')
    
    actions = ['approve_license', 'reject_license']

    def created_at_display(self, obj):
        return obj.date_joined
    created_at_display.short_description = 'Created At'
    created_at_display.admin_order_field = 'date_joined'

    fieldsets = (
        ('Personal Info', {'fields': ('name', 'email', 'phone')}),
        ('Verification & Licence', {'fields': ('licence_number', 'licence_image', 'verification_status', 'is_verified', 'verification_remarks')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser')}),
        ('Dates', {'fields': ('date_joined', 'updated_at')})
    )

    @admin.action(description='Approve selected user licenses')
    def approve_license(self, request, queryset):
        queryset.update(is_verified=True, verification_status='APPROVED', verification_remarks='')
        self.message_user(request, f"{queryset.count()} users successfully verified.")

    @admin.action(description='Reject selected user licenses')
    def reject_license(self, request, queryset):
        queryset.update(is_verified=False, verification_status='REJECTED', verification_remarks='License invalid or unclear.')
        self.message_user(request, f"{queryset.count()} users rejected.")
