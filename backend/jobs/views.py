from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
from bs4 import BeautifulSoup
from .models import JobListing, JobApplication
from .serializers import JobListingSerializer, JobApplicationSerializer
from .skill_matcher import get_skill_match, get_all_skill_names, get_skill_keys


class JobListingListView(generics.ListAPIView):
    queryset = JobListing.objects.filter(is_active=True)
    serializer_class = JobListingSerializer
    permission_classes = [permissions.AllowAny]
    # Added advanced filtering
    filterset_fields = ['job_type', 'is_remote', 'company__name']
    search_fields = ['title', 'description', 'location']


class JobMatchView(APIView):
    """
    Phase 4: Explainable Job Matching Engine
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_skills = request.user.skills
        
        if isinstance(user_skills, list):
            user_skills = {s: 10.0 for s in user_skills}

        active_jobs = JobListing.objects.filter(is_active=True)
        from assessments.services import SkillEngine
        
        matches = []
        for job in active_jobs:
            # required_skills is a list in db, converting to a mock dict for the engine
            req_skills_dict = {skill: 50.0 for skill in job.required_skills} 
            
            readiness = SkillEngine.calculate_career_readiness(user_skills, req_skills_dict)
            
            if readiness['overall_score'] > 0:
                job_data = JobListingSerializer(job).data
                job_data['match_analysis'] = readiness
                matches.append(job_data)
                
        # Sort by best match
        matches.sort(key=lambda x: x['match_analysis']['overall_score'], reverse=True)
        
        return Response({
            "student_profile": user_skills,
            "recommended_jobs": matches[:10]
        })


class SkillMatchView(APIView):
    """
    Skill Matching Engine API
    ─────────────────────────
    POST /api/jobs/skill-match/
    
    Accepts a student's skill ratings and returns the top matching careers
    using cosine similarity against the career database.

    Request Body:
        {
            "skills": {
                "python": 8,
                "javascript": 6,
                "react": 7,
                "django": 5,
                ...
            },
            "top_n": 3  // optional, defaults to 3
        }

    Response:
        {
            "matches": [
                {
                    "career_title": "Data Scientist",
                    "category": "Data & AI",
                    "match_percentage": 92.5,
                    "skill_gaps": [...],
                    "skill_strengths": [...]
                },
                ...
            ],
            "student_skills": { ... },
            "total_careers_analyzed": 20
        }
    """
    permission_classes = [permissions.AllowAny]  # Open for prototype

    def post(self, request):
        skills = request.data.get('skills', {})
        top_n = request.data.get('top_n', 3)

        # Validate that at least some skills were provided
        if not skills:
            return Response(
                {
                    'error': 'No skills provided.',
                    'hint': 'Send a JSON body with a "skills" key containing skill ratings.',
                    'available_skills': get_skill_keys(),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate top_n is reasonable
        top_n = min(max(int(top_n), 1), 10)

        # Run the matching engine
        try:
            matches = get_skill_match(student_skills=skills, top_n=top_n)
        except Exception as e:
            return Response(
                {'error': f'Matching engine error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({
            'matches': matches,
            'student_skills': skills,
            'total_careers_analyzed': 20,
        })

    def get(self, request):
        """GET request returns the list of available skills for the form."""
        return Response({
            'available_skills': get_skill_keys(),
            'skill_labels': get_all_skill_names(),
            'instructions': 'POST to this endpoint with {"skills": {"python": 8, ...}} to get career matches.',
        })


class ApplyJobView(generics.CreateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ApplicationHistoryView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)

class JobApplicationUpdateView(generics.UpdateAPIView):
    """
    Phase 4: Allows users to withdraw or save applications.
    """
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)

class IndustryJobPostView(generics.CreateAPIView):
    """
    Phase 6: Industry API to post jobs/internships.
    Requires INDUSTRY role.
    """
    serializer_class = JobListingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if request.user.role != 'INDUSTRY':
            return Response({"error": "Unauthorized. Industry only."}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

class MentorFeedbackView(APIView):
    """
    Phase 6: Industry Mentor Feedback -> Skill Engine.
    Requires MENTOR or INDUSTRY role.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role not in ['MENTOR', 'INDUSTRY']:
            return Response({"error": "Unauthorized. Mentors only."}, status=status.HTTP_403_FORBIDDEN)
            
        student_id = request.data.get("student_id")
        evaluated_skill = request.data.get("skill")
        mentor_score = request.data.get("score") # Out of 100
        
        from users.models import User
        from assessments.services import SkillEngine
        
        try:
            student = User.objects.get(id=student_id, role='STUDENT')
            
            # Use SkillEngine to intelligently blend mentor feedback instead of blindly overwriting
            current_skills = student.skills
            if isinstance(current_skills, list):
                current_skills = {s: 10.0 for s in current_skills}
                
            current_proficiency = current_skills.get(evaluated_skill.lower(), 0.0)
            
            # Mentor feedback is treated like a highly-weighted test score
            new_proficiency = SkillEngine.verify_skill_progression(current_proficiency, mentor_score, pass_threshold=0.0)
            
            current_skills[evaluated_skill.lower()] = new_proficiency
            student.skills = current_skills
            student.save()
            
            return Response({
                "message": "Feedback submitted and Skill Intelligence updated.",
                "previous_proficiency": current_proficiency,
                "new_proficiency": new_proficiency
            })
            
        except User.DoesNotExist:
            return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

class AnalyzeJobUrlView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        url = request.data.get('url')
        if not url:
            return Response({'error': 'URL is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            resp = requests.get(url, timeout=10)
            soup = BeautifulSoup(resp.text, 'html.parser')
            text = soup.get_text().lower()
            
            keywords = {
                'python': 'Python',
                'javascript': 'JavaScript',
                'react': 'React',
                'django': 'Django',
                'aws': 'AWS',
                'sql': 'SQL',
                'docker': 'Docker',
                'kubernetes': 'Kubernetes',
                'machine learning': 'Machine Learning',
                'ai': 'AI',
                'agile': 'Agile'
            }
            
            found_skills = []
            for kw, name in keywords.items():
                if kw in text:
                    found_skills.append(name)
                    
            gap_analysis = [s for s in keywords.values() if s not in found_skills][:3]
            learning_path = [f"Learn {skill}" for skill in gap_analysis]
            
            if not gap_analysis:
                gap_analysis = ['Cloud Computing', 'System Design']
                learning_path = ['Intro to Cloud', 'Advanced System Design']
                
            return Response({
                'gap_analysis': gap_analysis,
                'learning_path': learning_path
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

