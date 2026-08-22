from django.contrib import admin
from .models import (
    CareerGuidanceSession,
    CareerGuidanceMessage,
    ChatSession,
    ChatMessage
)

class CareerGuidanceMessageInline(admin.StackedInline):
    model = CareerGuidanceMessage
    extra = 0
    readonly_fields = ['created_at']

@admin.register(CareerGuidanceSession)
class CareerGuidanceSessionAdmin(admin.ModelAdmin):
    list_display = ['student', 'title', 'session_type', 'status', 'total_messages', 'updated_at']
    list_filter = ['status', 'session_type']
    search_fields = ['student__username', 'title']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [CareerGuidanceMessageInline]

class ChatMessageInline(admin.StackedInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ['created_at']

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['student', 'title', 'context_type', 'status', 'total_messages', 'updated_at']
    list_filter = ['status', 'context_type']
    search_fields = ['student__username', 'title']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ChatMessageInline]
