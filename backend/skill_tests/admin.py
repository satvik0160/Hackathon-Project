from django.contrib import admin
from .models import SkillTest, TestPrerequisite, TestQuestion, TestAttempt, TestResult

class TestPrerequisiteInline(admin.TabularInline):
    model = TestPrerequisite
    fk_name = 'test'
    extra = 1

class TestQuestionInline(admin.StackedInline):
    model = TestQuestion
    extra = 1

@admin.register(SkillTest)
class SkillTestAdmin(admin.ModelAdmin):
    list_display = ('title', 'test_type', 'skill', 'total_questions', 'pass_percentage', 'skill_points_reward', 'xp_reward', 'is_active')
    list_filter = ('test_type', 'skill', 'is_active')
    search_fields = ('title', 'description')
    inlines = [TestPrerequisiteInline, TestQuestionInline]
    prepopulated_fields = {'slug': ('title',)}

@admin.register(TestAttempt)
class TestAttemptAdmin(admin.ModelAdmin):
    list_display = ('student', 'test', 'score', 'percentage', 'passed', 'is_completed', 'attempt_number', 'started_at')
    list_filter = ('passed', 'is_completed', 'test__test_type')

@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'passed', 'skill_progression_applied', 'skill_points_awarded', 'xp_awarded')
    readonly_fields = [f.name for f in TestResult._meta.fields]
