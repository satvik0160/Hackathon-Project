from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from core.models import TimeStampedModel, SoftDeleteModel

class SkillTest(SoftDeleteModel):
    class TestType(models.TextChoices):
        EASY = 'EASY', 'Easy'
        MEDIUM = 'MEDIUM', 'Medium'
        HARD = 'HARD', 'Hard'

    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True)
    description = models.TextField()
    test_type = models.CharField(max_length=20, choices=TestType.choices, default=TestType.EASY, db_index=True)
    skill = models.ForeignKey('skills.Skill', on_delete=models.CASCADE, related_name='skill_tests')
    career_role = models.ForeignKey('skills.CareerRole', on_delete=models.SET_NULL, null=True, blank=True, related_name='skill_tests')
    topic = models.CharField(max_length=200, blank=True)
    total_questions = models.PositiveIntegerField(default=10)
    total_marks = models.PositiveIntegerField(default=100)
    time_limit_minutes = models.PositiveIntegerField(default=30)
    pass_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=80)
    skill_points_reward = models.PositiveIntegerField(default=5)
    xp_reward = models.PositiveIntegerField(default=30)
    max_attempts = models.PositiveIntegerField(default=0)
    cooldown_hours = models.PositiveIntegerField(default=24)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['skill', 'test_type']),
            models.Index(fields=['test_type', 'is_active']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
        
    def __str__(self):
        return self.title

class TestPrerequisite(models.Model):
    test = models.ForeignKey(SkillTest, on_delete=models.CASCADE, related_name='prerequisites')
    prerequisite_test = models.ForeignKey(SkillTest, on_delete=models.CASCADE, related_name='is_prerequisite_for')
    min_score_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=80, validators=[MinValueValidator(0), MaxValueValidator(100)])

    class Meta:
        unique_together = ['test', 'prerequisite_test']
        constraints = [
            models.CheckConstraint(condition=~models.Q(test=models.F('prerequisite_test')), name='test_not_equal_prerequisite')
        ]

    def __str__(self):
        return f"{self.test.title} requires {self.prerequisite_test.title}"

class TestQuestion(TimeStampedModel):
    class QuestionType(models.TextChoices):
        MCQ = 'MCQ', 'Multiple Choice'
        TRUE_FALSE = 'TRUE_FALSE', 'True/False'
        MULTI_SELECT = 'MULTI_SELECT', 'Multiple Select'
        CODE = 'CODE', 'Code'

    class Difficulty(models.TextChoices):
        EASY = 'EASY', 'Easy'
        MEDIUM = 'MEDIUM', 'Medium'
        HARD = 'HARD', 'Hard'

    test = models.ForeignKey(SkillTest, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QuestionType.choices, default=QuestionType.MCQ)
    options = models.JSONField(default=list)
    correct_answer = models.CharField(max_length=500)
    explanation = models.TextField(blank=True)
    difficulty = models.CharField(max_length=20, choices=Difficulty.choices, default=Difficulty.MEDIUM)
    marks = models.PositiveIntegerField(default=10)
    skill = models.ForeignKey('skills.Skill', on_delete=models.SET_NULL, null=True, blank=True)
    topic = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.test.title} - Q{self.order}: {self.question_text[:50]}"

class TestAttempt(TimeStampedModel):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='test_attempts')
    test = models.ForeignKey(SkillTest, on_delete=models.CASCADE, related_name='attempts')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_taken_seconds = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False, db_index=True)
    score = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    total_marks = models.PositiveIntegerField(default=0)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    passed = models.BooleanField(default=False, db_index=True)
    attempt_number = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['student', 'test']),
            models.Index(fields=['student', 'passed']),
        ]

    def __str__(self):
        return f"{self.student.username} - {self.test.title} (Attempt {self.attempt_number})"

class TestAnswer(models.Model):
    attempt = models.ForeignKey(TestAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(TestQuestion, on_delete=models.CASCADE, related_name='answers')
    selected_answer = models.TextField(blank=True)
    is_correct = models.BooleanField(default=False)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    time_spent_seconds = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ['attempt', 'question']

    def __str__(self):
        return f"{self.attempt} - {self.question}"

class TestResult(TimeStampedModel):
    attempt = models.OneToOneField(TestAttempt, on_delete=models.CASCADE, related_name='result')
    skill_scores = models.JSONField(default=dict)
    passed = models.BooleanField(default=False)
    skill_progression_applied = models.BooleanField(default=False)
    skill_points_awarded = models.PositiveIntegerField(default=0)
    xp_awarded = models.PositiveIntegerField(default=0)
    feedback = models.JSONField(default=dict)

    def __str__(self):
        return f"Result for {self.attempt}"
