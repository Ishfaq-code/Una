from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate
from django.conf import settings

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name']

class LoginUserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect credentials!")

class RegisterUserSerializer(serializers.ModelSerializer):
    class Meta: 
        model = User
        fields = ['id', 'email', 'password', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def validate_email(self, value):
        domain = value.rsplit("@", 1)[-1]
        allowed = set(getattr(settings, "EMAIL_DOMAINS", []))

        if allowed and domain not in allowed:
            raise serializers.ValidationError("Email domain is not allowed.")

        return value
    
    def create(self, validated_data):
        try:
            user = User.objects.create_user(**validated_data)
            return user
        except IntegrityError:
            raise serializers.ValidationError({"email": "Email already exists."})
        except ValueError as exc:
            raise serializers.ValidationError({"email": str(exc)})