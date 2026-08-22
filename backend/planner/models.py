from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from core.models import TimeStampedModel

class DailyPlan(TimeStampedModel):
    class StatusChoices(models.TextChoices):
        PLANNED = 'PLANNED', 'Planned'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        SKIPPED = 'SKIPPED', 'Skipped'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_plans')
    date = models.DateField(db_index=True)
    is_ai_generated = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.PLANNED, db_index=True)
    total_targets = models.PositiveIntegerField(default=0)
    completed_targets = models.PositiveIntegerField(default=0)
    total_xp_available = models.PositiveIntegerField(default=0)
    total_xp_earned = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['student', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"Plan for {self.student} on {self.date}"

class DailyTarget(TimeStampedModel):
    class TargetTypeChoices(models.TextChoices):
        RESOURCE = 'RESOURCE', 'Resource'
        QUIZ = 'QUIZ', 'Quiz'
        TEST = 'TEST', 'Test'
        CODING_PRACTICE = 'CODING_PRACTICE', 'Coding Practice'
        PROJECT = 'PROJECT', 'Project'
        INTERVIEW_PREP = 'INTERVIEW_PREP', 'Interview Prep'
        REVISION = 'REVISION', 'Revision'
        CUSTOM = 'CUSTOM', 'Custom'
        
    class PriorityChoices(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'Critical'
        
    class StatusChoices(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        SKIPPED = 'SKIPPED', 'Skipped'
        DEFERRED = 'DEFERRED', 'Deferred'
        
    class SourceChoices(models.TextChoices):
        AI_GENERATED = 'AI_GENERATED', 'AI Generated'
        MANUAL = 'MANUAL', 'Manual'
        ROADMAP = 'ROADMAP', 'Roadmap'
        RECOMMENDATION = 'RECOMMENDATION', 'Recommendation'

    plan = models.ForeignKey(DailyPlan, on_delete=models.CASCADE, related_name='targets')
    target_type = models.CharField(max_length=20, choices=TargetTypeChoices.choices, default=TargetTypeChoices.RESOURCE, db_index=True)
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    reference_id = models.PositiveIntegerField(null=True, blank=True)
    reference_type = models.CharField(max_length=50, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    estimated_duration_minutes = models.PositiveIntegerField(default=30)
    priority = models.CharField(max_length=20, choices=PriorityChoices.choices, default=PriorityChoices.MEDIUM)
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.PENDING, db_index=True)
    xp_reward = models.PositiveIntegerField(default=20)
    source = models.CharField(max_length=20, choices=SourceChoices.choices, default=SourceChoices.MANUAL)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'start_time']

    def __str__(self):
        return f"{self.title} ({self.status})"

class TargetCompletion(TimeStampedModel):
    target = models.OneToOneField(DailyTarget, on_delete=models.CASCADE, related_name='completion')
    completed_at = models.DateTimeField(auto_now_add=True)
    actual_duration_minutes = models.PositiveIntegerField(default=0)
    xp_earned = models.PositiveIntegerField(default=0)
    quality_rating = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Completion for {self.target}"

class Streak(models.Model):
    student = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='streak')
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    total_active_days = models.PositiveIntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    streak_freezes_remaining = models.PositiveIntegerField(default=2)
    streak_freezes_used = models.PositiveIntegerField(default=0)
    streak_started_at = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['current_streak']),
            models.Index(fields=['last_active_date']),
        ]

    def __str__(self):
        return f"{self.student} - Streak: {self.current_streak}"

