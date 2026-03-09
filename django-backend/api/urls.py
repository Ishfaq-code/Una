from django.urls import path
from api.views.institution_views import InstitutionIdCreateView, GetLatestInstitution

urlpatterns = [
    path("institutions/", InstitutionIdCreateView.as_view(), name="institutionid-create"),
    path("institutions/latest/", GetLatestInstitution.as_view(), name="institutionid-latest"),
    path("organizations/join/", JoinOrganizationView.as_view(), name="join-organization")
]