from django.db import models
from django.utils import timezone


class InstitutionId(models.Model):
    code = models.CharField(max_length=6, unique=True)
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField()
    
