from django.contrib import admin
from .models import (
    Resume,
    ResumeVersion,
    ResumeSection,
    ResumeGenerationLog
)

class ResumeSectionInline(admin.StackedInline):
    model = ResumeSection
    extra = 1

class ResumeVersionInline(admin.TabularInline):
    model = ResumeVersion
    extra = 0
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ['title', 'student', 'target_role', 'is_primary', 'is_complete', 'completeness_score']
    list_filter = ['is_primary', 'is_complete']
    search_fields = ['student__username', 'title', 'target_role']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ResumeVersionInline]

@admin.register(ResumeVersion)
class ResumeVersionAdmin(admin.ModelAdmin):
    list_display = ['resume', 'version_number', 'template', 'is_current', 'updated_at']
    list_filter = ['is_current', 'template']
    search_fields = ['resume__student__username', 'resume__title']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ResumeSectionInline]

@admin.register(ResumeSection)
class ResumeSectionAdmin(admin.ModelAdmin):
    list_display = ['version', 'section_type', 'order', 'is_visible', 'is_ai_generated']
    list_filter = ['section_type', 'is_visible', 'is_ai_generated']
    search_fields = ['version__resume__student__username']

@admin.register(ResumeGenerationLog)
class ResumeGenerationLogAdmin(admin.ModelAdmin):
    list_display = ['resume', 'action', 'model_used', 'target_role', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['resume__student__username', 'action']
    readonly_fields = ['created_at']
