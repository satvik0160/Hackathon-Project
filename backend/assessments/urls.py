from django.urls import path
from .views import SkillCategoryListView, AssessmentListView, AssessmentDetailView, SubmitAssessmentView, UserAssessmentHistoryView

urlpatterns = [
    path('categories/', SkillCategoryListView.as_view(), name='skill-categories'),
    path('', AssessmentListView.as_view(), name='assessment-list'),
    path('<int:pk>/', AssessmentDetailView.as_view(), name='assessment-detail'),
    path('<int:pk>/submit/', SubmitAssessmentView.as_view(), name='assessment-submit'),
    path('history/', UserAssessmentHistoryView.as_view(), name='assessment-history'),
]
