from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import JobListing, JobApplication
from .serializers import JobListingSerializer, JobApplicationSerializer
from .skill_matcher import get_skill_match, get_all_skill_names, get_skill_keys


class JobListingListView(generics.ListAPIView):
    queryset = JobListing.objects.filter(is_active=True)
    serializer_class = JobListingSerializer
    permission_classes = [permissions.AllowAny]


class JobMatchView(generics.ListAPIView):
    serializer_class = JobListingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_skills = self.request.user.skills
        # Simple match: returning all active jobs for now
        return JobListing.objects.filter(is_active=True)


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
