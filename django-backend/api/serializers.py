from rest_framework import serializers
from api.models.institution import InstitutionCode
from api.utils.code_generation_util import generate_institution_code
from django.db import IntegrityError, transaction
from .models.users  import User
from django.conf import settings


class InstitutionSerializer(serializers.ModelSerializer):
    user_first_name = serializers.CharField(source="user.first_name", read_only=True)
    user_last_name = serializers.CharField(source="user.last_name", read_only=True)

    class Meta:
        model = InstitutionCode
        fields = ['id','code','created_at','user_first_name','user_last_name']
        read_only_fields = fields

    def create(self, validated_data):
        user = self.context["request"].user
        code = generate_institution_code()
        try:
            with transaction.atomic():
                return InstitutionCode.objects.create(
                    user=user,
                    used=False,
                    code=code,
                )
        except IntegrityError:
            raise IntegrityError('Failed creating a new institution code, try again!')

class UserSerializer(serializers.ModelSerializer):
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
            