class DailyActivity(TimeStampedModel):
    class ActivityTypeChoices(models.TextChoices):
        RESOURCE_COMPLETED = 'RESOURCE_COMPLETED', 'Resource Completed'
        QUIZ_COMPLETED = 'QUIZ_COMPLETED', 'Quiz Completed'
        TEST_COMPLETED = 'TEST_COMPLETED', 'Test Completed'
        PROJECT_WORK = 'PROJECT_WORK', 'Project Work'
        INTERVIEW_PRACTICE = 'INTERVIEW_PRACTICE', 'Interview Practice'
        ASSESSMENT_TAKEN = 'ASSESSMENT_TAKEN', 'Assessment Taken'
        LOGIN = 'LOGIN', 'Login'
        PROFILE_UPDATE = 'PROFILE_UPDATE', 'Profile Update'
        PLAN_COMPLETED = 'PLAN_COMPLETED', 'Plan Completed'
        CODING_PRACTICE = 'CODING_PRACTICE', 'Coding Practice'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_activities')
    date = models.DateField(db_index=True)
    activity_type = models.CharField(max_length=30, choices=ActivityTypeChoices.choices, db_index=True)
    reference_id = models.PositiveIntegerField(null=True, blank=True)
    reference_type = models.CharField(max_length=50, blank=True)
    duration_minutes = models.PositiveIntegerField(default=0)
    xp_earned = models.PositiveIntegerField(default=0)
    description = models.CharField(max_length=500, blank=True)
    is_meaningful = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['student', 'date']),
            models.Index(fields=['student', 'activity_type']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student} - {self.activity_type} on {self.date}"

class XPTransaction(TimeStampedModel):
    class TransactionTypeChoices(models.TextChoices):
        EARNED = 'EARNED', 'Earned'
        BONUS = 'BONUS', 'Bonus'
        STREAK_BONUS = 'STREAK_BONUS', 'Streak Bonus'
        PENALTY = 'PENALTY', 'Penalty'
        ADJUSTMENT = 'ADJUSTMENT', 'Adjustment'
        ACHIEVEMENT = 'ACHIEVEMENT', 'Achievement'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='xp_transactions')
    amount = models.IntegerField()
    transaction_type = models.CharField(max_length=20, choices=TransactionTypeChoices.choices, default=TransactionTypeChoices.EARNED)
    source_type = models.CharField(max_length=50, blank=True)
    source_id = models.PositiveIntegerField(null=True, blank=True)
    description = models.CharField(max_length=500)
    balance_after = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', 'transaction_type']),
            models.Index(fields=['student', 'created_at']),
        ]

    def __str__(self):
        return f"{self.student} - {self.amount} XP ({self.transaction_type})"

class UserLevel(models.Model):
    student = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_level')
    level = models.PositiveIntegerField(default=1)
    total_xp = models.PositiveIntegerField(default=0)
    xp_for_current_level = models.PositiveIntegerField(default=0)
    xp_for_next_level = models.PositiveIntegerField(default=100)
    title = models.CharField(max_length=100, default='Beginner')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student} - Level {self.level}"

class Achievement(TimeStampedModel):
    class CategoryChoices(models.TextChoices):
        LEARNING = 'LEARNING', 'Learning'
        STREAK = 'STREAK', 'Streak'
        ASSESSMENT = 'ASSESSMENT', 'Assessment'
        TEST = 'TEST', 'Test'
        PROJECT = 'PROJECT', 'Project'
        SOCIAL = 'SOCIAL', 'Social'
        CAREER = 'CAREER', 'Career'
        MILESTONE = 'MILESTONE', 'Milestone'
        
    class RarityChoices(models.TextChoices):
        COMMON = 'COMMON', 'Common'
        UNCOMMON = 'UNCOMMON', 'Uncommon'
        RARE = 'RARE', 'Rare'
        EPIC = 'EPIC', 'Epic'
        LEGENDARY = 'LEGENDARY', 'Legendary'

    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True)
    category = models.CharField(max_length=20, choices=CategoryChoices.choices, default=CategoryChoices.MILESTONE)
    xp_reward = models.PositiveIntegerField(default=50)
    criteria = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    is_secret = models.BooleanField(default=False)
    rarity = models.CharField(max_length=20, choices=RarityChoices.choices, default=RarityChoices.COMMON)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class UserAchievement(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name='earners')
    earned_at = models.DateTimeField(auto_now_add=True)
    notified = models.BooleanField(default=False)

    class Meta:
        unique_together = ['student', 'achievement']
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.student} - {self.achievement}"
