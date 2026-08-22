from django.utils import timezone
from .models import UserStats

class GamificationEngine:
    """
    Handles Phase 3 XP and Streak logic.
    """
    XP_REWARDS = {
        'RESOURCE_COMPLETED': 10,
        'QUIZ_PASSED': 20,
        'TEST_EASY': 30,
        'TEST_MEDIUM': 50,
        'TEST_HARD': 100,
        'PROJECT': 250,
        'INTERVIEW': 100,
        'DAILY_TARGET': 20
    }

    @staticmethod
    def add_xp(user, action_type: str) -> int:
        """Adds XP to user and returns the amount added."""
        stats, created = UserStats.objects.get_or_create(user=user)
        xp_to_add = GamificationEngine.XP_REWARDS.get(action_type, 0)
        
        if xp_to_add > 0:
            stats.xp += xp_to_add
            stats.save()
        return xp_to_add

    @staticmethod
    def log_meaningful_activity(user):
        """
        Logs activity to maintain or increase streak.
        Prevents easy streak manipulation by only calling this when actual work is done 
        (e.g., test submitted, resource completed).
        """
        stats, created = UserStats.objects.get_or_create(user=user)
        today = timezone.now().date()

        if not stats.last_active_date:
            stats.current_streak = 1
            stats.last_active_date = today
        else:
            delta_days = (today - stats.last_active_date).days

            if delta_days == 1:
                stats.current_streak += 1
                stats.last_active_date = today
            elif delta_days > 1:
                # Check for streak freeze
                if stats.streak_freezes > 0:
                    stats.streak_freezes -= 1
                    stats.current_streak += 1
                else:
                    stats.current_streak = 1
                stats.last_active_date = today
            # if delta_days == 0, they already logged activity today, do nothing.

        if stats.current_streak > stats.longest_streak:
            stats.longest_streak = stats.current_streak

        stats.save()
        return stats.current_streak
