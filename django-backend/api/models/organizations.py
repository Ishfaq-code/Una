from django.db import models
from django.utils import timezone
from django.conf import settings
from .institution import InstitutionCode
 
class Organizations(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT) # Avoid losing data persistance if something happens to an account
    institution_code = models.OneToOneField(InstitutionCode, on_delete=models.CASCADE,  null=True, blank=True,)

class Memberships(models.Model):
    class ClubRole(models.TextChoices):
        ADMIN = "admin", "Admin"
        MEMBER = "member", "Member"
    class Status(models.IntegerChoices):
        ACTIVE = 1, "Active"
        INACTIVE = 0, "Inactive"
    
    member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organizations, on_delete=models.CASCADE)
    status = models.IntegerField(choices=Status.choices, default=Status.ACTIVE)
    role = models.CharField(max_length=16, choices=ClubRole.choices, default=ClubRole.MEMBER)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["member", "organization"], name="uniq_member_organization"),
        ]
        indexes = [
            models.Index(fields=["organization", "status", "role"]),
            models.Index(fields=["member", "status"]),
        ]
    
    def __str__(self):
        return f"{self.member} in {self.club} ({self.role}/{self.status})"
