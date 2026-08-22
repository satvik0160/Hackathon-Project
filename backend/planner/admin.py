from django.contrib import admin
from .models import (
    DailyPlan, DailyTarget, TargetCompletion, Streak, DailyActivity,
    XPTransaction, UserLevel, Achievement, UserAchievement
)

class DailyTargetInline(admin.TabularInline):
    model = DailyTarget
    extra = 0

@admin.register(DailyPlan)
class DailyPlanAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'status', 'total_targets', 'completed_targets', 'total_xp_earned', 'is_ai_generated')
    list_filter = ('status', 'is_ai_generated', 'date')
    search_fields = ('student__username',)
    inlines = [DailyTargetInline]
    date_hierarchy = 'date'

@admin.register(Streak)
class StreakAdmin(admin.ModelAdmin):
    list_display = ('student', 'current_streak', 'longest_streak', 'total_active_days', 'last_active_date', 'streak_freezes_remaining')

@admin.register(DailyActivity)
class DailyActivityAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'activity_type', 'duration_minutes', 'xp_earned', 'is_meaningful')
    list_filter = ('activity_type', 'is_meaningful', 'date')

@admin.register(XPTransaction)
class XPTransactionAdmin(admin.ModelAdmin):
    list_display = ('student', 'amount', 'transaction_type', 'description', 'balance_after', 'created_at')
    list_filter = ('transaction_type',)
    readonly_fields = ('balance_after',)

@admin.register(UserLevel)
class UserLevelAdmin(admin.ModelAdmin):
    list_display = ('student', 'level', 'total_xp', 'title')

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'xp_reward', 'rarity', 'is_active', 'is_secret')
    list_filter = ('category', 'rarity', 'is_active')

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('student', 'achievement', 'earned_at', 'notified')
