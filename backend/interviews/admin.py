from django.contrib import admin
from .models import (
    MockInterview,
    InterviewQuestion,
    InterviewResponse,
    InterviewScore,
    InterviewFeedback
)

class InterviewQuestionInline(admin.TabularInline):
    model = InterviewQuestion
    extra = 1

class InterviewResponseInline(admin.StackedInline):
    model = InterviewResponse
    extra = 0
    readonly_fields = ['created_at']

class InterviewScoreInline(admin.StackedInline):
    model = InterviewScore
    extra = 1

class InterviewFeedbackInline(admin.StackedInline):
    model = InterviewFeedback
    extra = 1
    readonly_fields = ['generated_at']

@admin.register(MockInterview)
class MockInterviewAdmin(admin.ModelAdmin):
    list_display = ['student', 'target_role', 'interview_type', 'difficulty', 'status', 'overall_score', 'started_at']
    list_filter = ['status', 'interview_type', 'difficulty']
    search_fields = ['student__username', 'target_role']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [InterviewScoreInline, InterviewFeedbackInline, InterviewQuestionInline]

@admin.register(InterviewQuestion)
class InterviewQuestionAdmin(admin.ModelAdmin):
    list_display = ['interview', 'category', 'difficulty', 'skill', 'order']
    list_filter = ['difficulty', 'category']
    search_fields = ['question_text']
    inlines = [InterviewResponseInline]

@admin.register(InterviewResponse)
class InterviewResponseAdmin(admin.ModelAdmin):
    list_display = ['question', 'duration_seconds', 'created_at']
    readonly_fields = ['created_at']

@admin.register(InterviewScore)
class InterviewScoreAdmin(admin.ModelAdmin):
    list_display = ['interview', 'overall_score', 'technical_score', 'communication_score']
    search_fields = ['interview__student__username']

@admin.register(InterviewFeedback)
class InterviewFeedbackAdmin(admin.ModelAdmin):
    list_display = ['interview', 'generated_at']
    readonly_fields = ['generated_at']
