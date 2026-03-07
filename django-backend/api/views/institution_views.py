from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound

from api.models.institution import InstitutionId
from api.serializers import InstitutionSerializer


class InstitutionIdCreateView(generics.CreateAPIView):
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAdminUser]


class GetLatestInstitution(generics.RetrieveAPIView):
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_object(self):
        institution_code = (
            InstitutionId.objects
            .filter(user=self.request.user, used=False)
            .order_by("-created_at")
            .first()
        )
        if not institution_code:
            raise NotFound("No available institution codes, please create one")
        return institution_code
