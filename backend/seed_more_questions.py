import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'devastra.settings')
django.setup()

from assessments.models import Assessment, Question

asm = Assessment.objects.first()

extra_questions = [
    {
        "question_text": "What is the purpose of React Router?",
        "question_type": "mcq",
        "option_a": "To connect to a backend server",
        "option_b": "To style components",
        "option_c": "To handle navigation in a single-page app",
        "option_d": "To test React code",
        "correct_answer": "C",
        "marks": 1
    },
    {
        "question_text": "Which of the following is true about React state?",
        "question_type": "mcq",
        "option_a": "State is read-only",
        "option_b": "State can be mutated directly",
        "option_c": "State changes trigger re-renders",
        "option_d": "State is only available in class components",
        "correct_answer": "C",
        "marks": 1
    },
    {
        "question_text": "What does JSX stand for?",
        "question_type": "mcq",
        "option_a": "JavaScript XML",
        "option_b": "Java Syntax Extension",
        "option_c": "JSON XML",
        "option_d": "JavaScript eXtension",
        "correct_answer": "A",
        "marks": 1
    },
    {
        "question_text": "Which lifecycle method is equivalent to useEffect with an empty dependency array?",
        "question_type": "mcq",
        "option_a": "componentDidUpdate",
        "option_b": "componentWillUnmount",
        "option_c": "componentDidMount",
        "option_d": "shouldComponentUpdate",
        "correct_answer": "C",
        "marks": 1
    },
    {
        "question_text": "In React, what is a Higher-Order Component (HOC)?",
        "question_type": "mcq",
        "option_a": "A component that renders other components",
        "option_b": "A function that takes a component and returns a new component",
        "option_c": "A component with advanced styling",
        "option_d": "A component managed by Redux",
        "correct_answer": "B",
        "marks": 1
    },
    {
        "question_text": "What is the use of the useMemo hook?",
        "question_type": "mcq",
        "option_a": "To memoize expensive calculations",
        "option_b": "To memorize user inputs",
        "option_c": "To trigger side effects",
        "option_d": "To manage complex global state",
        "correct_answer": "A",
        "marks": 1
    },
    {
        "question_text": "How can you prevent a component from re-rendering in functional React?",
        "question_type": "mcq",
        "option_a": "By using shouldComponentUpdate",
        "option_b": "By wrapping it in React.memo",
        "option_c": "By using useEffect",
        "option_d": "By making state variables constants",
        "correct_answer": "B",
        "marks": 1
    }
]

for q in extra_questions:
    Question.objects.get_or_create(
        assessment=asm,
        question_text=q["question_text"],
        defaults=q
    )

print("Seeded 7 more questions! Total questions:", asm.questions.count())
