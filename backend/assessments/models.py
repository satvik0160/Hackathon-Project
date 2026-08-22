from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from core.models import TimeStampedModel, SoftDeleteModel

class Assessment(SoftDeleteModel):
    class AssessmentType(models.TextChoices):
        ONBOARDING = 'onboarding', 'Onboarding'
        CAREER_SPECIFIC = 'career_specific', 'Career Specific'
        SKILL_SPECIFIC = 'skill_specific', 'Skill Specific'
        DIAGNOSTIC = 'diagnostic', 'Diagnostic'

    class DifficultyLevel(models.TextChoices):
        EASY = 'EASY', 'Easy'
        MEDIUM = 'MEDIUM', 'Medium'
        HARD = 'HARD', 'Hard'
        ADAPTIVE = 'ADAPTIVE', 'Adaptive'

    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True)
    description = models.TextField()
    assessment_type = models.CharField(
        max_length=50,
        choices=AssessmentType.choices,
        db_index=True
    )
    skill = models.ForeignKey(
        'skills.Skill',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assessments'
    )
    career_role = models.ForeignKey(
        'skills.CareerRole',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assessments'
    )
    difficulty_level = models.CharField(
        max_length=20,
        choices=DifficultyLevel.choices,
        default=DifficultyLevel.MEDIUM
    )
    time_limit_minutes = models.PositiveIntegerField(default=30)
    total_questions = models.PositiveIntegerField(default=10)
    total_marks = models.PositiveIntegerField(default=100)
    pass_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=60)
    is_adaptive = models.BooleanField(default=False)
    max_attempts = models.PositiveIntegerField(default=3)
    instructions = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['assessment_type', 'is_active']),
            models.Index(fields=['skill']),
            models.Index(fields=['career_role']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class AssessmentQuestion(TimeStampedModel):
    class QuestionType(models.TextChoices):
        MCQ = 'MCQ', 'Multiple Choice'
        TRUE_FALSE = 'TRUE_FALSE', 'True/False'
        SHORT_ANSWER = 'SHORT_ANSWER', 'Short Answer'
        MULTI_SELECT = 'MULTI_SELECT', 'Multiple Select'

    class Difficulty(models.TextChoices):
        EASY = 'EASY', 'Easy'
        MEDIUM = 'MEDIUM', 'Medium'
        HARD = 'HARD', 'Hard'

    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    question_text = models.TextField()
    question_type = models.CharField(
        max_length=20,
        choices=QuestionType.choices,
        default=QuestionType.MCQ
    )
    difficulty = models.CharField(
        max_length=20,
        choices=Difficulty.choices,
        default=Difficulty.MEDIUM
    )
    skill = models.ForeignKey(
        'skills.Skill',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assessment_questions'
    )
    topic = models.CharField(max_length=200, blank=True)
    marks = models.PositiveIntegerField(default=1)
    explanation = models.TextField(blank=True)
    hint = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['order', 'id']
        indexes = [
            models.Index(fields=['assessment', 'is_active']),
        ]

    def __str__(self):
        return f"{self.assessment.title} - Q{self.order}: {self.question_text[:50]}"

class AssessmentOption(models.Model):
    question = models.ForeignKey(
        AssessmentQuestion,
        on_delete=models.CASCADE,
        related_name='options'
    )
    option_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.option_text[:50]

class AssessmentAttempt(TimeStampedModel):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assessment_attempts'
    )
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name='attempts'
    )
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_taken_seconds = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False, db_index=True)
    score = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    total_marks = models.PositiveIntegerField(default=0)
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    passed = models.BooleanField(default=False)
    attempt_number = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['student', 'assessment']),
            models.Index(fields=['student', 'is_completed']),
        ]

    def __str__(self):
        return f"{self.student} - {self.assessment.title} (Attempt {self.attempt_number})"

class AssessmentAnswer(models.Model):
    attempt = models.ForeignKey(
        AssessmentAttempt,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    question = models.ForeignKey(
        AssessmentQuestion,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    selected_option = models.ForeignKey(
        AssessmentOption,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='selections'
    )
    text_answer = models.TextField(blank=True)
    is_correct = models.BooleanField(default=False)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    time_spent_seconds = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ['attempt', 'question']

    def __str__(self):
        return f"{self.attempt} - {self.question.id}"

class AssessmentResult(TimeStampedModel):
    attempt = models.OneToOneField(
        AssessmentAttempt,
        on_delete=models.CASCADE,
        related_name='result'
    )
    skill_scores = models.JSONField(default=dict)
    strengths = models.JSONField(default=list)
    weaknesses = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)
    difficulty_analysis = models.JSONField(default=dict)
    topic_analysis = models.JSONField(default=dict)

    def __str__(self):
        return f"Result: {self.attempt}"
