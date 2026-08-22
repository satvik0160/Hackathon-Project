from django.contrib import admin
from .models import (
    LearningResource, ResourceSkill, ResourcePrerequisite,
    ResourceProgress, ResourceVerificationQuiz
)

class ResourceSkillInline(admin.TabularInline):
    model = ResourceSkill
    extra = 1

class ResourcePrerequisiteInline(admin.TabularInline):
    model = ResourcePrerequisite
    fk_name = 'resource'
    extra = 1

class ResourceVerificationQuizInline(admin.StackedInline):
    model = ResourceVerificationQuiz
    extra = 1

@admin.register(LearningResource)
class LearningResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'provider', 'resource_type', 'difficulty_level', 'estimated_duration_minutes', 'is_free', 'verification_required', 'total_enrollments', 'is_active')
    list_filter = ('resource_type', 'difficulty_level', 'is_free', 'verification_required', 'provider')
    search_fields = ('title', 'description', 'provider')
    inlines = [ResourceSkillInline, ResourcePrerequisiteInline, ResourceVerificationQuizInline]
    prepopulated_fields = {'slug': ('title',)}

@admin.register(ResourceProgress)
class ResourceProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'resource', 'completion_percentage', 'is_completed', 'is_verified', 'verification_score', 'started_at')
    list_filter = ('is_completed', 'is_verified')
