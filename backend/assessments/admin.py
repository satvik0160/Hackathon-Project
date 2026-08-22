from django.contrib import admin
from .models import (
    Assessment, AssessmentQuestion, AssessmentOption,
    AssessmentAttempt, AssessmentResult, AssessmentAnswer
)

@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'skill_category', 'difficulty_level', 'is_active', 'time_limit_minutes')
    list_filter = ('difficulty_level', 'is_active', 'skill_category')
    search_fields = ('title',)

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('assessment', 'question_text', 'correct_answer', 'marks')
    list_filter = ('assessment',)
    search_fields = ('question_text',)

@admin.register(UserAssessment)
class UserAssessmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'assessment', 'score', 'percentage', 'completed_at')
    list_filter = ('completed_at', 'assessment')
    search_fields = ('user__username', 'assessment__title')
