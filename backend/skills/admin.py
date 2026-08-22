from django.contrib import admin
from .models import (
    SkillCategory, Skill, SkillRelationship,
    CareerRole, CareerRoleSkill, StudentSkill, SkillEvidence
)

@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent_category', 'order', 'is_active')
    list_filter = ('is_active', 'parent_category')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'parent_skill', 'difficulty_level', 'is_technical', 'is_active')
    list_filter = ('category', 'difficulty_level', 'is_technical', 'is_active')
    search_fields = ('name', 'aliases')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(SkillRelationship)
class SkillRelationshipAdmin(admin.ModelAdmin):
    list_display = ('from_skill', 'relationship_type', 'to_skill', 'strength')


class CareerRoleSkillInline(admin.TabularInline):
    model = CareerRoleSkill
    extra = 1


@admin.register(CareerRole)
class CareerRoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'industry', 'demand_level', 'growth_rate')
    list_filter = ('category', 'industry', 'demand_level')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [CareerRoleSkillInline]


@admin.register(StudentSkill)
class StudentSkillAdmin(admin.ModelAdmin):
    list_display = ('student', 'skill', 'proficiency_score', 'target_score', 'status', 'source', 'last_assessed_at')
    list_filter = ('status', 'source', 'skill__category')
    search_fields = ('student__username', 'skill__name')


@admin.register(SkillEvidence)
class SkillEvidenceAdmin(admin.ModelAdmin):
    list_display = ('student', 'skill', 'evidence_type', 'score', 'confidence', 'is_verified', 'created_at')
    list_filter = ('evidence_type', 'is_verified')
