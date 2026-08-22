from django.urls import path
from .views import JobListingListView, JobMatchView, SkillMatchView, ApplyJobView, ApplicationHistoryView

urlpatterns = [
    path('', JobListingListView.as_view(), name='job-list'),
    path('matches/', JobMatchView.as_view(), name='job-matches'),
    path('skill-match/', SkillMatchView.as_view(), name='skill-match'),
    path('apply/', ApplyJobView.as_view(), name='job-apply'),
    path('applications/', ApplicationHistoryView.as_view(), name='job-applications'),
]

