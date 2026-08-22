from rest_framework import serializers
from .models import User, Notification

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'bio', 'profile_picture', 'role',
            'skills', 'experience_level', 'interests', 
            'academic_profile', 'career_goal', 'onboarding_completed', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'role'] # Role shouldn't be freely mutable by users

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='STUDENT')

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'STUDENT')
        )
        return user

class OnboardingSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['academic_profile', 'career_goal', 'skills', 'experience_level']

    def validate(self, attrs):
        if not attrs.get('academic_profile'):
            raise serializers.ValidationError({"academic_profile": "Academic profile is required for onboarding."})
        if not attrs.get('career_goal'):
            raise serializers.ValidationError({"career_goal": "Career goal is required."})
        return attrs

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']
