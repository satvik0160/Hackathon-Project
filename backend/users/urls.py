from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserRegistrationView, UserProfileView, UserSkillsView, LogoutView, OnboardingView

urlpatterns = [
    # Phase 1: Authentication & JWT
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='user-logout'),
    
    # Profiles & Onboarding
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('skills/', UserSkillsView.as_view(), name='user-skills'),
    path('onboarding/', OnboardingView.as_view(), name='user-onboarding'),
]
