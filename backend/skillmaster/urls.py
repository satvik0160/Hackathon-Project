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
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    # Security: Obscured Admin URL to prevent brute-force attacks
    path('portal-secure-admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/assessments/', include('assessments.urls')),
    path('api/learning/', include('learning.urls')),
    path('api/jobs/', include('jobs.urls')),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/docs/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
