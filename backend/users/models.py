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
