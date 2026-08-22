from django.contrib import admin
from .models import (
    IndustryPartner,
    IndustrySkillRequirement,
    IndustrySkillDemand,
    SkillDemandSnapshot,
    IndustryProject,
    ProjectSkill,
    ProjectApplication,
    ProjectTeam,
    ProjectMember,
    ProjectEvaluation,
    IndustryFeedback,
    IndustryEvaluation
)

@admin.register(IndustryPartner)
class IndustryPartnerAdmin(admin.ModelAdmin):
    list_display = ['user', 'company', 'designation', 'is_verified', 'verified_at']
    list_filter = ['is_verified', 'company']
    search_fields = ['user__username', 'company__name', 'designation']

@admin.register(IndustrySkillRequirement)
class IndustrySkillRequirementAdmin(admin.ModelAdmin):
    list_display = ['company', 'role_title', 'skill', 'importance', 'min_proficiency']
    list_filter = ['importance', 'company']
    search_fields = ['company__name', 'role_title', 'skill__name']

@admin.register(IndustrySkillDemand)
class IndustrySkillDemandAdmin(admin.ModelAdmin):
    list_display = ['skill', 'role', 'industry_sector', 'demand_score', 'snapshot_date', 'is_demo_data']
    list_filter = ['is_demo_data', 'snapshot_date', 'industry_sector']
    search_fields = ['skill__name', 'role']

@admin.register(SkillDemandSnapshot)
class SkillDemandSnapshotAdmin(admin.ModelAdmin):
    list_display = ['skill', 'period', 'avg_demand_score', 'trend']
    list_filter = ['trend', 'period']
    search_fields = ['skill__name', 'period']

class ProjectSkillInline(admin.TabularInline):
    model = ProjectSkill
    extra = 1

@admin.register(IndustryProject)
class IndustryProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'project_type', 'status', 'start_date', 'end_date']
    list_filter = ['status', 'project_type', 'company']
    search_fields = ['title', 'company__name']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ProjectSkillInline]

@admin.register(ProjectApplication)
class ProjectApplicationAdmin(admin.ModelAdmin):
    list_display = ['student', 'project', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['student__username', 'project__title']

class ProjectMemberInline(admin.TabularInline):
    model = ProjectMember
    extra = 1

@admin.register(ProjectTeam)
class ProjectTeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'formed_at']
    search_fields = ['name', 'project__title']
    inlines = [ProjectMemberInline]

@admin.register(ProjectEvaluation)
class ProjectEvaluationAdmin(admin.ModelAdmin):
    list_display = ['project', 'student', 'evaluator', 'overall_score']
    search_fields = ['student__username', 'project__title']

class IndustryEvaluationInline(admin.TabularInline):
    model = IndustryEvaluation
    extra = 1

@admin.register(IndustryFeedback)
class IndustryFeedbackAdmin(admin.ModelAdmin):
    list_display = ['student', 'company', 'context_type', 'overall_rating', 'is_public']
    list_filter = ['context_type', 'is_public', 'company']
    search_fields = ['student__username', 'company__name']
    inlines = [IndustryEvaluationInline]
