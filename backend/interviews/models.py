from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import TimeStampedModel


class MockInterview(TimeStampedModel):
    class Difficulty(models.TextChoices):
        EASY = 'EASY', 'Easy'
        MEDIUM = 'MEDIUM', 'Medium'
        HARD = 'HARD', 'Hard'

    class InterviewType(models.TextChoices):
        TECHNICAL = 'TECHNICAL', 'Technical'
        BEHAVIORAL = 'BEHAVIORAL', 'Behavioral'
        HR = 'HR', 'HR'
        SYSTEM_DESIGN = 'SYSTEM_DESIGN', 'System Design'
        MIXED = 'MIXED', 'Mixed'

    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mock_interviews')
    target_role = models.CharField(max_length=200)
    career_role = models.ForeignKey('skills.CareerRole', on_delete=models.SET_NULL, null=True, blank=True)
    difficulty = models.CharField(max_length=20, choices=Difficulty.choices, default=Difficulty.MEDIUM)
    interview_type = models.CharField(max_length=20, choices=InterviewType.choices, default=InterviewType.TECHNICAL, db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(default=0)
    overall_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', 'interview_type']),
            models.Index(fields=['student', 'status']),
        ]

    def __str__(self):
        return f"{self.student} - {self.target_role} ({self.get_interview_type_display()})"


class InterviewQuestion(models.Model):
    class Difficulty(models.TextChoices):
        EASY = 'EASY', 'Easy'
        MEDIUM = 'MEDIUM', 'Medium'
        HARD = 'HARD', 'Hard'

    interview = models.ForeignKey(MockInterview, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    category = models.CharField(max_length=100, blank=True)
    difficulty = models.CharField(max_length=20, choices=Difficulty.choices, default=Difficulty.MEDIUM)
    skill = models.ForeignKey('skills.Skill', on_delete=models.SET_NULL, null=True, blank=True)
    expected_answer_points = models.JSONField(default=list, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Q{self.order} for {self.interview}"


class InterviewResponse(models.Model):
    question = models.ForeignKey(InterviewQuestion, on_delete=models.CASCADE, related_name='responses')
    response_text = models.TextField(blank=True)
    audio_url = models.URLField(blank=True)
    video_url = models.URLField(blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Response to {self.question}"


class InterviewScore(models.Model):
    interview = models.OneToOneField(MockInterview, on_delete=models.CASCADE, related_name='score_detail')
    technical_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    communication_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    relevance_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    problem_solving_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    structure_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    overall_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])

    def __str__(self):
        return f"Scores for {self.interview}"


class InterviewFeedback(models.Model):
    interview = models.OneToOneField(MockInterview, on_delete=models.CASCADE, related_name='feedback')
    strengths = models.JSONField(default=list)
    weaknesses = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)
    detailed_feedback = models.TextField(blank=True)
    improvement_areas = models.JSONField(default=list)
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback for {self.interview}"
