from django.conf import settings
from django.db import transaction
from djoser.serializers import UserCreatePasswordRetypeSerializer, UserCreateSerializer
from rest_framework import serializers

from api.models.accounts import Member


class DomainRestrictedSignupMixin(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, write_only=True)
    last_name = serializers.CharField(max_length=150, write_only=True)

    def validate_email(self, value):
        email = value.strip().lower()
        parts = email.rsplit('@', 1)

        if len(parts) != 2:
            raise serializers.ValidationError('Enter a valid email address.')

        allowed_domains = settings.ALLOWED_SIGNUP_EMAIL_DOMAINS
        if not allowed_domains:
            raise serializers.ValidationError('Signup is disabled. No email domains are configured.')

        domain = parts[1]
        if domain not in allowed_domains:
            allowed_domains_text = ', '.join(f'@{item}' for item in allowed_domains)
            raise serializers.ValidationError(
                f'Signup requires an institution email address. Allowed domains: {allowed_domains_text}.'
            )

        return email

    def create(self, validated_data):
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')

        with transaction.atomic():
            user = super().create(validated_data)
            user.first_name = first_name
            user.last_name = last_name
            user.save(update_fields=['first_name', 'last_name'])
            Member.objects.create(user=user, first_name=first_name, last_name=last_name)

        return user


class DomainRestrictedUserCreateSerializer(DomainRestrictedSignupMixin, UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        fields = tuple(UserCreateSerializer.Meta.fields) + ('first_name', 'last_name')


class DomainRestrictedUserCreatePasswordRetypeSerializer(
    DomainRestrictedSignupMixin,
    UserCreatePasswordRetypeSerializer,
):
    class Meta(UserCreatePasswordRetypeSerializer.Meta):
        fields = tuple(UserCreatePasswordRetypeSerializer.Meta.fields) + ('first_name', 'last_name')
