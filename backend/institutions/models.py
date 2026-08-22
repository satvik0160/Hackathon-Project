from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

from core.models import TimeStampedModel, SoftDeleteModel


class Institution(SoftDeleteModel):
    class InstitutionType(models.TextChoices):
        UNIVERSITY = 'UNIVERSITY', 'University'
        COLLEGE = 'COLLEGE', 'College'
        IIT = 'IIT', 'IIT'
        NIT = 'NIT', 'NIT'
        IIIT = 'IIIT', 'IIIT'
        PRIVATE = 'PRIVATE', 'Private'
        DEEMED = 'DEEMED', 'Deemed'
        AUTONOMOUS = 'AUTONOMOUS', 'Autonomous'
        OTHER = 'OTHER', 'Other'

    name = models.CharField(max_length=300, db_index=True)
    code = models.CharField(max_length=20, unique=True, blank=True)
    institution_type = models.CharField(
        max_length=50, choices=InstitutionType.choices, default=InstitutionType.COLLEGE
    )
    location = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True, db_index=True)
    state = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    logo_url = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    accreditation = models.CharField(max_length=100, blank=True)
    established_year = models.PositiveIntegerField(null=True, blank=True)
    total_students = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Department(TimeStampedModel):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, blank=True)
    hod = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_departments'
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['institution', 'name']

    def __str__(self):
        return f"{self.name} - {self.institution.name}"


class Course(TimeStampedModel):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='courses')
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, db_index=True)
    semester = models.PositiveSmallIntegerField(null=True, blank=True)
    credits = models.PositiveSmallIntegerField(default=3)
    description = models.TextField(blank=True)
    syllabus_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['department', 'code']

    def __str__(self):
        return f"{self.code} - {self.name}"


class CourseSkill(models.Model):
    class CoverageLevel(models.TextChoices):
        INTRODUCTORY = 'INTRODUCTORY', 'Introductory'
        BASIC = 'BASIC', 'Basic'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        ADVANCED = 'ADVANCED', 'Advanced'

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='skills_taught')
    skill = models.ForeignKey('skills.Skill', on_delete=models.CASCADE, related_name='courses')
    coverage_level = models.CharField(max_length=50, choices=CoverageLevel.choices, default=CoverageLevel.BASIC)
    hours_allocated = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ['course', 'skill']

    def __str__(self):
        return f"{self.skill.name} in {self.course.code}"


class CurriculumVersion(TimeStampedModel):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='curriculum_versions')
    version = models.CharField(max_length=20)
    academic_year = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
    total_courses = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ['department', 'version']

    def __str__(self):
        return f"{self.department} - v{self.version}"


class CurriculumSkillGap(TimeStampedModel):
    curriculum_version = models.ForeignKey(CurriculumVersion, on_delete=models.CASCADE, related_name='skill_gaps')
    skill = models.ForeignKey('skills.Skill', on_delete=models.CASCADE, related_name='curriculum_gaps')
    industry_requirement_score = models.DecimalField(
        max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    curriculum_coverage_score = models.DecimalField(
        max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    gap_score = models.DecimalField(max_digits=5, decimal_places=2)
    recommendation = models.TextField(blank=True)

    class Meta:
        unique_together = ['curriculum_version', 'skill']
        ordering = ['-gap_score']

    def __str__(self):
        return f"Gap: {self.skill.name} in {self.curriculum_version}"


class IndustryCurriculumAlignment(TimeStampedModel):
    curriculum_version = models.ForeignKey(CurriculumVersion, on_delete=models.CASCADE, related_name='industry_alignments')
    industry_sector = models.CharField(max_length=100)
    alignment_score = models.DecimalField(
        max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    analysis = models.JSONField(default=dict, blank=True)
    recommendations = models.JSONField(default=list, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['curriculum_version', 'industry_sector']

    def __str__(self):
        return f"Alignment: {self.curriculum_version} for {self.industry_sector}"
