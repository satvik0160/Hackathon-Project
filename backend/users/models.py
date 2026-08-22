from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    EXPERIENCE_LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    ROLE_CHOICES = [
        ('STUDENT', 'Student'),
        ('FACULTY', 'Faculty'),
        ('INSTITUTION_ADMIN', 'Institution Admin'),
        ('INDUSTRY', 'Industry Professional'),
        ('MENTOR', 'Mentor'),
        ('SUPER_ADMIN', 'Super Admin'),
    ]

    bio = models.TextField(blank=True)
    profile_picture = models.URLField(blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    skills = models.JSONField(default=list)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVEL_CHOICES, default='beginner')
    interests = models.JSONField(default=list)
    academic_profile = models.JSONField(default=dict, blank=True) # Added for Onboarding
    career_goal = models.CharField(max_length=255, blank=True) # Added for Onboarding
    onboarding_completed = models.BooleanField(default=False) # Added for Onboarding Engine
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username

class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    xp = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    streak_freezes = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.username} Stats - XP: {self.xp}, Streak: {self.current_streak}"
