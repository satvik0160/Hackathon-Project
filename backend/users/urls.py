from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserRegistrationView, UserProfileView, UserSkillsView, LogoutView, OnboardingView, NotificationListView, NotificationReadView
from .ai_views import MockInterviewEngineView, AIResumeTailorView, CareerCopilotChatbotView
from .analytics_views import InstitutionAnalyticsView

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

    # Phase 5: AI Tools
    path('ai/interview/', MockInterviewEngineView.as_view(), name='ai-interview'),
    path('ai/resume/', AIResumeTailorView.as_view(), name='ai-resume'),
    path('ai/copilot/', CareerCopilotChatbotView.as_view(), name='ai-copilot'),
    
    # Phase 6: Analytics
    path('analytics/institution/', InstitutionAnalyticsView.as_view(), name='institution-analytics'),
    
    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notifications-list'),
    path('notifications/<int:pk>/read/', NotificationReadView.as_view(), name='notifications-read'),
]
