from django.test import override_settings
from rest_framework.test import APITestCase


class SignupDomainRestrictionTests(APITestCase):
    @override_settings(ALLOWED_SIGNUP_EMAIL_DOMAINS=['ucf.edu'])
    def test_signup_allows_institution_domain(self):
        print("Running")
        response = self.client.post(
            '/auth/users/',
            {
                'email': 'student@ucf.edu',
                'password': 'StrongPassword123!',
                're_password': 'StrongPassword123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)

    @override_settings(ALLOWED_SIGNUP_EMAIL_DOMAINS=['ucf.edu'])
    def test_signup_rejects_non_institution_domain(self):
        response = self.client.post(
            '/auth/users/',
            {
                'email': 'person@gmail.com',
                'password': 'StrongPassword123!',
                're_password': 'StrongPassword123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)
