from django.urls import path
from .views import UserRegistrationView, UserProfileView, UserSkillsView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('skills/', UserSkillsView.as_view(), name='user-skills'),
]
