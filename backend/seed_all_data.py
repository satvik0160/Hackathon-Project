import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "skillmaster.settings")
django.setup()

from learning.models import LearningResource
from jobs.models import JobListing
from assessments.models import SkillCategory

# Create or get categories
cat_react, _ = SkillCategory.objects.get_or_create(name="React", defaults={"description": "React.js Framework"})
cat_system, _ = SkillCategory.objects.get_or_create(name="System Design", defaults={"description": "Software Architecture"})

# Seed Learning Resources
if LearningResource.objects.count() == 0:
    LearningResource.objects.create(
        title="Complete React 19 Bootcamp",
        description="Master React 19 including server components and concurrent features.",
        resource_type="Course",
        url="https://react.dev/learn",
        is_free=True,
        difficulty_level="Beginner",
        skill_category=cat_react
    )
    LearningResource.objects.create(
        title="Advanced System Design for Interviews",
        description="Prepare for top tech companies with comprehensive system design architectures.",
        resource_type="Book",
        url="https://example.com/system-design",
        is_free=False,
        difficulty_level="Advanced",
        skill_category=cat_system
    )
    print("Seeded Learning Resources.")

# Seed Jobs
if JobListing.objects.count() == 0:
    JobListing.objects.create(
        title="Frontend React Developer",
        description="Looking for an experienced React developer to build interactive UIs.",
        company_name="Google",
        location="Remote",
        is_remote=True,
        job_type="Full-time",
        required_skills={"React": 70, "JavaScript": 80, "CSS": 60},
        min_salary=100000,
        max_salary=150000,
        apply_url="https://careers.google.com",
        is_active=True
    )
    JobListing.objects.create(
        title="Backend Software Engineer (Django)",
        description="Scale our Python/Django architecture to handle millions of users.",
        company_name="Stripe",
        location="San Francisco, CA",
        is_remote=False,
        job_type="Full-time",
        required_skills={"Python": 80, "Django": 70, "PostgreSQL": 60},
        min_salary=130000,
        max_salary=180000,
        apply_url="https://stripe.com/jobs",
        is_active=True
    )
    print("Seeded Jobs.")

print("Done seeding all sample elements!")
