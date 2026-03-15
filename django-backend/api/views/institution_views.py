from django.db import IntegrityError, transaction
from rest_framework import generics, permissions
from api.models.institution import InstitutionCode
from api.serializers import InstitutionSerializer
from rest_framework.exceptions import NotFound


class InstitutionIdCreateView(generics.CreateAPIView):
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAdminUser]
 
class GetLatestInstitution(generics.RetrieveAPIView):
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_object(self):
        institution_code = (InstitutionCode.objects
               .filter(user=self.request.user, used=False)
               .order_by("-created_at")
               .first())
        if not institution_code:
            raise NotFound("No avaliable institution codes, please create one")
        return institution_code