from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline
from .models import (
    Company,
    JobPosting,
    InternshipPosting,
    OpportunitySkill,
    Application,
    ApplicationStatusHistory,
    StudentJobMatch
)

class OpportunitySkillInline(GenericTabularInline):
    model = OpportunitySkill
    extra = 1

class ApplicationStatusHistoryInline(admin.TabularInline):
    model = ApplicationStatusHistory
    extra = 0
    readonly_fields = ['changed_at']

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'industry', 'company_size', 'location', 'is_verified', 'is_hiring']
    list_filter = ['is_verified', 'is_hiring', 'company_size', 'industry']
    search_fields = ['name', 'industry', 'location']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at', 'deleted_at', 'is_deleted']

@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'job_type', 'experience_level', 'location', 'status', 'deadline']
    list_filter = ['status', 'job_type', 'experience_level', 'is_remote', 'company']
    search_fields = ['title', 'company__name', 'location']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at', 'deleted_at', 'is_deleted']
    inlines = [OpportunitySkillInline]

@admin.register(InternshipPosting)
class InternshipPostingAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'duration_months', 'location', 'status', 'is_ppo', 'deadline']
    list_filter = ['status', 'is_remote', 'is_ppo', 'company']
    search_fields = ['title', 'company__name', 'location']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at', 'deleted_at', 'is_deleted']
    inlines = [OpportunitySkillInline]

@admin.register(OpportunitySkill)
class OpportunitySkillAdmin(admin.ModelAdmin):
    list_display = ['skill', 'opportunity', 'importance', 'min_proficiency']
    list_filter = ['importance']
    search_fields = ['skill__name']

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['student', 'opportunity', 'status', 'applied_at']
    list_filter = ['status', 'applied_at']
    search_fields = ['student__username', 'student__email']
    readonly_fields = ['created_at', 'updated_at', 'applied_at']
    inlines = [ApplicationStatusHistoryInline]

@admin.register(ApplicationStatusHistory)
class ApplicationStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['application', 'from_status', 'to_status', 'changed_by', 'changed_at']
    list_filter = ['changed_at', 'from_status', 'to_status']
    search_fields = ['application__student__username']
    readonly_fields = ['changed_at']

@admin.register(StudentJobMatch)
class StudentJobMatchAdmin(admin.ModelAdmin):
    list_display = ['student', 'opportunity', 'match_score', 'generated_at']
    list_filter = ['generated_at']
    search_fields = ['student__username']
    readonly_fields = ['created_at', 'updated_at', 'generated_at']
