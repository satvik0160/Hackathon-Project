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
        # Dummy logic for generation based on assessment results
        resources = LearningResource.objects.all()[:5]
        path = LearningPath.objects.create(
            user=request.user,
            title="Generated Path",
            description="Generated based on your recent assessments."
        )
        path.resources.set(resources)
        serializer = LearningPathSerializer(path)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UpdateProgressView(generics.UpdateAPIView):
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        if serializer.validated_data.get('is_completed', False):
            serializer.save(completed_at=timezone.now())
        else:
            serializer.save()
