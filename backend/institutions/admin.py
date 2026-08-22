from django.contrib import admin
from .models import (
    Institution, Department, Course, CourseSkill,
    CurriculumVersion, CurriculumSkillGap, IndustryCurriculumAlignment
)


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'institution_type', 'city', 'state', 'is_verified', 'total_students')
    list_filter = ('institution_type', 'state', 'is_verified')
    search_fields = ('name', 'code', 'city')


class CourseInline(admin.TabularInline):
    model = Course
    extra = 1


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'institution', 'is_active')
    list_filter = ('institution', 'is_active')
    search_fields = ('name', 'code')
    inlines = [CourseInline]


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'department', 'semester', 'credits', 'is_active')
    list_filter = ('department', 'semester', 'is_active')
    search_fields = ('name', 'code')


@admin.register(CourseSkill)
class CourseSkillAdmin(admin.ModelAdmin):
    list_display = ('course', 'skill', 'coverage_level', 'hours_allocated')
    list_filter = ('coverage_level',)
    search_fields = ('course__name', 'skill__name')


@admin.register(CurriculumVersion)
class CurriculumVersionAdmin(admin.ModelAdmin):
    list_display = ('department', 'version', 'academic_year', 'is_active', 'total_courses')
    list_filter = ('is_active', 'department')


@admin.register(CurriculumSkillGap)
class CurriculumSkillGapAdmin(admin.ModelAdmin):
    list_display = ('curriculum_version', 'skill', 'industry_requirement_score', 'curriculum_coverage_score', 'gap_score')
    list_filter = ('curriculum_version',)


@admin.register(IndustryCurriculumAlignment)
class IndustryCurriculumAlignmentAdmin(admin.ModelAdmin):
    list_display = ('curriculum_version', 'industry_sector', 'alignment_score', 'generated_at')
    list_filter = ('industry_sector',)
