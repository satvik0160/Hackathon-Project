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
        
        # Save Attempt
        user_assessment = UserAssessment.objects.create(
            user=request.user,
            assessment=assessment,
            score=score,
            total_marks=assessment.total_marks,
            percentage=percentage,
            time_taken_seconds=request.data.get('time_taken_seconds', 0)
        )

        # PHASE 2: Skill Intelligence Engine Integration
        # Only update actual proficiency if they score >= 80%
        from .services import SkillEngine
        if percentage >= 80.0:
            skill_name = assessment.skill_category.name.lower()
            current_skills = request.user.skills
            
            # Convert list of skills to dict representation if needed, or assume it's dict-based.
            # Currently `User.skills` defaults to `list` in models.py, but we might want it to be dict {skill: level(1-100)}
            # Let's adapt to dict for proficiency
            if isinstance(current_skills, list):
                # Migrate to dict representation smoothly
                current_skills = {s: 10.0 for s in current_skills}
            
            current_proficiency = current_skills.get(skill_name, 0.0)
            new_proficiency = SkillEngine.verify_skill_progression(current_proficiency, percentage, 80.0)
            
            current_skills[skill_name] = new_proficiency
            request.user.skills = current_skills
            request.user.save()
        
        serializer = UserAssessmentSerializer(user_assessment)
        
        response_data = serializer.data
        if percentage < 80.0:
            response_data["feedback"] = "Score below 80%. Skill proficiency not updated. Keep practicing!"
        else:
            response_data["feedback"] = f"Great job! Your proficiency in {assessment.skill_category.name} has increased."

        # PHASE 3: Gamification Engine (XP & Streak)
        try:
            from users.services import GamificationEngine
            # Add XP based on passing
            if percentage >= 80.0:
                # We could map assessment difficulty to specific XP, using a default QUIZ_PASSED for now
                xp_added = GamificationEngine.add_xp(request.user, 'QUIZ_PASSED')
                response_data["xp_earned"] = xp_added
            
            # Log meaningful activity for streaks
            current_streak = GamificationEngine.log_meaningful_activity(request.user)
            response_data["current_streak"] = current_streak
        except Exception as e:
            # Gamification shouldn't crash the core assessment logic
            print(f"Gamification Error: {e}")

        return Response(response_data, status=status.HTTP_201_CREATED)

class UserAssessmentHistoryView(generics.ListAPIView):
    serializer_class = UserAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserAssessment.objects.filter(user=self.request.user)
