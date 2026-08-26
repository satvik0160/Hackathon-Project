"""
DevAstra — Database Seed Command
========================================
Run with: python manage.py seed_data

Populates the database with:
  - 6 Skill Categories
  - 6 Assessments with 15+ quiz questions
  - 18 Learning Resources (free & paid from real platforms)
  - 10 Companies with 10 Job/Internship listings
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from assessments.models import SkillCategory, Assessment, Question
from learning.models import LearningResource
from jobs.models import Company, JobListing


class Command(BaseCommand):
    help = 'Seeds the database with sample data for DevAstra'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('\n🌱 Seeding DevAstra database...\n'))

        self._seed_categories()
        self._seed_assessments_and_questions()
        self._seed_learning_resources()
        self._seed_companies_and_jobs()

        self.stdout.write(self.style.SUCCESS('\n✅ Database seeded successfully!\n'))
        self._print_summary()

    # ──────────────────────────────────────────────────────────────────────
    # SKILL CATEGORIES
    # ──────────────────────────────────────────────────────────────────────
    def _seed_categories(self):
        categories = [
            {'name': 'Python Programming', 'description': 'Core Python, OOP, data structures, and scripting'},
            {'name': 'JavaScript & Web Dev', 'description': 'JavaScript, React, Node.js, and modern web development'},
            {'name': 'Data Science & AI', 'description': 'Machine learning, data analysis, pandas, and AI fundamentals'},
            {'name': 'Cloud & DevOps', 'description': 'AWS, Docker, Kubernetes, CI/CD, and cloud architecture'},
            {'name': 'Backend Development', 'description': 'Django, APIs, databases, authentication, and server-side logic'},
            {'name': 'Cybersecurity', 'description': 'Web security, ethical hacking, OWASP, and secure coding'},
        ]
        for cat in categories:
            SkillCategory.objects.get_or_create(name=cat['name'], defaults=cat)
        self.stdout.write(f'  📂 Created {len(categories)} skill categories')

    # ──────────────────────────────────────────────────────────────────────
    # ASSESSMENTS & QUIZ QUESTIONS
    # ──────────────────────────────────────────────────────────────────────
    def _seed_assessments_and_questions(self):
        python_cat = SkillCategory.objects.get(name='Python Programming')
        js_cat = SkillCategory.objects.get(name='JavaScript & Web Dev')
        ds_cat = SkillCategory.objects.get(name='Data Science & AI')
        cloud_cat = SkillCategory.objects.get(name='Cloud & DevOps')
        backend_cat = SkillCategory.objects.get(name='Backend Development')
        security_cat = SkillCategory.objects.get(name='Cybersecurity')

        # ── Assessment 1: Python ──
        python_assessment, _ = Assessment.objects.get_or_create(
            title='Python Fundamentals',
            defaults={
                'description': 'Test your core Python knowledge — variables, loops, functions, OOP, and data structures.',
                'skill_category': python_cat,
                'difficulty_level': 'medium',
                'time_limit_minutes': 20,
                'total_marks': 5,
            }
        )
        python_questions = [
            {
                'question_text': 'What is the output of: print(type([]) is list)?',
                'option_a': 'True',
                'option_b': 'False',
                'option_c': 'TypeError',
                'option_d': 'None',
                'correct_answer': 'A',
                'explanation': 'The type() function returns the type of an object. Since [] is a list, type([]) is list evaluates to True.',
            },
            {
                'question_text': 'Which of the following is used to create a generator in Python?',
                'option_a': 'return statement',
                'option_b': 'yield statement',
                'option_c': 'generate keyword',
                'option_d': 'async keyword',
                'correct_answer': 'B',
                'explanation': 'The yield statement is used in a function to make it a generator function, which returns values lazily one at a time.',
            },
            {
                'question_text': 'What does the __init__ method do in a Python class?',
                'option_a': 'Deletes the object',
                'option_b': 'Returns the string representation',
                'option_c': 'Initializes the object when created',
                'option_d': 'Makes the class iterable',
                'correct_answer': 'C',
                'explanation': '__init__ is the constructor method that is automatically called when a new instance of a class is created.',
            },
            {
                'question_text': 'What is the output of: print("hello"[1:3])?',
                'option_a': 'he',
                'option_b': 'el',
                'option_c': 'ell',
                'option_d': 'llo',
                'correct_answer': 'B',
                'explanation': 'String slicing [1:3] extracts characters at index 1 and 2 (not including 3), which gives "el".',
            },
            {
                'question_text': 'Which data structure in Python does NOT allow duplicate values?',
                'option_a': 'List',
                'option_b': 'Tuple',
                'option_c': 'Set',
                'option_d': 'Dictionary keys (yes, but also Set)',
                'correct_answer': 'C',
                'explanation': 'Sets in Python automatically remove duplicate values. Lists and tuples can contain duplicates.',
            },
        ]
        for q in python_questions:
            Question.objects.get_or_create(
                assessment=python_assessment,
                question_text=q['question_text'],
                defaults=q,
            )

        # ── Assessment 2: JavaScript ──
        js_assessment, _ = Assessment.objects.get_or_create(
            title='JavaScript Essentials',
            defaults={
                'description': 'Test your JavaScript skills — ES6+, async/await, DOM manipulation, and closures.',
                'skill_category': js_cat,
                'difficulty_level': 'medium',
                'time_limit_minutes': 25,
                'total_marks': 5,
            }
        )
        js_questions = [
            {
                'question_text': 'What is the difference between "==" and "===" in JavaScript?',
                'option_a': 'No difference',
                'option_b': '"==" checks value only, "===" checks value and type',
                'option_c': '"===" checks value only, "==" checks value and type',
                'option_d': '"==" is for strings, "===" is for numbers',
                'correct_answer': 'B',
                'explanation': '"==" performs type coercion before comparison, while "===" (strict equality) checks both value and type without coercion.',
            },
            {
                'question_text': 'What does "async/await" do in JavaScript?',
                'option_a': 'Makes code run faster',
                'option_b': 'Allows writing asynchronous code in a synchronous style',
                'option_c': 'Creates new threads',
                'option_d': 'Blocks the event loop',
                'correct_answer': 'B',
                'explanation': 'async/await is syntactic sugar over Promises that lets you write asynchronous code that looks and behaves like synchronous code.',
            },
            {
                'question_text': 'What is a closure in JavaScript?',
                'option_a': 'A function that closes the browser',
                'option_b': 'A function that has access to its outer scope even after the outer function has returned',
                'option_c': 'A way to end a loop',
                'option_d': 'A type of error handling',
                'correct_answer': 'B',
                'explanation': 'A closure is a function that remembers and can access variables from its outer (enclosing) scope even after the outer function has finished executing.',
            },
        ]
        for q in js_questions:
            Question.objects.get_or_create(
                assessment=js_assessment,
                question_text=q['question_text'],
                defaults=q,
            )

        # ── Assessment 3: Data Science ──
        ds_assessment, _ = Assessment.objects.get_or_create(
            title='Data Science Basics',
            defaults={
                'description': 'Test your knowledge of pandas, NumPy, statistics, and machine learning fundamentals.',
                'skill_category': ds_cat,
                'difficulty_level': 'hard',
                'time_limit_minutes': 30,
                'total_marks': 4,
            }
        )
        ds_questions = [
            {
                'question_text': 'In supervised learning, what is the difference between classification and regression?',
                'option_a': 'Classification predicts continuous values, regression predicts categories',
                'option_b': 'Classification predicts categories, regression predicts continuous values',
                'option_c': 'They are the same thing',
                'option_d': 'Classification uses unsupervised data',
                'correct_answer': 'B',
                'explanation': 'Classification predicts discrete class labels (e.g., spam/not spam), while regression predicts continuous numerical values (e.g., house price).',
            },
            {
                'question_text': 'Which pandas function is used to read a CSV file?',
                'option_a': 'pd.load_csv()',
                'option_b': 'pd.read_csv()',
                'option_c': 'pd.open_csv()',
                'option_d': 'pd.import_csv()',
                'correct_answer': 'B',
                'explanation': 'pd.read_csv() is the standard pandas function to read comma-separated value files into a DataFrame.',
            },
            {
                'question_text': 'What does overfitting mean in machine learning?',
                'option_a': 'The model performs well on both training and test data',
                'option_b': 'The model is too simple to capture patterns',
                'option_c': 'The model memorizes training data and performs poorly on unseen data',
                'option_d': 'The model has too few parameters',
                'correct_answer': 'C',
                'explanation': 'Overfitting occurs when a model learns the noise in training data rather than the actual pattern, leading to poor generalization on new data.',
            },
            {
                'question_text': 'What is the purpose of train_test_split in scikit-learn?',
                'option_a': 'To combine two datasets',
                'option_b': 'To split data into training and testing sets for model evaluation',
                'option_c': 'To clean missing values',
                'option_d': 'To normalize the data',
                'correct_answer': 'B',
                'explanation': 'train_test_split divides the dataset into separate training and testing subsets to evaluate how well the model generalizes to unseen data.',
            },
        ]
        for q in ds_questions:
            Question.objects.get_or_create(
                assessment=ds_assessment,
                question_text=q['question_text'],
                defaults=q,
            )

        # ── Assessment 4: Cloud & DevOps ──
        cloud_assessment, _ = Assessment.objects.get_or_create(
            title='Cloud & DevOps Foundations',
            defaults={
                'description': 'Test your understanding of Docker, CI/CD pipelines, cloud platforms, and infrastructure.',
                'skill_category': cloud_cat,
                'difficulty_level': 'hard',
                'time_limit_minutes': 25,
                'total_marks': 3,
            }
        )
        cloud_questions = [
            {
                'question_text': 'What is Docker primarily used for?',
                'option_a': 'Version control',
                'option_b': 'Containerizing applications for consistent deployment across environments',
                'option_c': 'Writing unit tests',
                'option_d': 'Database management',
                'correct_answer': 'B',
                'explanation': 'Docker packages applications and their dependencies into lightweight containers that run consistently across different environments.',
            },
            {
                'question_text': 'What does CI/CD stand for?',
                'option_a': 'Code Integration / Code Deployment',
                'option_b': 'Continuous Integration / Continuous Delivery (or Deployment)',
                'option_c': 'Central Infrastructure / Central Data',
                'option_d': 'Cloud Interface / Cloud Distribution',
                'correct_answer': 'B',
                'explanation': 'CI/CD stands for Continuous Integration (automatically building/testing code) and Continuous Delivery/Deployment (automatically releasing to production).',
            },
            {
                'question_text': 'Which of the following is NOT a major cloud provider?',
                'option_a': 'AWS (Amazon)',
                'option_b': 'Google Cloud Platform',
                'option_c': 'Microsoft Azure',
                'option_d': 'GitHub Cloud',
                'correct_answer': 'D',
                'explanation': 'AWS, GCP, and Azure are the three major cloud providers. GitHub is a code hosting platform, not a cloud infrastructure provider.',
            },
        ]
        for q in cloud_questions:
            Question.objects.get_or_create(
                assessment=cloud_assessment,
                question_text=q['question_text'],
                defaults=q,
            )

        total_q = Question.objects.count()
        total_a = Assessment.objects.count()
        self.stdout.write(f'  📝 Created {total_a} assessments with {total_q} questions')

    # ──────────────────────────────────────────────────────────────────────
    # LEARNING RESOURCES (Real platforms, real URLs)
    # ──────────────────────────────────────────────────────────────────────
    def _seed_learning_resources(self):
        python_cat = SkillCategory.objects.get(name='Python Programming')
        js_cat = SkillCategory.objects.get(name='JavaScript & Web Dev')
        ds_cat = SkillCategory.objects.get(name='Data Science & AI')
        cloud_cat = SkillCategory.objects.get(name='Cloud & DevOps')
        backend_cat = SkillCategory.objects.get(name='Backend Development')
        security_cat = SkillCategory.objects.get(name='Cybersecurity')

        resources = [
            # ── Python ──
            {
                'title': 'Python for Everybody (Full Course)',
                'description': 'Dr. Chuck\'s famous beginner-friendly Python course covering variables, loops, functions, data structures, and web scraping.',
                'resource_type': 'course',
                'url': 'https://www.freecodecamp.org/learn/scientific-computing-with-python/',
                'skill_category': python_cat,
                'difficulty_level': 'beginner',
                'estimated_duration_minutes': 840,
                'is_free': True,
            },
            {
                'title': 'Automate the Boring Stuff with Python',
                'description': 'Learn practical Python automation — work with files, PDFs, spreadsheets, emails, and web scraping.',
                'resource_type': 'course',
                'url': 'https://www.udemy.com/course/automate/',
                'skill_category': python_cat,
                'difficulty_level': 'beginner',
                'estimated_duration_minutes': 540,
                'is_free': False,
            },
            {
                'title': 'Python OOP - Corey Schafer (YouTube)',
                'description': 'Clear, practical tutorial series on Python Object-Oriented Programming by one of YouTube\'s best Python instructors.',
                'resource_type': 'video',
                'url': 'https://www.youtube.com/playlist?list=PL-osiE80TeTsqhIuOqKhwlXsIBIdSeYtc',
                'skill_category': python_cat,
                'difficulty_level': 'intermediate',
                'estimated_duration_minutes': 120,
                'is_free': True,
            },

            # ── JavaScript & Web Dev ──
            {
                'title': 'JavaScript Algorithms and Data Structures (freeCodeCamp)',
                'description': 'Interactive coding challenges covering ES6, regex, debugging, OOP, and functional programming in JavaScript.',
                'resource_type': 'course',
                'url': 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/',
                'skill_category': js_cat,
                'difficulty_level': 'beginner',
                'estimated_duration_minutes': 1800,
                'is_free': True,
            },
            {
                'title': 'React - The Complete Guide (Udemy)',
                'description': 'Maximilian Schwarzmüller\'s bestselling React course — hooks, Redux, Next.js, and full-stack React apps.',
                'resource_type': 'course',
                'url': 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
                'skill_category': js_cat,
                'difficulty_level': 'intermediate',
                'estimated_duration_minutes': 2880,
                'is_free': False,
            },
            {
                'title': 'Traversy Media - JavaScript Crash Course (YouTube)',
                'description': 'Brad Traversy\'s fast-paced crash course covering modern JavaScript fundamentals in under 2 hours.',
                'resource_type': 'video',
                'url': 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
                'skill_category': js_cat,
                'difficulty_level': 'beginner',
                'estimated_duration_minutes': 100,
                'is_free': True,
            },

            # ── Data Science & AI ──
            {
                'title': 'Machine Learning by Andrew Ng (Coursera)',
                'description': 'The legendary ML course by Andrew Ng — supervised/unsupervised learning, neural networks, and practical advice.',
                'resource_type': 'course',
                'url': 'https://www.coursera.org/learn/machine-learning',
                'skill_category': ds_cat,
                'difficulty_level': 'intermediate',
                'estimated_duration_minutes': 3600,
                'is_free': False,
            },
            {
                'title': 'Kaggle Learn - Intro to Machine Learning',
                'description': 'Free, hands-on micro-course with real datasets. Build your first ML model in a few hours.',
                'resource_type': 'course',
                'url': 'https://www.kaggle.com/learn/intro-to-machine-learning',
                'skill_category': ds_cat,
                'difficulty_level': 'beginner',
                'estimated_duration_minutes': 180,
                'is_free': True,
            },
            {
                'title': 'Sentdex - Python for Data Analysis (YouTube)',
                'description': 'Step-by-step tutorials on pandas, matplotlib, and data visualization with Python.',
                'resource_type': 'video',
                'url': 'https://www.youtube.com/playlist?list=PLQVvvaa0QuDfSfqQuee6K8opKtZsh7sA9',
                'skill_category': ds_cat,
                'difficulty_level': 'beginner',
                'estimated_duration_minutes': 300,
                'is_free': True,
            },
            {
                'title': 'Deep Learning Specialization (Coursera)',
                'description': 'Andrew Ng\'s 5-course specialization — neural networks, CNNs, RNNs, transformers, and real-world AI projects.',
                'resource_type': 'course',
                'url': 'https://www.coursera.org/specializations/deep-learning',
                'skill_category': ds_cat,
                'difficulty_level': 'advanced',
                'estimated_duration_minutes': 4800,
                'is_free': False,
            },

            # ── Cloud & DevOps ──
            {
                'title': 'Docker for Beginners - TechWorld with Nana (YouTube)',
                'description': 'Nana\'s beginner-friendly Docker tutorial covering containers, images, Docker Compose, and deployment.',
                'resource_type': 'video',
                'url': 'https://www.youtube.com/watch?v=3c-iBn73dDE',
                'skill_category': cloud_cat,
                'difficulty_level': 'beginner',
                'estimated_duration_minutes': 180,
                'is_free': True,
            },
            {
                'title': 'AWS Cloud Practitioner Essentials (AWS)',
                'description': 'Official AWS free course covering cloud concepts, core services, security, and pricing. Great for beginners.',
                'resource_type': 'course',
                'url': 'https://aws.amazon.com/training/learn-about/cloud-practitioner/',
                'skill_category': cloud_cat,
                'difficulty_level': 'beginner',
                'estimated_duration_minutes': 360,
                'is_free': True,
            },
            {
                'title': 'Kubernetes Tutorial for Beginners (Udemy)',
                'description': 'Learn Kubernetes orchestration — pods, services, deployments, and managing containerized apps at scale.',
                'resource_type': 'course',
                'url': 'https://www.udemy.com/course/learn-kubernetes/',
                'skill_category': cloud_cat,
                'difficulty_level': 'intermediate',
                'estimated_duration_minutes': 480,
                'is_free': False,
            },

            # ── Backend Development ──
            {
                'title': 'Django for Beginners - William Vincent',
                'description': 'Build 4 progressively complex web apps with Django. Covers templates, databases, authentication, and deployment.',
                'resource_type': 'article',
                'url': 'https://djangoforbeginners.com/',
                'skill_category': backend_cat,
                'difficulty_level': 'beginner',
                'estimated_duration_minutes': 600,
                'is_free': False,
            },
            {
                'title': 'Django REST Framework Official Tutorial',
                'description': 'Official DRF tutorial — serializers, views, authentication, and building production-ready REST APIs.',
                'resource_type': 'documentation',
                'url': 'https://www.django-rest-framework.org/tutorial/quickstart/',
                'skill_category': backend_cat,
                'difficulty_level': 'intermediate',
                'estimated_duration_minutes': 240,
                'is_free': True,
            },
            {
                'title': 'CS50\'s Web Programming with Python and JavaScript (Harvard)',
                'description': 'Harvard\'s free web development course — Django, SQL, JavaScript, React, testing, and scalability.',
                'resource_type': 'course',
                'url': 'https://cs50.harvard.edu/web/',
                'skill_category': backend_cat,
                'difficulty_level': 'intermediate',
                'estimated_duration_minutes': 2400,
                'is_free': True,
            },

            # ── Cybersecurity ──
            {
                'title': 'OWASP Top 10 - Web Security Basics',
                'description': 'Learn the top 10 most critical web application security risks and how to prevent them.',
                'resource_type': 'documentation',
                'url': 'https://owasp.org/www-project-top-ten/',
                'skill_category': security_cat,
                'difficulty_level': 'intermediate',
                'estimated_duration_minutes': 120,
                'is_free': True,
            },
            {
                'title': 'TryHackMe - Complete Beginner Path',
                'description': 'Hands-on cybersecurity labs — Linux, networking, web hacking, and cryptography in a gamified environment.',
                'resource_type': 'course',
                'url': 'https://tryhackme.com/path/outline/beginner',
                'skill_category': security_cat,
                'difficulty_level': 'beginner',
                'estimated_duration_minutes': 2400,
                'is_free': True,
            },
        ]

        for res in resources:
            LearningResource.objects.get_or_create(
                title=res['title'],
                defaults=res,
            )
        self.stdout.write(f'  📚 Created {len(resources)} learning resources')

    # ──────────────────────────────────────────────────────────────────────
    # COMPANIES & JOB LISTINGS
    # ──────────────────────────────────────────────────────────────────────
    def _seed_companies_and_jobs(self):
        companies_and_jobs = [
            {
                'company': {
                    'name': 'Google',
                    'description': 'A multinational technology company specializing in search, cloud computing, and AI.',
                    'website': 'https://careers.google.com',
                    'location': 'Bangalore, India',
                    'industry': 'Technology',
                },
                'job': {
                    'title': 'Software Engineering Intern (STEP)',
                    'description': 'Join Google\'s STEP internship program. Work on real products used by billions. Mentorship from senior engineers.',
                    'job_type': 'internship',
                    'location': 'Bangalore, India',
                    'is_remote': False,
                    'required_skills': ['Python', 'Data Structures', 'Algorithms', 'Problem Solving'],
                    'min_experience_level': 'beginner',
                    'salary_range': '₹80,000 - ₹1,00,000/month',
                },
            },
            {
                'company': {
                    'name': 'Razorpay',
                    'description': 'India\'s leading fintech company providing payment gateway solutions for businesses.',
                    'website': 'https://razorpay.com/jobs',
                    'location': 'Bangalore, India',
                    'industry': 'Fintech',
                },
                'job': {
                    'title': 'Backend Developer Intern',
                    'description': 'Build scalable payment APIs handling millions of transactions. Work with Django, PostgreSQL, and microservices.',
                    'job_type': 'internship',
                    'location': 'Bangalore, India',
                    'is_remote': True,
                    'required_skills': ['Python', 'Django', 'SQL', 'REST APIs', 'Git'],
                    'min_experience_level': 'beginner',
                    'salary_range': '₹25,000 - ₹40,000/month',
                },
            },
            {
                'company': {
                    'name': 'Zomato',
                    'description': 'India\'s largest food delivery and restaurant discovery platform.',
                    'website': 'https://www.zomato.com/careers',
                    'location': 'Gurugram, India',
                    'industry': 'Food Tech',
                },
                'job': {
                    'title': 'Frontend Developer Intern',
                    'description': 'Build beautiful, responsive UIs for Zomato\'s web app used by millions. React, TypeScript, and CSS.',
                    'job_type': 'internship',
                    'location': 'Gurugram, India',
                    'is_remote': True,
                    'required_skills': ['JavaScript', 'React', 'HTML/CSS', 'TypeScript', 'Git'],
                    'min_experience_level': 'beginner',
                    'salary_range': '₹20,000 - ₹35,000/month',
                },
            },
            {
                'company': {
                    'name': 'Amazon',
                    'description': 'Global technology and e-commerce company with AWS, Alexa, and Prime services.',
                    'website': 'https://www.amazon.jobs',
                    'location': 'Hyderabad, India',
                    'industry': 'Technology / E-commerce',
                },
                'job': {
                    'title': 'Data Science Intern',
                    'description': 'Analyze customer behavior data at massive scale. Build ML models for product recommendations and demand forecasting.',
                    'job_type': 'internship',
                    'location': 'Hyderabad, India',
                    'is_remote': False,
                    'required_skills': ['Python', 'Machine Learning', 'SQL', 'Pandas', 'Statistics'],
                    'min_experience_level': 'intermediate',
                    'salary_range': '₹60,000 - ₹80,000/month',
                },
            },
            {
                'company': {
                    'name': 'Flipkart',
                    'description': 'India\'s leading e-commerce marketplace, a Walmart company.',
                    'website': 'https://www.flipkart.com/careers',
                    'location': 'Bangalore, India',
                    'industry': 'E-commerce',
                },
                'job': {
                    'title': 'Full Stack Developer (Junior)',
                    'description': 'Build end-to-end features for Flipkart\'s marketplace. React frontend + Node.js/Java backend. High-traffic systems.',
                    'job_type': 'full-time',
                    'location': 'Bangalore, India',
                    'is_remote': False,
                    'required_skills': ['JavaScript', 'React', 'Node.js', 'SQL', 'System Design'],
                    'min_experience_level': 'intermediate',
                    'salary_range': '₹8,00,000 - ₹15,00,000/year',
                },
            },
            {
                'company': {
                    'name': 'Infosys',
                    'description': 'Global IT services and consulting company headquartered in Bangalore.',
                    'website': 'https://www.infosys.com/careers',
                    'location': 'Mysuru, India',
                    'industry': 'IT Services',
                },
                'job': {
                    'title': 'Cloud DevOps Engineer (Fresher)',
                    'description': 'Join Infosys\' cloud practice. Deploy and manage applications on AWS/Azure. CI/CD pipelines with Jenkins and Docker.',
                    'job_type': 'full-time',
                    'location': 'Mysuru, India',
                    'is_remote': False,
                    'required_skills': ['Docker', 'AWS', 'Linux', 'CI/CD', 'Python'],
                    'min_experience_level': 'beginner',
                    'salary_range': '₹4,50,000 - ₹6,00,000/year',
                },
            },
            {
                'company': {
                    'name': 'CRED',
                    'description': 'Fintech startup rewarding credit card bill payments. Known for high engineering culture.',
                    'website': 'https://careers.cred.club',
                    'location': 'Bangalore, India',
                    'industry': 'Fintech',
                },
                'job': {
                    'title': 'Mobile App Developer Intern (React Native)',
                    'description': 'Build beautiful mobile experiences for CRED\'s award-winning app. React Native + TypeScript.',
                    'job_type': 'internship',
                    'location': 'Bangalore, India',
                    'is_remote': True,
                    'required_skills': ['JavaScript', 'React Native', 'TypeScript', 'Mobile UI/UX', 'Git'],
                    'min_experience_level': 'beginner',
                    'salary_range': '₹30,000 - ₹50,000/month',
                },
            },
            {
                'company': {
                    'name': 'Freshworks',
                    'description': 'SaaS company building customer engagement and IT service management software.',
                    'website': 'https://www.freshworks.com/company/careers/',
                    'location': 'Chennai, India',
                    'industry': 'SaaS',
                },
                'job': {
                    'title': 'Cybersecurity Analyst Intern',
                    'description': 'Help secure Freshworks\' cloud products. Vulnerability assessment, penetration testing, and security audits.',
                    'job_type': 'internship',
                    'location': 'Chennai, India',
                    'is_remote': False,
                    'required_skills': ['Cybersecurity', 'Linux', 'Networking', 'Python', 'OWASP'],
                    'min_experience_level': 'beginner',
                    'salary_range': '₹20,000 - ₹35,000/month',
                },
            },
            {
                'company': {
                    'name': 'Swiggy',
                    'description': 'On-demand food and grocery delivery platform serving millions across India.',
                    'website': 'https://careers.swiggy.com',
                    'location': 'Bangalore, India',
                    'industry': 'Food Tech',
                },
                'job': {
                    'title': 'Data Analyst (Part-time / Freelance)',
                    'description': 'Analyze delivery and customer data to optimize routes and predict demand. SQL + Python + dashboards.',
                    'job_type': 'part-time',
                    'location': 'Remote',
                    'is_remote': True,
                    'required_skills': ['SQL', 'Python', 'Data Analysis', 'Excel', 'Tableau'],
                    'min_experience_level': 'beginner',
                    'salary_range': '₹15,000 - ₹25,000/month',
                },
            },
            {
                'company': {
                    'name': 'Microsoft',
                    'description': 'Global technology corporation known for Windows, Azure, Office 365, and LinkedIn.',
                    'website': 'https://careers.microsoft.com',
                    'location': 'Noida, India',
                    'industry': 'Technology',
                },
                'job': {
                    'title': 'AI/ML Research Intern',
                    'description': 'Work with Microsoft Research India on cutting-edge AI projects — NLP, computer vision, and responsible AI.',
                    'job_type': 'internship',
                    'location': 'Noida, India',
                    'is_remote': False,
                    'required_skills': ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Research'],
                    'min_experience_level': 'advanced',
                    'salary_range': '₹70,000 - ₹1,20,000/month',
                },
            },
        ]

        for item in companies_and_jobs:
            company, _ = Company.objects.get_or_create(
                name=item['company']['name'],
                defaults=item['company'],
            )
            job_data = item['job'].copy()
            job_data['company'] = company
            job_data['deadline'] = timezone.now() + timedelta(days=30)
            JobListing.objects.get_or_create(
                title=job_data['title'],
                company=company,
                defaults=job_data,
            )

        self.stdout.write(f'  🏢 Created {len(companies_and_jobs)} companies with job listings')

    # ──────────────────────────────────────────────────────────────────────
    # SUMMARY
    # ──────────────────────────────────────────────────────────────────────
    def _print_summary(self):
        self.stdout.write('\n' + '═' * 55)
        self.stdout.write('  📊 DATABASE SUMMARY')
        self.stdout.write('═' * 55)
        self.stdout.write(f'  Skill Categories:    {SkillCategory.objects.count()}')
        self.stdout.write(f'  Assessments:         {Assessment.objects.count()}')
        self.stdout.write(f'  Quiz Questions:      {Question.objects.count()}')
        self.stdout.write(f'  Learning Resources:  {LearningResource.objects.count()}')
        self.stdout.write(f'  Companies:           {Company.objects.count()}')
        self.stdout.write(f'  Job Listings:        {JobListing.objects.count()}')
        self.stdout.write('═' * 55 + '\n')
