"""
SkillMaster Pro - Main URL Configuration

All API endpoints are prefixed with /api/ and organized by app:
  - /api/users/     → User registration, profile, skills
  - /api/assessments/ → Skill categories, assessments, questions, submissions
  - /api/learning/  → Learning resources, paths, progress tracking
  - /api/jobs/      → Job listings, matching, applications
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('api/users/', include('users.urls')),
    # path('api/assessments/', include('assessments.urls')),
    # path('api/learning/', include('learning.urls')),
    # path('api/jobs/', include('jobs.urls')),
]
