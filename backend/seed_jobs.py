import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "skillmaster.settings")
django.setup()

from jobs.models import JobListing, Company

if JobListing.objects.count() == 0:
    comp_google, _ = Company.objects.get_or_create(name="Google", defaults={"location": "Remote", "industry": "Tech"})
    JobListing.objects.create(
        title="Frontend React Developer",
        description="Looking for an experienced React developer to build interactive UIs.",
        company=comp_google,
        location="Remote",
        is_remote=True,
        job_type="full-time",
        required_skills=["React", "JavaScript", "CSS"],
        salary_range="$100k - $150k",
        application_url="https://careers.google.com",
        is_active=True
    )
    print("Seeded Jobs.")
