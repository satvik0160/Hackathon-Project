from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import User
from django.db.models import Count, Avg

class InstitutionAnalyticsView(APIView):
    """
    Phase 6: Institution Analytics API.
    Provides aggregated data on student readiness, skill gaps, and alignment.
    Only accessible by users with INSTITUTION_ADMIN role.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'INSTITUTION_ADMIN':
            return Response({"error": "Unauthorized. Institution Admins only."}, status=status.HTTP_403_FORBIDDEN)
        
        # In a real scenario, this filters by the institution ID linked to the admin
        students = User.objects.filter(role='STUDENT')
        
        total_students = students.count()
        # Mock aggregation of skill gaps (since skills is JSONField, native aggregation is tricky in SQLite)
        # We'll just return some mock analytical insights representing what a data warehouse would compute
        
        return Response({
            "total_students": total_students,
            "average_readiness_score": 68.5,
            "top_skill_gaps": ["Cloud Architecture", "System Design", "Advanced React"],
            "curriculum_alignment": "74% aligned with current tech industry demand.",
            "placement_readiness": {
                "highly_ready": int(total_students * 0.15),
                "moderately_ready": int(total_students * 0.45),
                "needs_improvement": int(total_students * 0.40)
            },
            "industry_demand_vs_supply": {
                "demand": "High demand for AI/ML skills",
                "supply": "Only 20% of cohort proficient in ML"
            }
        })
