import uuid
from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from core.models import TimeStampedModel, SoftDeleteModel

class Company(SoftDeleteModel):
    class CompanySize(models.TextChoices):
        STARTUP = 'STARTUP', 'Startup'
        SMALL = 'SMALL', 'Small'
        MEDIUM = 'MEDIUM', 'Medium'
        LARGE = 'LARGE', 'Large'
        ENTERPRISE = 'ENTERPRISE', 'Enterprise'

    name = models.CharField(max_length=300, db_index=True)
    slug = models.SlugField(max_length=300, unique=True)
    description = models.TextField(blank=True)
    logo_url = models.URLField(blank=True)
    website = models.URLField(blank=True)
    industry = models.CharField(max_length=200, blank=True, db_index=True)
    company_size = models.CharField(
        max_length=20,
        choices=CompanySize.choices,
        default=CompanySize.MEDIUM
    )
    founded_year = models.PositiveIntegerField(null=True, blank=True)
    headquarters = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=300, blank=True)
    is_verified = models.BooleanField(default=False)
    is_hiring = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Companies'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name) + '-' + str(uuid.uuid4())[:8]
        super().save(*args, **kwargs)


class JobPosting(SoftDeleteModel):
    class JobType(models.TextChoices):
        FULL_TIME = 'FULL_TIME', 'Full Time'
        PART_TIME = 'PART_TIME', 'Part Time'
        CONTRACT = 'CONTRACT', 'Contract'
        FREELANCE = 'FREELANCE', 'Freelance'

    class ExperienceLevel(models.TextChoices):
        FRESHER = 'FRESHER', 'Fresher'
        JUNIOR = 'JUNIOR', 'Junior'
        MID = 'MID', 'Mid'
        SENIOR = 'SENIOR', 'Senior'
        LEAD = 'LEAD', 'Lead'

    class SalaryPeriod(models.TextChoices):
        HOURLY = 'HOURLY', 'Hourly'
        MONTHLY = 'MONTHLY', 'Monthly'
        YEARLY = 'YEARLY', 'Yearly'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        OPEN = 'OPEN', 'Open'
        PAUSED = 'PAUSED', 'Paused'
        CLOSED = 'CLOSED', 'Closed'

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='job_postings')
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True)
    description = models.TextField()
    responsibilities = models.TextField(blank=True)
    qualifications = models.TextField(blank=True)
    job_type = models.CharField(max_length=20, choices=JobType.choices, default=JobType.FULL_TIME, db_index=True)
    experience_level = models.CharField(max_length=20, choices=ExperienceLevel.choices, default=ExperienceLevel.FRESHER, db_index=True)
    location = models.CharField(max_length=300, blank=True)
    is_remote = models.BooleanField(default=False, db_index=True)
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_currency = models.CharField(max_length=3, default='INR')
    salary_period = models.CharField(max_length=20, choices=SalaryPeriod.choices, default=SalaryPeriod.YEARLY)
    application_url = models.URLField(blank=True)
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='posted_jobs')
    deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN, db_index=True)
    total_applications = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['company', 'status']),
            models.Index(fields=['job_type', 'experience_level']),
            models.Index(fields=['location', 'is_remote']),
            models.Index(fields=['deadline']),
        ]

    def __str__(self):
        return f"{self.title} at {self.company.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.company.name}-{self.title}") + '-' + str(uuid.uuid4())[:8]
        super().save(*args, **kwargs)


class InternshipPosting(SoftDeleteModel):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        OPEN = 'OPEN', 'Open'
        PAUSED = 'PAUSED', 'Paused'
        CLOSED = 'CLOSED', 'Closed'

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='internship_postings')
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True)
    description = models.TextField()
    duration_months = models.PositiveIntegerField(default=3)
    stipend_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stipend_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stipend_currency = models.CharField(max_length=3, default='INR')
    location = models.CharField(max_length=300, blank=True)
    is_remote = models.BooleanField(default=False, db_index=True)
    is_ppo = models.BooleanField(default=False)
    application_url = models.URLField(blank=True)
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='posted_internships')
    deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN, db_index=True)
    total_applications = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['company', 'status']),
            models.Index(fields=['deadline']),
        ]

    def __str__(self):
        return f"{self.title} Intern at {self.company.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.company.name}-{self.title}") + '-' + str(uuid.uuid4())[:8]
        super().save(*args, **kwargs)


class OpportunitySkill(TimeStampedModel):
    class Importance(models.TextChoices):
        REQUIRED = 'REQUIRED', 'Required'
        PREFERRED = 'PREFERRED', 'Preferred'
        NICE_TO_HAVE = 'NICE_TO_HAVE', 'Nice to Have'

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    opportunity = GenericForeignKey('content_type', 'object_id')
    
    skill = models.ForeignKey('skills.Skill', on_delete=models.CASCADE, related_name='opportunity_skills')
    importance = models.CharField(max_length=20, choices=Importance.choices, default=Importance.REQUIRED)
    min_proficiency = models.PositiveIntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])

    class Meta:
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['skill']),
        ]

    def __str__(self):
        return f"{self.skill} for {self.opportunity}"


class Application(TimeStampedModel):
    class Status(models.TextChoices):
        SAVED = 'SAVED', 'Saved'
        APPLIED = 'APPLIED', 'Applied'
        UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
        SHORTLISTED = 'SHORTLISTED', 'Shortlisted'
        INTERVIEW = 'INTERVIEW', 'Interview'
        SELECTED = 'SELECTED', 'Selected'
        REJECTED = 'REJECTED', 'Rejected'
        WITHDRAWN = 'WITHDRAWN', 'Withdrawn'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='job_applications')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    opportunity = GenericForeignKey('content_type', 'object_id')
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED, db_index=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    cover_letter = models.TextField(blank=True)
    resume_version = models.ForeignKey('resumes.ResumeVersion', on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    notes = models.TextField(blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['applied_at']),
        ]

    def __str__(self):
        return f"{self.student} application for {self.opportunity}"


class ApplicationStatusHistory(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='status_history')
    from_status = models.CharField(max_length=30)
    to_status = models.CharField(max_length=30)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-changed_at']

    def __str__(self):
        return f"{self.application} from {self.from_status} to {self.to_status}"


class StudentJobMatch(TimeStampedModel):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='job_matches')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    opportunity = GenericForeignKey('content_type', 'object_id')
    
    match_score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    skill_match_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    eligibility_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    experience_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    missing_skills = models.JSONField(default=list)
    strengths = models.JSONField(default=list)
    explanation = models.TextField(blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['student', 'match_score']),
            models.Index(fields=['content_type', 'object_id']),
        ]
        ordering = ['-match_score']

    def __str__(self):
        return f"Match {self.match_score}% for {self.student} on {self.opportunity}"
