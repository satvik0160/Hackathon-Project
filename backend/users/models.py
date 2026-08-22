import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.db.models import Q
from django.conf import settings


class User(AbstractUser):
    """Custom User model for the platform."""
    class RoleChoices(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        FACULTY = 'FACULTY', 'Faculty'
        INSTITUTION_ADMIN = 'INSTITUTION_ADMIN', 'Institution Admin'
        INDUSTRY = 'INDUSTRY', 'Industry'
        MENTOR = 'MENTOR', 'Mentor'
        SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'

    class AuthProviderChoices(models.TextChoices):
        EMAIL = 'EMAIL', 'Email'
        GOOGLE = 'GOOGLE', 'Google'
        GITHUB = 'GITHUB', 'GitHub'

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    role = models.CharField(max_length=20, choices=RoleChoices.choices, default=RoleChoices.STUDENT, db_index=True)
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")
    phone = models.CharField(validators=[phone_regex], max_length=20, blank=True)
    avatar = models.URLField(blank=True)
    bio = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    auth_provider = models.CharField(max_length=50, choices=AuthProviderChoices.choices, default=AuthProviderChoices.EMAIL)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User'
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['email']),
            models.Index(fields=['is_active', 'role']),
        ]

    def __str__(self):
        return f'{self.get_full_name() or self.username} ({self.role})'


class StudentProfile(models.Model):
    """Profile model for students containing academic and progress details."""
    class AcademicStatusChoices(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        GRADUATED = 'GRADUATED', 'Graduated'
        DROPPED = 'DROPPED', 'Dropped'
        ON_LEAVE = 'ON_LEAVE', 'On Leave'

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    institution = models.ForeignKey('institutions.Institution', on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    department = models.ForeignKey('institutions.Department', on_delete=models.SET_NULL, null=True, blank=True)
    enrollment_number = models.CharField(max_length=50, blank=True, db_index=True)
    degree = models.CharField(max_length=100, blank=True)
    branch = models.CharField(max_length=100, blank=True)
    year = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(6)])
    semester = models.PositiveSmallIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(12)])
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(10)])
    graduation_year = models.PositiveIntegerField(null=True, blank=True)
    academic_status = models.CharField(max_length=20, choices=AcademicStatusChoices.choices, default=AcademicStatusChoices.ACTIVE)
    preferred_learning_hours = models.PositiveSmallIntegerField(default=2)
    career_readiness_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    total_learning_minutes = models.PositiveIntegerField(default=0)
    total_xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(cgpa__gte=0, cgpa__lte=10) | Q(cgpa__isnull=True),
                name='valid_cgpa'
            )
        ]
        indexes = [
            models.Index(fields=['institution']),
            models.Index(fields=['graduation_year']),
        ]

    def __str__(self):
        return f"{self.user.username} - Student Profile"


class CareerGoal(models.Model):
    """Model tracking student career goals and target roles."""
    class SkillLevelChoices(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        ADVANCED = 'ADVANCED', 'Advanced'
        EXPERT = 'EXPERT', 'Expert'

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='career_goals')
    primary_career_role = models.ForeignKey('skills.CareerRole', on_delete=models.SET_NULL, null=True, blank=True, related_name='primary_goals')
    target_role_title = models.CharField(max_length=200, blank=True)
    target_industry = models.CharField(max_length=200, blank=True)
    target_skill_level = models.CharField(max_length=20, choices=SkillLevelChoices.choices, default=SkillLevelChoices.INTERMEDIATE)
    timeline_months = models.PositiveIntegerField(null=True, blank=True)
    is_primary = models.BooleanField(default=False)
    priority = models.PositiveSmallIntegerField(default=1)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['priority', '-is_primary']

    def __str__(self):
        return f"Goal: {self.target_role_title or self.primary_career_role} for {self.student.user.username}"


class FacultyProfile(models.Model):
    """Profile model for faculty members."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='faculty_profile')
    institution = models.ForeignKey('institutions.Institution', on_delete=models.SET_NULL, null=True, blank=True)
    department = models.ForeignKey('institutions.Department', on_delete=models.SET_NULL, null=True, blank=True)
    designation = models.CharField(max_length=100, blank=True)
    specialization = models.CharField(max_length=200, blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    employee_id = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - Faculty Profile"
