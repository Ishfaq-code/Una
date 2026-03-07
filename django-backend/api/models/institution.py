from django.conf import settings
from django.db import models

class InstitutionId(models.Model):
    code = models.CharField(max_length=6, unique=True)
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        ordering = ["created_at"]
