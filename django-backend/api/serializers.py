from rest_framework import serializers
from api.models.institution import InstitutionId
from api.models.organizations import Organizations, Memberships, OrganizationCode
from api.utils.code_generation_util import generate_institution_code
from django.db import IntegrityError, transaction


class InstitutionSerializer(serializers.ModelSerializer):
    user_first_name = serializers.CharField(source="user.first_name", read_only=True)
    user_last_name = serializers.CharField(source="user.last_name", read_only=True)

    class Meta:
        model = InstitutionId
        fields = ['id','code','created_at','user_first_name','user_last_name']
        read_only_fields = fields

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

class JoinOrganizationSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)

    def validate(self, data):
        try:
            # Query OrganizationCode model to check if provided code exists
            org_code = OrganizationCode.objects.get(code=data['code'])
        except OrganizationCode.DoesNotExist:
            raise serializers.ValidationError("Invalid organization code.")
        
        # Check code is still active
        if not org_code.active:
            raise serializers.ValidationError("This organization code is no longer active.")
        data['organization'] = org_code.organization_id
        return data
    
    # Create a new Membership for user and org
    def create(self, validated_data):
        member = self.context["request"].user.member
        org = validated_data['organization']

        # Check if user is already a member of the org
        if Memberships.objects.filter(member=member, organization=org).exists():
            raise serializers.ValidationError("You are already a member of this organization.")
        
        try:
            with transaction.atomic():
                return Memberships.objects.create(
                    member=member,
                    organization=org,
                    role=Memberships.ClubRole.MEMBER,
                    status=Memberships.Status.ACTIVE
                )
        except IntegrityError:
            raise serializers.ValidationError("Failed to join the organization, try again!")