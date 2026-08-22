from django.urls import path
from .views import LearningResourceListView, LearningPathListView, GenerateLearningPathView, UpdateProgressView

urlpatterns = [
    path('resources/', LearningResourceListView.as_view(), name='learning-resources'),
    path('paths/', LearningPathListView.as_view(), name='learning-paths'),
    path('paths/generate/', GenerateLearningPathView.as_view(), name='generate-path'),
    path('progress/<int:pk>/', UpdateProgressView.as_view(), name='update-progress'),
]
