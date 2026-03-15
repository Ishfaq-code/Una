from django.db import models
from django.utils import timezone
from django.conf import settings



class InstitutionCode(models.Model):
    code = models.CharField(max_length=6, unique=True)
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)

    class Meta:
        ordering = ["created_at"]