from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User



class InstitutionCode(models.Model):
    code = models.CharField(max_length=6, unique=True)
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.PROTECT)

    class Meta:
        ordering = ["created_at"]