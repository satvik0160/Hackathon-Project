from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import LearningResource, LearningPath, UserProgress
from .serializers import LearningResourceSerializer, LearningPathSerializer, UserProgressSerializer

class LearningResourceListView(generics.ListAPIView):
    queryset = LearningResource.objects.all()
    serializer_class = LearningResourceSerializer
    permission_classes = [permissions.AllowAny]
    # Advanced Filtering
    filterset_fields = ['resource_type', 'difficulty_level', 'is_free', 'skill_category']
    search_fields = ['title', 'description']

class LearningPathListView(generics.ListCreateAPIView):
    serializer_class = LearningPathSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LearningPath.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class GenerateLearningPathView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        career_goal = user.career_goal
        
        # Simulate AI checking DB for target skills of career_goal
        # Fallback to general missing skills
        all_resources = LearningResource.objects.all()
        # Filter resources matching user's gaps (dummy matching for now since we don't have the full NLP engine here)
        recommended_resources = all_resources[:5] 

        path = LearningPath.objects.create(
            user=user,
            title=f"Roadmap to {career_goal}" if career_goal else "Personalized Skill Roadmap",
            description="Dynamically generated to cover your critical skill gaps."
        )
        path.resources.set(recommended_resources)
        serializer = LearningPathSerializer(path)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UpdateProgressView(generics.UpdateAPIView):
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        from users.services import GamificationEngine
        is_completed = serializer.validated_data.get('is_completed', False)
        
        # Give XP only when newly completed
        if is_completed and not self.get_object().is_completed:
            serializer.save(completed_at=timezone.now())
            GamificationEngine.add_xp(self.request.user, 'RESOURCE_COMPLETED')
            GamificationEngine.log_meaningful_activity(self.request.user)
        else:
            serializer.save()

class DailyPlannerView(APIView):
    """
    Phase 3: Daily AI Planner
    Outputs daily targets based on gaps, goals, and history.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # AI Logic Abstraction
        # In a full production setup, this would query an LLM or a deterministic recommender
        # with the user's skill gaps and available hours.
        
        daily_targets = [
            {"id": "t1", "type": "resource", "title": "Watch: Introduction to Random Forests", "duration_mins": 15},
            {"id": "t2", "type": "quiz", "title": "Take Assessment: SQL Joins (Medium)", "duration_mins": 20},
            {"id": "t3", "type": "practice", "title": "Review Pandas DataFrames documentation", "duration_mins": 10}
        ]
        
        return Response({
            "message": "Your adaptive daily plan is ready.",
            "date": timezone.now().date(),
            "targets": daily_targets
        })
