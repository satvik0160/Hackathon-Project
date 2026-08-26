from django.urls import path
from .views import JobListingListView, JobMatchView, SkillMatchView, ApplyJobView, ApplicationHistoryView, JobApplicationUpdateView, IndustryJobPostView, MentorFeedbackView, AnalyzeJobUrlView

urlpatterns = [
    path('listings/', JobListingListView.as_view(), name='job-list'),
    path('match/', JobMatchView.as_view(), name='job-matches'),
    path('skill-match/', SkillMatchView.as_view(), name='skill-match'),
    path('apply/', ApplyJobView.as_view(), name='job-apply'),
    path('applications/', ApplicationHistoryView.as_view(), name='job-applications'),
    path('applications/<int:pk>/', JobApplicationUpdateView.as_view(), name='job-application-update'),
    
    # Phase 6: Industry APIs
    path('industry/post-job/', IndustryJobPostView.as_view(), name='industry-post-job'),
    path('industry/mentor-feedback/', MentorFeedbackView.as_view(), name='industry-mentor-feedback'),
    path('analyze-url/', AnalyzeJobUrlView.as_view(), name='analyze-url'),
]

