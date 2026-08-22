from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, StudentProfile, CareerGoal, FacultyProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_verified', 'is_active', 'created_at')
    list_filter = ('role', 'is_verified', 'is_active', 'auth_provider')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone')
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Platform Info', {'fields': ('role', 'uuid', 'phone', 'avatar', 'bio', 'is_verified', 'auth_provider', 'last_login_ip')}),
    )
    readonly_fields = ('uuid', 'created_at', 'updated_at')


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'institution', 'degree', 'branch', 'year', 'cgpa', 'career_readiness_score', 'current_streak', 'level')
    list_filter = ('academic_status', 'degree', 'year', 'graduation_year')
    search_fields = ('user__username', 'enrollment_number')


@admin.register(CareerGoal)
class CareerGoalAdmin(admin.ModelAdmin):
    list_display = ('student', 'target_role_title', 'target_industry', 'target_skill_level', 'is_primary', 'priority')
    list_filter = ('target_skill_level', 'is_primary')
    search_fields = ('student__user__username', 'target_role_title', 'target_industry')


@admin.register(FacultyProfile)
class FacultyProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'institution', 'department', 'designation', 'experience_years')
    list_filter = ('institution', 'department')
    search_fields = ('user__username', 'employee_id', 'designation')
