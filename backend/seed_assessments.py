import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'devastra.settings')
django.setup()

from assessments.models import SkillCategory, Assessment, Question

# Create Category
cat, _ = SkillCategory.objects.get_or_create(
    name="Web Development", 
    defaults={"description": "Frontend and Backend skills"}
)

# Create Assessment
asm, _ = Assessment.objects.get_or_create(
    title="React Frontend Basics",
    defaults={
        "skill_category": cat,
        "difficulty_level": "medium",
        "time_limit_minutes": 10,
        "total_marks": 5
    }
)

# Create Questions
questions_data = [
    {
        "question_text": "What is the virtual DOM in React?",
        "question_type": "mcq",
        "option_a": "A direct copy of the actual DOM",
        "option_b": "A lightweight JavaScript representation of the DOM",
        "option_c": "A browser plugin for React",
        "option_d": "A database for UI elements",
        "correct_answer": "B",
        "marks": 1
    },
    {
        "question_text": "Which hook is used to manage state in a functional component?",
        "question_type": "mcq",
        "option_a": "useEffect",
        "option_b": "useContext",
        "option_c": "useState",
        "option_d": "useReducer",
        "correct_answer": "C",
        "marks": 1
    },
    {
        "question_text": "How do you pass data to a child component in React?",
        "question_type": "mcq",
        "option_a": "Using props",
        "option_b": "Using state",
        "option_c": "Using Redux only",
        "option_d": "Using HTTP requests",
        "correct_answer": "A",
        "marks": 1
    }
]

for q in questions_data:
    Question.objects.get_or_create(
        assessment=asm,
        question_text=q["question_text"],
        defaults=q
    )

print("Successfully seeded assessments!")
