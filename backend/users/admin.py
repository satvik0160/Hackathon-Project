from django.contrib import admin
from .models import User, UserStats, Notification, Document

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'experience_level', 'is_active', 'date_joined')
    list_filter = ('role', 'experience_level', 'is_active')
    search_fields = ('username', 'email', 'career_goal')
    ordering = ('-date_joined',)
    readonly_fields = ('date_joined', 'last_login')
    fieldsets = (
        ('Account Info', {'fields': ('username', 'email', 'password', 'role')}),
        ('Profile', {'fields': ('bio', 'skills', 'experience_level', 'interests')}),
        ('Onboarding', {'fields': ('academic_profile', 'career_goal')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Timestamps', {'fields': ('last_login', 'date_joined')}),
    )

@admin.register(UserStats)
class UserStatsAdmin(admin.ModelAdmin):
    list_display = ('user', 'xp', 'current_streak', 'longest_streak')
    search_fields = ('user__username',)
    ordering = ('-xp',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__username', 'title', 'message')

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'uploaded_at')
    search_fields = ('user__username', 'title')
