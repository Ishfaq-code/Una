import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.models import BaseUserManager


# Create your models here.
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("User must provide email to sign up")
        
        email = self.normalize_email(email.lower())
        user = self.model(
            email=email,
            **extra_fields
        )

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.full_clean()
        user.save(using=self._db)
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_admin", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_admin") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        user = self.model(
            email=email,
            **extra_fields
        )

        user.save(using=self._db)

        return user
    
class User(AbstractBaseUser, PermissionsMixin):
    # Fields to identify an user
    id = models.AutoField(primary_key=True, unique=True)
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True
    )
    first_name = models.CharField(max_length=255)
    last_name =  models.CharField(max_length=255)

    # Django admin management
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    # Use this as the manager for creating users and super users
    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = ["first_name", "last_name"]

    def __str__(self):
        return self.email

    def is_staff(self):
        return self.is_admin