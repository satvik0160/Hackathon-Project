from django.db import models
from django.conf import settings
from core.models import TimeStampedModel


class CareerGuidanceSession(TimeStampedModel):
    class SessionType(models.TextChoices):
        CAREER_EXPLORATION = 'CAREER_EXPLORATION', 'Career Exploration'
        SKILL_GAP_ANALYSIS = 'SKILL_GAP_ANALYSIS', 'Skill Gap Analysis'
        LEARNING_ADVICE = 'LEARNING_ADVICE', 'Learning Advice'
        INTERVIEW_PREP = 'INTERVIEW_PREP', 'Interview Prep'
        RESUME_REVIEW = 'RESUME_REVIEW', 'Resume Review'
        GENERAL = 'GENERAL', 'General'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        COMPLETED = 'COMPLETED', 'Completed'
        ARCHIVED = 'ARCHIVED', 'Archived'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='guidance_sessions')
    session_type = models.CharField(max_length=30, choices=SessionType.choices, default=SessionType.GENERAL)
    title = models.CharField(max_length=300, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    total_messages = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['student', 'status']),
        ]

    def __str__(self):
        return f"{self.title or self.get_session_type_display()} - {self.student}"


class CareerGuidanceMessage(models.Model):
    class Role(models.TextChoices):
        USER = 'USER', 'User'
        AI = 'AI', 'AI'
        SYSTEM = 'SYSTEM', 'System'

    session = models.ForeignKey(CareerGuidanceSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    content = models.TextField()
    context_snapshot = models.JSONField(default=dict, blank=True)
    tokens_used = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.role} message in {self.session}"


class ChatSession(TimeStampedModel):
    class ContextType(models.TextChoices):
        GENERAL = 'GENERAL', 'General'
        SKILL_HELP = 'SKILL_HELP', 'Skill Help'
        ROADMAP = 'ROADMAP', 'Roadmap'
        DAILY_PLAN = 'DAILY_PLAN', 'Daily Plan'
        TEST_PREP = 'TEST_PREP', 'Test Prep'
        JOB_SEARCH = 'JOB_SEARCH', 'Job Search'
        INTERVIEW = 'INTERVIEW', 'Interview'
        LEARNING = 'LEARNING', 'Learning'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        COMPLETED = 'COMPLETED', 'Completed'
        ARCHIVED = 'ARCHIVED', 'Archived'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_sessions')
    title = models.CharField(max_length=300, default='New Chat')
    context_type = models.CharField(max_length=20, choices=ContextType.choices, default=ContextType.GENERAL)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    total_messages = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['student', 'status']),
        ]

    def __str__(self):
        return f"{self.title} - {self.student}"


class ChatMessage(models.Model):
    class Role(models.TextChoices):
        USER = 'USER', 'User'
        AI = 'AI', 'AI'
        SYSTEM = 'SYSTEM', 'System'

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    content = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.role} message in {self.session}"
