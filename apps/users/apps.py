from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'

    def ready(self):
        from django.contrib.auth import get_user_model
        import os

        User = get_user_model()

        email = os.getenv("DJANGO_SUPERUSER_EMAIL")
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD")

        try:
            if email and password:
                if not User.objects.filter(email=email).exists():
                    User.objects.create_superuser(
                        email=email,
                        password=password
                    )
                    print("✅ Superuser created")
        except Exception as e:
            print("⚠️ Skipped:", e)