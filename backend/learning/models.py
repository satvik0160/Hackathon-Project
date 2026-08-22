from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from core.models import TimeStampedModel, SoftDeleteModel

class LearningResource(SoftDeleteModel):
    class ResourceType(models.TextChoices):
        VIDEO = 'VIDEO', 'Video'
        ARTICLE = 'ARTICLE', 'Article'
        COURSE = 'COURSE', 'Course'
        DOCUMENTATION = 'DOCUMENTATION', 'Documentation'
        TUTORIAL = 'TUTORIAL', 'Tutorial'
        BOOK = 'BOOK', 'Book'
        PODCAST = 'PODCAST', 'Podcast'
        PROJECT = 'PROJECT', 'Project'

    class DifficultyLevel(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        ADVANCED = 'ADVANCED', 'Advanced'
        EXPERT = 'EXPERT', 'Expert'

    title = models.CharField(max_length=500)
    slug = models.SlugField(max_length=500, unique=True)
    description = models.TextField()
    provider = models.CharField(max_length=200, blank=True)
    url = models.URLField()
    resource_type = models.CharField(
        max_length=20,
        choices=ResourceType.choices,
        default=ResourceType.COURSE
    )
    difficulty_level = models.CharField(
        max_length=20,
        choices=DifficultyLevel.choices,
        default=DifficultyLevel.BEGINNER
    )
    estimated_duration_minutes = models.PositiveIntegerField(default=0)
    thumbnail_url = models.URLField(blank=True)
    is_free = models.BooleanField(default=True, db_index=True)
    verification_required = models.BooleanField(default=True)
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    total_enrollments = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['resource_type', 'difficulty_level']),
            models.Index(fields=['is_free', 'is_active']),
            models.Index(fields=['provider']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class ResourceSkill(models.Model):
    resource = models.ForeignKey(
        LearningResource,
        on_delete=models.CASCADE,
        related_name='skills_taught'
    )
    skill = models.ForeignKey(
        'skills.Skill',
        on_delete=models.CASCADE,
        related_name='learning_resources'
    )
    relevance_score = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=1.0,
        validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    skill_points = models.PositiveIntegerField(default=5)

    class Meta:
        unique_together = ['resource', 'skill']

    def __str__(self):
        return f"{self.resource.title} - {self.skill}"

class ResourcePrerequisite(models.Model):
    resource = models.ForeignKey(
        LearningResource,
        on_delete=models.CASCADE,
        related_name='prerequisites'
    )
    prerequisite_resource = models.ForeignKey(
        LearningResource,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='is_prerequisite_for'
    )
    prerequisite_skill = models.ForeignKey(
        'skills.Skill',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    min_proficiency = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(prerequisite_resource__isnull=False) | models.Q(prerequisite_skill__isnull=False),
                name='prerequisite_resource_or_skill_required'
            )
        ]

    def __str__(self):
        if self.prerequisite_resource:
            return f"{self.resource.title} requires {self.prerequisite_resource.title}"
        return f"{self.resource.title} requires {self.prerequisite_skill} at {self.min_proficiency}%"

class ResourceProgress(TimeStampedModel):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resource_progress'
    )
    resource = models.ForeignKey(
        LearningResource,
        on_delete=models.CASCADE,
        related_name='student_progress'
    )
    started_at = models.DateTimeField(auto_now_add=True)
    last_accessed_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    completion_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    time_spent_minutes = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False, db_index=True)
    is_verified = models.BooleanField(default=False)
    verification_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    verification_attempts = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ['student', 'resource']
        indexes = [
            models.Index(fields=['student', 'is_completed']),
            models.Index(fields=['student', 'is_verified']),
        ]

    def __str__(self):
        return f"{self.student} - {self.resource.title}"

class ResourceVerificationQuiz(TimeStampedModel):
    resource = models.ForeignKey(
        LearningResource,
        on_delete=models.CASCADE,
        related_name='verification_quizzes'
    )
    question_text = models.TextField()
    options = models.JSONField(default=list)
    correct_answer_index = models.PositiveIntegerField()
    explanation = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.resource.title} Quiz - Q{self.order}"
