from rest_framework import serializers
from api.models.institution import InstitutionId

class InstitutionSerializer(serializers.Serializer):
    user_first_name = serializers.CharField(source='user.first_name')
    user_last_name = serializers.CharField(source='user.last_name')

    class Meta:
        model = InstitutionId
        fields = ['id','code','created_at','user_first_name','user_last_name']
        read_only_fields = ["id", "code", "used", "created_at", "user_first_name", "user_last_name"]