from django.urls import path
from api.views.institution_views import InstitutionIdCreateView

urlpatterns = [
    path("institutions/", InstitutionIdCreateView.as_view(), name="institutionid-create")
]