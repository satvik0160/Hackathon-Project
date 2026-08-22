from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from core.models import TimeStampedModel

class Roadmap(TimeStampedModel):
    class StatusChoices(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        ACTIVE = 'ACTIVE', 'Active'
        PAUSED = 'PAUSED', 'Paused'
        COMPLETED = 'COMPLETED', 'Completed'
        ABANDONED = 'ABANDONED', 'Abandoned'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='roadmaps')
    career_role = models.ForeignKey('skills.CareerRole', on_delete=models.SET_NULL, null=True, blank=True, related_name='roadmaps')
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    estimated_weeks = models.PositiveIntegerField(default=12)
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.ACTIVE, db_index=True)
    overall_progress = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    total_nodes = models.PositiveIntegerField(default=0)
    completed_nodes = models.PositiveIntegerField(default=0)
    is_ai_generated = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=['student', 'status']),
        ]

    def __str__(self):
        return f"{self.title} - {self.student}"

class RoadmapNode(TimeStampedModel):
    class NodeTypeChoices(models.TextChoices):
        LEARN = 'LEARN', 'Learn'
        TEST = 'TEST', 'Test'
        PROJECT = 'PROJECT', 'Project'
        MILESTONE = 'MILESTONE', 'Milestone'
        ASSESSMENT = 'ASSESSMENT', 'Assessment'
        
    class StatusChoices(models.TextChoices):
        LOCKED = 'LOCKED', 'Locked'
        AVAILABLE = 'AVAILABLE', 'Available'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        SKIPPED = 'SKIPPED', 'Skipped'

    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, related_name='nodes')
    skill = models.ForeignKey('skills.Skill', on_delete=models.SET_NULL, null=True, blank=True, related_name='roadmap_nodes')
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    node_type = models.CharField(max_length=20, choices=NodeTypeChoices.choices, default=NodeTypeChoices.LEARN)
    order = models.PositiveIntegerField(default=0)
    week_number = models.PositiveIntegerField(default=1)
    current_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    target_score = models.DecimalField(max_digits=5, decimal_places=2, default=80, validators=[MinValueValidator(0), MaxValueValidator(100)])
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=1, default=5)
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.LOCKED, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['week_number', 'order']

    def __str__(self):
        return f"{self.title} (Week {self.week_number})"

class RoadmapDependency(models.Model):
    node = models.ForeignKey(RoadmapNode, on_delete=models.CASCADE, related_name='dependencies')
    depends_on = models.ForeignKey(RoadmapNode, on_delete=models.CASCADE, related_name='dependents')

    class Meta:
        unique_together = ['node', 'depends_on']
        constraints = [
            models.CheckConstraint(condition=~models.Q(node=models.F('depends_on')), name='node_not_equal_depends_on')
        ]

    def __str__(self):
        return f"{self.node} depends on {self.depends_on}"

class RoadmapNodeResource(TimeStampedModel):
    class ResourceTypeChoices(models.TextChoices):
        LEARNING = 'LEARNING', 'Learning'
        TEST = 'TEST', 'Test'
        PROJECT = 'PROJECT', 'Project'
        EXTERNAL = 'EXTERNAL', 'External'

    node = models.ForeignKey(RoadmapNode, on_delete=models.CASCADE, related_name='resources')
    resource = models.ForeignKey('learning.LearningResource', on_delete=models.SET_NULL, null=True, blank=True, related_name='roadmap_usages')
    test = models.ForeignKey('skill_tests.SkillTest', on_delete=models.SET_NULL, null=True, blank=True, related_name='roadmap_usages')
    title = models.CharField(max_length=300, blank=True)
    url = models.URLField(blank=True)
    resource_type = models.CharField(max_length=20, choices=ResourceTypeChoices.choices, default=ResourceTypeChoices.LEARNING)
    order = models.PositiveIntegerField(default=0)
    is_required = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Resource for {self.node}"

class StudentRoadmapProgress(TimeStampedModel):
    class StatusChoices(models.TextChoices):
        NOT_STARTED = 'NOT_STARTED', 'Not Started'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        SKIPPED = 'SKIPPED', 'Skipped'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='roadmap_progress')
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, related_name='student_progress')
    node = models.ForeignKey(RoadmapNode, on_delete=models.CASCADE, related_name='student_progress')
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.NOT_STARTED)
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    time_spent_minutes = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['student', 'roadmap', 'node']
        indexes = [
            models.Index(fields=['student', 'roadmap']),
        ]

    def __str__(self):
        return f"Progress of {self.student} on {self.node}"
