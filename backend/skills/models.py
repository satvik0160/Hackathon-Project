from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

from core.models import TimeStampedModel


class SkillCategory(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True, db_index=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    parent_category = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subcategories'
    )
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Skill Categories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Skill(TimeStampedModel):
    class DifficultyLevel(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        ADVANCED = 'ADVANCED', 'Advanced'
        EXPERT = 'EXPERT', 'Expert'

    name = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=200, unique=True)
    category = models.ForeignKey(
        SkillCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='skills'
    )
    parent_skill = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='sub_skills'
    )
    description = models.TextField(blank=True)
    difficulty_level = models.CharField(
        max_length=20, choices=DifficultyLevel.choices, default=DifficultyLevel.BEGINNER
    )
    aliases = models.JSONField(default=list, blank=True)
    is_technical = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['name', 'category']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['parent_skill']),
            models.Index(fields=['difficulty_level']),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class SkillRelationship(TimeStampedModel):
    class RelationshipType(models.TextChoices):
        PREREQUISITE = 'PREREQUISITE', 'Prerequisite'
        RELATED = 'RELATED', 'Related'
        COMPLEMENTARY = 'COMPLEMENTARY', 'Complementary'
        ADVANCED_VERSION = 'ADVANCED_VERSION', 'Advanced Version'

    from_skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='outgoing_relationships')
    to_skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='incoming_relationships')
    relationship_type = models.CharField(max_length=50, choices=RelationshipType.choices, db_index=True)
    strength = models.DecimalField(
        max_digits=3, decimal_places=2, default=1.0, validators=[MinValueValidator(0), MaxValueValidator(1)]
    )

    class Meta:
        unique_together = ['from_skill', 'to_skill', 'relationship_type']
        constraints = [
            models.CheckConstraint(
                condition=~models.Q(from_skill=models.F('to_skill')),
                name='from_skill_not_equal_to_skill'
            )
        ]

    def __str__(self):
        return f"{self.from_skill} -> {self.relationship_type} -> {self.to_skill}"


class CareerRole(TimeStampedModel):
    class DemandLevel(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        VERY_HIGH = 'VERY_HIGH', 'Very High'

    name = models.CharField(max_length=200, unique=True, db_index=True)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    avg_salary_range = models.CharField(max_length=100, blank=True)
    growth_rate = models.CharField(max_length=50, blank=True)
    demand_level = models.CharField(max_length=20, choices=DemandLevel.choices, default=DemandLevel.MEDIUM)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class CareerRoleSkill(models.Model):
    class Importance(models.TextChoices):
        REQUIRED = 'REQUIRED', 'Required'
        PREFERRED = 'PREFERRED', 'Preferred'
        NICE_TO_HAVE = 'NICE_TO_HAVE', 'Nice to Have'

    career_role = models.ForeignKey(CareerRole, on_delete=models.CASCADE, related_name='required_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='career_roles')
    importance = models.CharField(max_length=20, choices=Importance.choices, default=Importance.REQUIRED)
    minimum_proficiency = models.PositiveIntegerField(
        default=50, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    weight = models.DecimalField(
        max_digits=3, decimal_places=2, default=1.0, validators=[MinValueValidator(0), MaxValueValidator(1)]
    )

    class Meta:
        unique_together = ['career_role', 'skill']
        ordering = ['-weight']

    def __str__(self):
        return f"{self.career_role} - {self.skill}"


class StudentSkill(TimeStampedModel):
    class Status(models.TextChoices):
        NOT_STARTED = 'NOT_STARTED', 'Not Started'
        SELF_DECLARED = 'SELF_DECLARED', 'Self Declared'
        DEVELOPING = 'DEVELOPING', 'Developing'
        STRONG = 'STRONG', 'Strong'
        VERIFIED = 'VERIFIED', 'Verified'
        MASTERED = 'MASTERED', 'Mastered'

    class Source(models.TextChoices):
        SELF_DECLARED = 'SELF_DECLARED', 'Self Declared'
        ASSESSMENT = 'ASSESSMENT', 'Assessment'
        TEST = 'TEST', 'Test'
        PROJECT = 'PROJECT', 'Project'
        CERTIFICATION = 'CERTIFICATION', 'Certification'
        INDUSTRY_FEEDBACK = 'INDUSTRY_FEEDBACK', 'Industry Feedback'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='student_skills')
    proficiency_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    target_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=80, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    confidence_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.NOT_STARTED, db_index=True)
    source = models.CharField(max_length=50, choices=Source.choices, default=Source.SELF_DECLARED)
    last_assessed_at = models.DateTimeField(null=True, blank=True)
    evidence_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ['student', 'skill']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['skill', 'proficiency_score']),
        ]

    def __str__(self):
        return f"{self.student} - {self.skill}"


class SkillEvidence(TimeStampedModel):
    class EvidenceType(models.TextChoices):
        ASSESSMENT = 'ASSESSMENT', 'Assessment'
        TEST = 'TEST', 'Test'
        PROJECT = 'PROJECT', 'Project'
        CERTIFICATION = 'CERTIFICATION', 'Certification'
        INTERNSHIP = 'INTERNSHIP', 'Internship'
        INDUSTRY_FEEDBACK = 'INDUSTRY_FEEDBACK', 'Industry Feedback'
        INTERVIEW = 'INTERVIEW', 'Interview'
        PRACTICAL_TASK = 'PRACTICAL_TASK', 'Practical Task'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='skill_evidence')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='evidence')
    evidence_type = models.CharField(max_length=50, choices=EvidenceType.choices, db_index=True)
    
    content_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    title = models.CharField(max_length=255, blank=True)
    score = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    confidence = models.DecimalField(
        max_digits=3, decimal_places=2, default=0.5, validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_evidence'
    )
    is_verified = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', 'skill']),
            models.Index(fields=['evidence_type']),
            models.Index(fields=['student', 'evidence_type']),
        ]

    def __str__(self):
        return f"Evidence for {self.student} on {self.skill}"
