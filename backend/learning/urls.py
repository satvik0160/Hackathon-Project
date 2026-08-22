from django.urls import path
from .views import LearningResourceListView, LearningPathListView, GenerateLearningPathView, UpdateProgressView, DailyPlannerView

urlpatterns = [
    path('resources/', LearningResourceListView.as_view(), name='learning-resources'),
    path('paths/', LearningPathListView.as_view(), name='learning-paths'),
    path('generate/', GenerateLearningPathView.as_view(), name='learning-generate'),
    path('progress/<int:pk>/', UpdateProgressView.as_view(), name='learning-progress'),
    path('daily-planner/', DailyPlannerView.as_view(), name='daily-planner'),
]
