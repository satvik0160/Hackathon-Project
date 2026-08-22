import uuid
from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import TimeStampedModel, SoftDeleteModel


class IndustryPartner(TimeStampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='industry_profile')
    company = models.ForeignKey('jobs.Company', on_delete=models.SET_NULL, null=True, blank=True, related_name='partners')
    designation = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=200, blank=True)
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user} - {self.designation} at {self.company}"


class IndustrySkillRequirement(TimeStampedModel):
    class Importance(models.TextChoices):
        CRITICAL = 'CRITICAL', 'Critical'
        HIGH = 'HIGH', 'High'
        MEDIUM = 'MEDIUM', 'Medium'
        LOW = 'LOW', 'Low'

    company = models.ForeignKey('jobs.Company', on_delete=models.CASCADE, related_name='skill_requirements')
    role_title = models.CharField(max_length=200)
    skill = models.ForeignKey('skills.Skill', on_delete=models.CASCADE, related_name='industry_requirements')
    importance = models.CharField(max_length=20, choices=Importance.choices, default=Importance.HIGH)
    min_proficiency = models.PositiveIntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])

    class Meta:
        unique_together = ['company', 'role_title', 'skill']

    def __str__(self):
        return f"{self.skill} for {self.role_title} at {self.company}"


class IndustrySkillDemand(TimeStampedModel):
    skill = models.ForeignKey('skills.Skill', on_delete=models.CASCADE, related_name='demand_data')
    role = models.CharField(max_length=200, blank=True)
    industry_sector = models.CharField(max_length=200, blank=True)
    demand_score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    growth_rate = models.CharField(max_length=50, blank=True)
    source = models.CharField(max_length=200, blank=True)
    is_demo_data = models.BooleanField(default=True)
    snapshot_date = models.DateField(db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['skill', 'snapshot_date']),
            models.Index(fields=['industry_sector']),
        ]

    def __str__(self):
        return f"Demand for {self.skill} - {self.snapshot_date}"


class SkillDemandSnapshot(TimeStampedModel):
    class Trend(models.TextChoices):
        RISING = 'RISING', 'Rising'
        STABLE = 'STABLE', 'Stable'
        DECLINING = 'DECLINING', 'Declining'

    skill = models.ForeignKey('skills.Skill', on_delete=models.CASCADE, related_name='demand_snapshots')
    period = models.CharField(max_length=20)
    avg_demand_score = models.DecimalField(max_digits=5, decimal_places=2)
    trend = models.CharField(max_length=20, choices=Trend.choices, default=Trend.STABLE)
    top_roles = models.JSONField(default=list)
    top_industries = models.JSONField(default=list)

    class Meta:
        unique_together = ['skill', 'period']
        ordering = ['-period']

    def __str__(self):
        return f"{self.skill} snapshot {self.period}"


class IndustryProject(SoftDeleteModel):
    class ProjectType(models.TextChoices):
        CAPSTONE = 'CAPSTONE', 'Capstone'
        RESEARCH = 'RESEARCH', 'Research'
        DEVELOPMENT = 'DEVELOPMENT', 'Development'
        OPEN_SOURCE = 'OPEN_SOURCE', 'Open Source'
        HACKATHON = 'HACKATHON', 'Hackathon'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    company = models.ForeignKey('jobs.Company', on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True)
    description = models.TextField()
    project_type = models.CharField(max_length=20, choices=ProjectType.choices, default=ProjectType.DEVELOPMENT)
    duration_weeks = models.PositiveIntegerField(default=4)
    max_team_size = models.PositiveIntegerField(default=5)
    mentor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='mentored_projects')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN, db_index=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['company', 'status']),
        ]

    def __str__(self):
        return f"{self.title} at {self.company}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.company.name}-{self.title}") + '-' + str(uuid.uuid4())[:8]
        super().save(*args, **kwargs)


class ProjectSkill(models.Model):
    class Importance(models.TextChoices):
        REQUIRED = 'REQUIRED', 'Required'
        PREFERRED = 'PREFERRED', 'Preferred'
        NICE_TO_HAVE = 'NICE_TO_HAVE', 'Nice to Have'

    project = models.ForeignKey(IndustryProject, on_delete=models.CASCADE, related_name='required_skills')
    skill = models.ForeignKey('skills.Skill', on_delete=models.CASCADE, related_name='projects')
    importance = models.CharField(max_length=20, choices=Importance.choices, default=Importance.REQUIRED)

    class Meta:
        unique_together = ['project', 'skill']

    def __str__(self):
        return f"{self.skill} for {self.project}"


class ProjectApplication(TimeStampedModel):
    class Status(models.TextChoices):
        APPLIED = 'APPLIED', 'Applied'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'
        WITHDRAWN = 'WITHDRAWN', 'Withdrawn'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_applications')
    project = models.ForeignKey(IndustryProject, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED, db_index=True)
    motivation = models.TextField(blank=True)

    class Meta:
        unique_together = ['student', 'project']

    def __str__(self):
        return f"{self.student} application for {self.project}"


class ProjectTeam(models.Model):
    project = models.ForeignKey(IndustryProject, on_delete=models.CASCADE, related_name='teams')
    name = models.CharField(max_length=200)
    formed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Team {self.name} for {self.project}"


class ProjectMember(models.Model):
    team = models.ForeignKey(ProjectTeam, on_delete=models.CASCADE, related_name='members')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_memberships')
    role = models.CharField(max_length=100, default='Member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['team', 'student']

    def __str__(self):
        return f"{self.student} as {self.role} in {self.team}"


class ProjectEvaluation(TimeStampedModel):
    project = models.ForeignKey(IndustryProject, on_delete=models.CASCADE, related_name='evaluations')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_evaluations')
    evaluator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='given_project_evaluations')
    
    technical_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    problem_solving_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    communication_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    teamwork_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    professionalism_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    overall_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    feedback = models.TextField(blank=True)

    class Meta:
        unique_together = ['project', 'student', 'evaluator']

    def __str__(self):
        return f"Evaluation of {self.student} for {self.project}"


class IndustryFeedback(TimeStampedModel):
    class ContextType(models.TextChoices):
        INTERNSHIP = 'INTERNSHIP', 'Internship'
        PROJECT = 'PROJECT', 'Project'
        INTERVIEW = 'INTERVIEW', 'Interview'
        GENERAL = 'GENERAL', 'General'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='industry_feedback')
    company = models.ForeignKey('jobs.Company', on_delete=models.SET_NULL, null=True, blank=True, related_name='feedback_given')
    evaluator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='feedback_provided')
    context_type = models.CharField(max_length=20, choices=ContextType.choices, default=ContextType.GENERAL)
    context_id = models.PositiveIntegerField(null=True, blank=True)
    overall_rating = models.DecimalField(max_digits=3, decimal_places=1, validators=[MinValueValidator(0), MaxValueValidator(10)])
    feedback_text = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)

    def __str__(self):
        return f"Feedback for {self.student} from {self.company}"


class IndustryEvaluation(models.Model):
    feedback = models.ForeignKey(IndustryFeedback, on_delete=models.CASCADE, related_name='skill_evaluations')
    skill = models.ForeignKey('skills.Skill', on_delete=models.CASCADE, related_name='industry_evaluations')
    rating = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    comments = models.TextField(blank=True)

    class Meta:
        unique_together = ['feedback', 'skill']

    def __str__(self):
        return f"{self.skill} rating in {self.feedback}"
