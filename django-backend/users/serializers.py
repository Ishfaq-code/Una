from django.conf import settings
from djoser.serializers import UserCreateSerializer
from rest_framework import serializers


class DomainRestrictedUserCreateSerializer(UserCreateSerializer):
    def validate_email(self, value):
        email = value.strip().lower()
        parts = email.rsplit('@', 1)

        print("Running")
        if len(parts) != 2:
            raise serializers.ValidationError('Enter a valid email address.')

        allowed_domains = settings.ALLOWED_SIGNUP_EMAIL_DOMAINS
        print(allowed_domains)
        if not allowed_domains:
            raise serializers.ValidationError('Signup is disabled. No email domains are configured.')

        domain = parts[1]
        if domain not in allowed_domains:
            allowed_domains_text = ', '.join(f'@{item}' for item in allowed_domains)
            raise serializers.ValidationError(
                f'Signup requires an institution email address. Allowed domains: {allowed_domains_text}.'
            )

        return email
