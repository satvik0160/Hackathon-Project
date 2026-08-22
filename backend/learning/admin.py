from django.contrib import admin
from .models import (
    LearningResource, ResourceSkill, ResourcePrerequisite,
    ResourceProgress, ResourceVerificationQuiz
)

@admin.register(LearningResource)
class LearningResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'resource_type', 'skill_category', 'difficulty_level', 'is_free')
    list_filter = ('resource_type', 'difficulty_level', 'is_free', 'skill_category')
    search_fields = ('title', 'description')

@admin.register(LearningPath)
class LearningPathAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'skill_category', 'progress_percentage', 'created_at')
    list_filter = ('skill_category', 'created_at')
    search_fields = ('user__username', 'title')

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'learning_path', 'resource', 'is_completed', 'completed_at')
    list_filter = ('is_completed',)
    search_fields = ('user__username', 'learning_path__title')
