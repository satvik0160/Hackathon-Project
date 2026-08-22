from rest_framework import serializers
from .models import SkillCategory, Assessment, Question, UserAssessment

class SkillCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCategory
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'marks']

class AssessmentSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='skill_category.name', read_only=True)
    questions_count = serializers.IntegerField(source='questions.count', read_only=True)

    class Meta:
        model = Assessment
        fields = ['id', 'title', 'description', 'skill_category', 'category_name', 'difficulty_level', 'time_limit_minutes', 'total_marks', 'is_active', 'questions_count']

class AssessmentDetailSerializer(AssessmentSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta(AssessmentSerializer.Meta):
        fields = AssessmentSerializer.Meta.fields + ['questions']

class UserAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAssessment
        fields = '__all__'
        read_only_fields = ['user', 'completed_at']
