import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "skillmaster.settings")
django.setup()

from assessments.models import SkillCategory, Assessment, Question

cat, _ = SkillCategory.objects.get_or_create(name="Web Development", defaults={"description": "Frontend & Backend"})

if Assessment.objects.count() == 0:
    a1 = Assessment.objects.create(
        title="React Intermediate Assessment",
        description="Test your knowledge of React hooks, context, and performance optimization.",
        category=cat,
        difficulty_level="medium",
        time_limit_minutes=15,
        total_points=100,
        passing_score_percentage=70,
        is_active=True
    )
    
    a2 = Assessment.objects.create(
        title="JavaScript Basics",
        description="Fundamental concepts of JS, closures, promises, and the event loop.",
        category=cat,
        difficulty_level="easy",
        time_limit_minutes=10,
        total_points=50,
        passing_score_percentage=60,
        is_active=True
    )

    Question.objects.create(
        assessment=a1,
        question_text="What does useEffect do?",
        question_type="multiple_choice",
        option_a="Handles DOM mutations directly",
        option_b="Performs side effects in function components",
        option_c="Replaces Redux",
        option_d="None of the above",
        correct_answer="option_b",
        points=50
    )
    
    print("Seeded Assessments.")
else:
    print("Assessments already exist.")
