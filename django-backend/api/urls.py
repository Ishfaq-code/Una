from django.urls import path
from api.views.institution_views import InstitutionIdCreateView, GetLatestInstitution
from api.views.user_views import RegisterUser, CurrentUser

urlpatterns = [
    path("api/institutions/", InstitutionIdCreateView.as_view(), name="institutionid-create"),
    path("api/institutions/latest/", GetLatestInstitution.as_view(), name="institutionid-latest"),
    path("api/register/", RegisterUser.as_view(), name="register-user"),
    path("api/users/", CurrentUser.as_view(), name="fetech-current-user")
]