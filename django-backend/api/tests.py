from django.contrib.auth import get_user_model
from django.test import TestCase

from api.models.accounts import Member
from api.models.institution import InstitutionId
from api.serializers import InstitutionSerializer


User = get_user_model()


class InstitutionSerializerNameTests(TestCase):
    def test_uses_member_name_when_member_exists(self):
        user = User.objects.create_user(email='member@ucf.edu', password='StrongPassword123!')
        Member.objects.create(user=user, first_name='Member', last_name='User')
        institution = InstitutionId.objects.create(user=user, used=False, code='ABC123')

        data = InstitutionSerializer(institution).data

        self.assertEqual(data['user_first_name'], 'Member')
        self.assertEqual(data['user_last_name'], 'User')

    def test_falls_back_to_user_name_when_member_missing(self):
        user = User.objects.create_user(
            email='admin@ucf.edu',
            password='StrongPassword123!',
            first_name='Admin',
            last_name='Account',
        )
        institution = InstitutionId.objects.create(user=user, used=False, code='XYZ789')

        data = InstitutionSerializer(institution).data

        self.assertEqual(data['user_first_name'], 'Admin')
        self.assertEqual(data['user_last_name'], 'Account')
