from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    licence_number = models.CharField(max_length=50, blank=True, null=True)
    licence_image = models.ImageField(upload_to='licences/', blank=True, null=True)
    
    ROLE_CHOICES = (('ADMIN', 'Admin'), ('USER', 'User'))
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='USER')
    
    VERIFICATION_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    verification_status = models.CharField(max_length=15, choices=VERIFICATION_STATUS_CHOICES, default=None, blank=True, null=True)
    verification_remarks = models.TextField(blank=True, null=True)
    
    is_verified = models.BooleanField(default=False)
    is_profile_complete = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = UserManager()

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        # Auto-sync is_verified status based on verification_status
        if self.verification_status == 'APPROVED':
            self.is_verified = True
        else:
            self.is_verified = False
        super().save(*args, **kwargs)
