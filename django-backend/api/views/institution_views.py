from django.db import IntegrityError, transaction
from rest_framework import generics, permissions
from api.models.institution import InstitutionId
from api.serializers import InstitutionSerializer

class InstitutionIdCreateView(generics.CreateAPIView):
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAdminUser]
 
