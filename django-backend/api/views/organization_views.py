from rest_framework import generics, permissions
from api.serializers import JoinOrganizationSerializer

class JoinOrganizationView(generics.CreateAPIView):
    serializer_class = JoinOrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]