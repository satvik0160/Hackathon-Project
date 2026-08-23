from django.db import models
from users.models import User

class SkillCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.URLField(blank=True)

    def __str__(self):
        return self.name

class Assessment(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    skill_category = models.ForeignKey(SkillCategory, on_delete=models.CASCADE)
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    time_limit_minutes = models.PositiveIntegerField()
    total_marks = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class Question(models.Model):
    ANSWER_CHOICES = [
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
    ]
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=20, choices=[('multiple_choice', 'Multiple Choice'), ('coding', 'Coding')], default='multiple_choice')
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_answer = models.CharField(max_length=1, choices=ANSWER_CHOICES)
    marks = models.PositiveIntegerField(default=1)
    explanation = models.TextField(blank=True)

    def __str__(self):
        return f"{self.assessment.title} - Question {self.id}"

class UserAssessment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessments_taken')
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    score = models.PositiveIntegerField()
    total_marks = models.PositiveIntegerField()
    percentage = models.FloatField()
    completed_at = models.DateTimeField(auto_now_add=True)
    time_taken_seconds = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.user.username} - {self.assessment.title} - {self.percentage}%"
