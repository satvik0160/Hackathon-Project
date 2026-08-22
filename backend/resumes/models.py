from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import TimeStampedModel


class Resume(TimeStampedModel):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resumes')
    target_role = models.CharField(max_length=200, blank=True)
    title = models.CharField(max_length=200, default='My Resume')
    is_primary = models.BooleanField(default=False)
    is_complete = models.BooleanField(default=False)
    completeness_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])

    class Meta:
        indexes = [
            models.Index(fields=['student', 'is_primary']),
        ]

    def __str__(self):
        return f"{self.title} - {self.student}"


class ResumeVersion(TimeStampedModel):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField(default=1)
    template = models.CharField(max_length=100, default='professional')
    content = models.JSONField(default=dict)
    pdf_url = models.URLField(blank=True)
    is_current = models.BooleanField(default=True)

    class Meta:
        unique_together = ['resume', 'version_number']
        ordering = ['-version_number']

    def __str__(self):
        return f"{self.resume.title} - v{self.version_number}"


class ResumeSection(models.Model):
    class SectionType(models.TextChoices):
        SUMMARY = 'SUMMARY', 'Summary'
        EDUCATION = 'EDUCATION', 'Education'
        EXPERIENCE = 'EXPERIENCE', 'Experience'
        SKILLS = 'SKILLS', 'Skills'
        PROJECTS = 'PROJECTS', 'Projects'
        CERTIFICATIONS = 'CERTIFICATIONS', 'Certifications'
        ACHIEVEMENTS = 'ACHIEVEMENTS', 'Achievements'
        VOLUNTEER = 'VOLUNTEER', 'Volunteer'
        LANGUAGES = 'LANGUAGES', 'Languages'

    version = models.ForeignKey(ResumeVersion, on_delete=models.CASCADE, related_name='sections')
    section_type = models.CharField(max_length=20, choices=SectionType.choices, default=SectionType.SUMMARY)
    content = models.JSONField(default=dict)
    order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    is_ai_generated = models.BooleanField(default=False)
    source_data_snapshot = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.get_section_type_display()} for {self.version}"


class ResumeGenerationLog(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='generation_logs')
    action = models.CharField(max_length=50)
    input_data = models.JSONField(default=dict, blank=True)
    output_data = models.JSONField(default=dict, blank=True)
    model_used = models.CharField(max_length=100, blank=True)
    target_role = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} log for {self.resume}"
