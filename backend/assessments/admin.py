from django.contrib import admin
from .models import (
    Assessment, AssessmentQuestion, AssessmentOption,
    AssessmentAttempt, AssessmentResult, AssessmentAnswer
)

class AssessmentOptionInline(admin.TabularInline):
    model = AssessmentOption
    extra = 1

class AssessmentQuestionInline(admin.StackedInline):
    model = AssessmentQuestion
    extra = 1
    show_change_link = True

@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'assessment_type', 'difficulty_level', 'skill', 'total_questions', 'total_marks', 'pass_percentage', 'is_active')
    list_filter = ('assessment_type', 'difficulty_level', 'is_active')
    search_fields = ('title', 'description')
    inlines = [AssessmentQuestionInline]
    prepopulated_fields = {'slug': ('title',)}

@admin.register(AssessmentQuestion)
class AssessmentQuestionAdmin(admin.ModelAdmin):
    list_display = ('assessment', 'get_question_text', 'question_type', 'difficulty', 'skill', 'marks', 'order')
    list_filter = ('question_type', 'difficulty', 'assessment')
    inlines = [AssessmentOptionInline]

    def get_question_text(self, obj):
        return obj.question_text[:80]
    get_question_text.short_description = 'Question Text'

@admin.register(AssessmentAttempt)
class AssessmentAttemptAdmin(admin.ModelAdmin):
    list_display = ('student', 'assessment', 'score', 'percentage', 'passed', 'is_completed', 'attempt_number', 'started_at')
    list_filter = ('is_completed', 'passed', 'assessment')
    readonly_fields = ('score', 'percentage')

@admin.register(AssessmentResult)
class AssessmentResultAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'created_at')
    
    def get_readonly_fields(self, request, obj=None):
        return [f.name for f in self.model._meta.fields]
