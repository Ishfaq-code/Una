from rest_framework import serializers
from api.models.institution import InstitutionCode
from api.utils.code_generation_util import generate_institution_code
from django.db import IntegrityError, transaction


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
            