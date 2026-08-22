from django.contrib import admin
from .models import Roadmap, RoadmapNode, RoadmapDependency, RoadmapNodeResource, StudentRoadmapProgress

class RoadmapNodeInline(admin.TabularInline):
    model = RoadmapNode
    extra = 0

class RoadmapDependencyInline(admin.TabularInline):
    model = RoadmapDependency
    fk_name = 'node'
    extra = 0

class RoadmapNodeResourceInline(admin.TabularInline):
    model = RoadmapNodeResource
    extra = 0

@admin.register(Roadmap)
class RoadmapAdmin(admin.ModelAdmin):
    list_display = ('student', 'title', 'career_role', 'status', 'overall_progress', 'total_nodes', 'completed_nodes', 'estimated_weeks')
    list_filter = ('status', 'is_ai_generated')
    search_fields = ('student__username', 'title')
    inlines = [RoadmapNodeInline]

@admin.register(RoadmapNode)
class RoadmapNodeAdmin(admin.ModelAdmin):
    list_display = ('roadmap', 'title', 'node_type', 'skill', 'week_number', 'order', 'status', 'current_score', 'target_score')
    list_filter = ('node_type', 'status', 'week_number')
    inlines = [RoadmapNodeResourceInline, RoadmapDependencyInline]

@admin.register(StudentRoadmapProgress)
class StudentRoadmapProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'roadmap', 'node', 'status', 'score', 'time_spent_minutes', 'completed_at')
