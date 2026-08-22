import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.text import slugify

from users.models import StudentProfile, FacultyProfile
from skills.models import Skill, SkillCategory, CareerRole, CareerRoleSkill
from institutions.models import Institution, Department
from jobs.models import Company, JobPosting
from learning.models import LearningResource
from skill_tests.models import SkillTest
from assessments.models import Assessment

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with comprehensive demo data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Clearing existing data...'))
        Assessment.objects.all().delete()
        SkillTest.objects.all().delete()
        LearningResource.objects.all().delete()
        JobPosting.objects.all().delete()
        Company.objects.all().delete()
        Department.objects.all().delete()
        Institution.objects.all().delete()
        CareerRoleSkill.objects.all().delete()
        CareerRole.objects.all().delete()
        Skill.objects.all().delete()
        SkillCategory.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()
        
        self.stdout.write(self.style.SUCCESS('Cleared!'))
        
        self.seed_institutions()
        self.seed_skills()
        self.seed_career_roles()
        self.seed_users()
        self.seed_companies_and_jobs()
        self.seed_learning_and_tests()
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded the database!'))
        
    def seed_institutions(self):
        self.stdout.write('Seeding Institutions...')
        inst_names = ['IIT Bombay', 'NIT Trichy', 'BITS Pilani', 'IIIT Hyderabad', 'Delhi University']
        
        for name in inst_names:
            inst = Institution.objects.create(
                name=name,
                code=slugify(name).upper(),
                institution_type=Institution.InstitutionType.UNIVERSITY,
                city='Demo City',
                is_verified=True,
                established_year=1950,
                total_students=random.randint(1000, 10000)
            )
            Department.objects.create(institution=inst, name='Computer Science', code='CS')
            Department.objects.create(institution=inst, name='Electronics', code='ECE')
            Department.objects.create(institution=inst, name='Mechanical', code='ME')

    def seed_skills(self):
        self.stdout.write('Seeding Skills...')
        categories = {
            'Programming': ['Python', 'Java', 'C++', 'JavaScript'],
            'Data Science': ['Machine Learning', 'Deep Learning', 'Neural Networks', 'Pandas'],
            'Web Development': ['Django', 'React', 'HTML', 'CSS', 'Node.js'],
            'Cloud': ['AWS', 'Docker', 'Kubernetes', 'GCP'],
            'Soft Skills': ['Communication', 'Leadership', 'Problem Solving']
        }
        
        for cat_name, skills in categories.items():
            cat = SkillCategory.objects.create(name=cat_name, description=f'{cat_name} skills')
            parent = None
            for s_name in skills:
                skill = Skill.objects.create(
                    name=s_name,
                    category=cat,
                    parent_skill=parent if s_name in ['Neural Networks', 'Deep Learning', 'Pandas', 'Django', 'React', 'Node.js'] else None,
                    is_technical=cat_name != 'Soft Skills'
                )
                if s_name == 'Machine Learning':
                    parent = skill
                elif s_name == 'Python':
                    parent = skill # Next ones like Pandas might be children if we adjust logic
                elif s_name == 'JavaScript':
                    parent = skill
                else:
                    parent = None
                    
    def seed_career_roles(self):
        self.stdout.write('Seeding Career Roles...')
        roles = [
            'Software Engineer', 'Data Scientist', 'Frontend Developer',
            'Backend Developer', 'DevOps Engineer', 'Product Manager',
            'Cloud Architect', 'Machine Learning Engineer', 'Full Stack Developer',
            'UI/UX Designer'
        ]
        
        skills = list(Skill.objects.all())
        
        for role_name in roles:
            role = CareerRole.objects.create(
                name=role_name,
                description=f'{role_name} description',
                demand_level=CareerRole.DemandLevel.HIGH
            )
            # Assign 3 random skills
            role_skills = random.sample(skills, min(3, len(skills)))
            for rs in role_skills:
                CareerRoleSkill.objects.create(
                    career_role=role,
                    skill=rs,
                    importance=CareerRoleSkill.Importance.REQUIRED
                )

    def seed_users(self):
        self.stdout.write('Seeding Users...')
        inst = Institution.objects.first()
        dept = Department.objects.first()
        
        for i in range(5):
            student = User.objects.create_user(
                username=f'student{i}',
                email=f'student{i}@example.com',
                password='password123',
                role=User.RoleChoices.STUDENT
            )
            StudentProfile.objects.create(
                user=student,
                institution=inst,
                department=dept,
                enrollment_number=f'STU00{i}',
                cgpa=random.uniform(6.0, 9.9)
            )
            
        faculty = User.objects.create_user(
            username='faculty1',
            email='faculty@example.com',
            password='password123',
            role=User.RoleChoices.FACULTY
        )
        FacultyProfile.objects.create(user=faculty, institution=inst, department=dept)
        
        User.objects.create_user(username='admin1', email='admin@example.com', password='password123', role=User.RoleChoices.SUPER_ADMIN)
        User.objects.create_user(username='industry1', email='industry@example.com', password='password123', role=User.RoleChoices.INDUSTRY)

    def seed_companies_and_jobs(self):
        self.stdout.write('Seeding Companies & Jobs...')
        comps = ['Google', 'Microsoft', 'Amazon', 'StartUp Inc']
        for c_name in comps:
            comp = Company.objects.create(
                name=c_name,
                description=f'{c_name} description',
                industry='Technology',
                website=f'https://{slugify(c_name)}.com'
            )
            JobPosting.objects.create(
                company=comp,
                title=f'{c_name} Software Engineer',
                description='Great job',
                job_type=JobPosting.JobType.FULL_TIME,
                location='Remote',
                is_active=True
            )

    def seed_learning_and_tests(self):
        self.stdout.write('Seeding Learning Resources and Tests...')
        skill = Skill.objects.first()
        if skill:
            LearningResource.objects.create(
                title='Learn ' + skill.name,
                resource_type=LearningResource.ResourceType.COURSE,
                url='https://example.com/course',
                description='A great course'
            )
            SkillTest.objects.create(
                title='Test ' + skill.name,
                skill=skill,
                description='Test your skills',
                time_limit_minutes=30,
                pass_percentage=70
            )
            Assessment.objects.create(
                title='General Assessment',
                description='Overall assessment',
                assessment_type='diagnostic',
                time_limit_minutes=60
            )
