from django.urls import path
from .views import (
    UserRegistrationView,
    UserProfileView,
    UserSkillsView,
    NotificationListView,
    MarkNotificationReadView,
    InstitutionAnalyticsView,
    OnboardingView
)
from .ai_views import (
    MockInterviewGeneratorView,
    ResumeTailorView,
    CareerPathPredictorView
)

urlpatterns = [
    # Auth is handled natively by InsForge Client SDK
    # We only keep profile and user-specific endpoints
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('skills/', UserSkillsView.as_view(), name='user-skills'),
    path('onboard/', OnboardingView.as_view(), name='user-onboard'),
    
    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notifications-list'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='notification-read'),

    # AI Views (Will be converted to InsForge Serverless Functions)
    path('ai/mock-interview/', MockInterviewGeneratorView.as_view(), name='ai-mock-interview'),
    path('ai/resume-tailor/', ResumeTailorView.as_view(), name='ai-resume-tailor'),
    path('ai/career-predictor/', CareerPathPredictorView.as_view(), name='ai-career-predictor'),

    # Analytics
    path('analytics/institution/', InstitutionAnalyticsView.as_view(), name='institution-analytics'),
]
