from rest_framework import generics, permissions
from api.models.users import User
from api.serializers import UserSerializer

class RegisterUser(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
