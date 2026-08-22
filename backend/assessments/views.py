from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import SkillCategory, Assessment, UserAssessment, Question
from .serializers import SkillCategorySerializer, AssessmentSerializer, AssessmentDetailSerializer, UserAssessmentSerializer

class SkillCategoryListView(generics.ListAPIView):
    queryset = SkillCategory.objects.all()
    serializer_class = SkillCategorySerializer
    permission_classes = [permissions.AllowAny]

class AssessmentListView(generics.ListAPIView):
    queryset = Assessment.objects.filter(is_active=True)
    serializer_class = AssessmentSerializer
    permission_classes = [permissions.AllowAny]

class AssessmentDetailView(generics.RetrieveAPIView):
    queryset = Assessment.objects.filter(is_active=True)
    serializer_class = AssessmentDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

class SubmitAssessmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            assessment = Assessment.objects.get(pk=pk, is_active=True)
        except Assessment.DoesNotExist:
            return Response({'error': 'Assessment not found'}, status=status.HTTP_404_NOT_FOUND)

        answers = request.data.get('answers', {})
        score = 0
        questions = assessment.questions.all()
        for question in questions:
            if answers.get(str(question.id)) == question.correct_answer:
                score += question.marks
        
        percentage = (score / assessment.total_marks) * 100 if assessment.total_marks > 0 else 0
        
        user_assessment = UserAssessment.objects.create(
            user=request.user,
            assessment=assessment,
            score=score,
            total_marks=assessment.total_marks,
            percentage=percentage,
            time_taken_seconds=request.data.get('time_taken_seconds', 0)
        )
        
        serializer = UserAssessmentSerializer(user_assessment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UserAssessmentHistoryView(generics.ListAPIView):
    serializer_class = UserAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserAssessment.objects.filter(user=self.request.user)
