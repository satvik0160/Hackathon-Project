from django.db import models
from users.models import User
from assessments.models import SkillCategory

class LearningResource(models.Model):
    TYPE_CHOICES = [
        ('video', 'Video'),
        ('article', 'Article'),
        ('course', 'Course'),
        ('documentation', 'Documentation'),
    ]
    title = models.CharField(max_length=255)
    description = models.TextField()
    resource_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    url = models.URLField()
    skill_category = models.ForeignKey(SkillCategory, on_delete=models.SET_NULL, null=True, blank=True)
    difficulty_level = models.CharField(max_length=50, blank=True)
    estimated_duration_minutes = models.PositiveIntegerField(default=0)
    is_free = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class LearningPath(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learning_paths')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    skill_category = models.ForeignKey(SkillCategory, on_delete=models.SET_NULL, null=True, blank=True)
    resources = models.ManyToManyField(LearningResource, related_name='paths')
    progress_percentage = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"

class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress_records')
    learning_path = models.ForeignKey(LearningPath, on_delete=models.CASCADE, related_name='progress')
    resource = models.ForeignKey(LearningResource, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.resource.title} - {'Done' if self.is_completed else 'Pending'}"
