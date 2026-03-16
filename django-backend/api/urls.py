from django.urls import path
from api.views.institution_views import InstitutionIdCreateView, GetLatestInstitution
from api.views.user_views import RegisterUser

urlpatterns = [
    path("institutions/", InstitutionIdCreateView.as_view(), name="institutionid-create"),
    path("institutions/latest/", GetLatestInstitution.as_view(), name="institutionid-latest"),
    path("auth/register/", RegisterUser.as_view(), name="register-user")
]