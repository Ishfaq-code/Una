from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ValidationError

class UserManager(BaseUserManager):
    def create_user_object(self, email, **extra_fields):
        if not email: 
            raise ValueError('Email is required')
        
        email = self.normalize_email(email)
        domain = email.rsplit("@", 1)[-1].lower()

        if settings.EMAIL_DOMAINS and domain not in settings.EMAIL_DOMAINS:
            raise ValueError("Please use a valid email domain set by your institution")
        
        user = self.model(email=email, **extra_fields)
        return user
    
    def create_user(self, email, password=None, **extra_fields):
        user = self.create_user_object(email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(unique=True, max_length=255)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UserManager()