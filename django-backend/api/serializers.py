from django.db import IntegrityError, transaction
from rest_framework import serializers

from api.models.institution import InstitutionId
from api.utils.code_generation_util import generate_institution_code


class InstitutionSerializer(serializers.ModelSerializer):
    user_first_name = serializers.SerializerMethodField()
    user_last_name = serializers.SerializerMethodField()

    class Meta:
        model = InstitutionId
        fields = ['id', 'code', 'created_at', 'user_first_name', 'user_last_name']
        read_only_fields = fields

    def get_user_first_name(self, obj):
        member = getattr(obj.user, 'member', None)
        if member is not None:
            return member.first_name
        return obj.user.first_name

    def get_user_last_name(self, obj):
        member = getattr(obj.user, 'member', None)
        if member is not None:
            return member.last_name
        return obj.user.last_name

    def create(self, validated_data):
        user = self.context["request"].user
        code = generate_institution_code()
        try:
            with transaction.atomic():
                return InstitutionId.objects.create(
                    user=user,
                    used=False,
                    code=code,
                )
        except IntegrityError:
            raise IntegrityError('Failed creating a new institution code, try again!')
            
