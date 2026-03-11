from rest_framework import serializers
from api.models.institution import InstitutionId
from api.models.organizations import Organizations, OrganizationCode, Memberships
from api.utils.code_generation_util import generate_institution_code, generate_organization_code
from api.utils.hash_util import encode_code
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


class OrganizationSerializer(serializers.ModelSerializer):
    # data needed from other models (relational objects) not user inputs 
    owner_first_name = serializers.CharField(source="owner.first_name", read_only=True)
    owner_last_name = serializers.CharField(source="owner.last_name", read_only=True)
    institution_id = serializers.CharField(write_only=True)

    class Meta:
        model = Organizations
        fields = ['id', 'institution_id', 'created_at', 'updated_at', 'name', 'description','owner_first_name', 'owner_last_name'] # display
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner_first_name', 'owner_last_name'] # not user input

    def create(self, validated_data):  
        owner = Member.objects.get(user=self.context['request'].user)
        try:
            with transaction.atomic():
                institution_id = validated_data.pop('institution_id') # pop user inputed code
                institution = InstitutionId.objects.get(code__exact=institution_id, used=False) #check if code exists/hasnt been used
                org_code = encode_code(generate_organization_code()) 

                institution.used=True #consume code
                institution.save()

                organization = Organizations.objects.create(    
                    owner=owner,
                    institution_id=institution,
                    **validated_data
                )

                OrganizationCode.objects.create(
                    code=org_code,
                    organization=organization
                )

                Memberships.objects.create(
                    member=owner,
                    organization=organization,
                    status=1,
                    role=Memberships.ClubRole.ADMIN
                )
                
                return Memberships.objects.filter(member=owner)

        except IntegrityError:
            raise IntegrityError('Failed creating a new organization, try again!')
        except InstitutionId.DoesNotExist:
            raise serializers.ValidationError('Instituon code is invalid, try again!')
           