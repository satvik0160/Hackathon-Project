from django.db import models
from users.models import User

class Company(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    logo_url = models.URLField(blank=True)
    website = models.URLField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    industry = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.name

class JobListing(models.Model):
    JOB_TYPE_CHOICES = [
        ('internship', 'Internship'),
        ('full-time', 'Full-time'),
        ('part-time', 'Part-time'),
        ('freelance', 'Freelance'),
    ]
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=255)
    description = models.TextField()
    job_type = models.CharField(max_length=50, choices=JOB_TYPE_CHOICES)
    location = models.CharField(max_length=255)
    is_remote = models.BooleanField(default=False)
    required_skills = models.JSONField(default=list)
    min_experience_level = models.CharField(max_length=50, blank=True)
    salary_range = models.CharField(max_length=100, blank=True)
    application_url = models.URLField(blank=True)
    posted_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} at {self.company.name}"

class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('SAVED', 'Saved'),
        ('APPLIED', 'Applied'),
        ('SHORTLISTED', 'Shortlisted'),
        ('INTERVIEW', 'Interview'),
        ('SELECTED', 'Selected'),
        ('REJECTED', 'Rejected'),
        ('WITHDRAWN', 'Withdrawn'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(JobListing, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='APPLIED')
    applied_at = models.DateTimeField(auto_now_add=True)
    cover_letter = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} -> {self.job.title} ({self.status})"
