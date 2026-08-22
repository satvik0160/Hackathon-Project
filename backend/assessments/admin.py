from django.contrib import admin
from .models import SkillCategory, Assessment, Question, UserAssessment

admin.site.register(SkillCategory)
admin.site.register(Assessment)
admin.site.register(Question)
admin.site.register(UserAssessment)
