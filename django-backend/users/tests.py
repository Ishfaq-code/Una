from django.test import override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from api.models.accounts import Member


class SignupDomainRestrictionTests(APITestCase):
    @override_settings(ALLOWED_SIGNUP_EMAIL_DOMAINS=['ucf.edu'])
    def test_signup_allows_institution_domain(self):
        response = self.client.post(
            '/auth/users/',
            {
                'email': 'student@ucf.edu',
                'password': 'StrongPassword123!',
                're_password': 'StrongPassword123!',
                'first_name': 'Ishfaq',
                'last_name': 'Mcb',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        user = get_user_model().objects.get(email='student@ucf.edu')
        member = Member.objects.get(user=user)
        self.assertEqual(member.first_name, 'Ishfaq')
        self.assertEqual(member.last_name, 'Mcb')

    @override_settings(ALLOWED_SIGNUP_EMAIL_DOMAINS=['ucf.edu'])
    def test_signup_rejects_non_institution_domain(self):
        response = self.client.post(
            '/auth/users/',
            {
                'email': 'person@gmail.com',
                'password': 'StrongPassword123!',
                're_password': 'StrongPassword123!',
                'first_name': 'Person',
                'last_name': 'Example',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)
        self.assertEqual(Member.objects.count(), 0)

    @override_settings(ALLOWED_SIGNUP_EMAIL_DOMAINS=['ucf.edu'])
    def test_signup_requires_first_and_last_name(self):
        response = self.client.post(
            '/auth/users/',
            {
                'email': 'student2@ucf.edu',
                'password': 'StrongPassword123!',
                're_password': 'StrongPassword123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('first_name', response.data)
        self.assertIn('last_name', response.data)
