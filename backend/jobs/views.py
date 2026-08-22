from rest_framework import generics, permissions
from .models import JobListing, JobApplication
from .serializers import JobListingSerializer, JobApplicationSerializer

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
