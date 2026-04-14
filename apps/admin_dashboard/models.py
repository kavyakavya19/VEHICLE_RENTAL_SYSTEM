from django.db import models

class Report(models.Model):
    """
    A dummy model strictly used so that the Django Admin interface 
    automatically generates a "Report" section link organically.
    """
    class Meta:
        managed = False
        verbose_name = 'Custom Report'
        verbose_name_plural = 'Live Dashboard Reports'
