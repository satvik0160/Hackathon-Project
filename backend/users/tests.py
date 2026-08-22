from django.test import TestCase
from django.contrib.auth import get_user_model
from users.services import GamificationEngine
from assessments.services import SkillEngine

User = get_user_model()

class SkillEngineTests(TestCase):
    def test_verify_skill_progression_pass(self):
        # 48% current, 92% test, threshold 80%
        new_prof = SkillEngine.verify_skill_progression(48.0, 92.0, 80.0)
        # Delta = 44 * 0.15 = 6.6. New = 48 + 6.6 = 54.6
        self.assertEqual(new_prof, 54.6)
        
    def test_verify_skill_progression_fail(self):
        # Score 79% (below 80% threshold)
        new_prof = SkillEngine.verify_skill_progression(48.0, 79.0, 80.0)
        self.assertEqual(new_prof, 48.0) # Should not increase
        
    def test_calculate_skill_gap(self):
        student = {"python": 50, "sql": 40}
        target = {"python": 80, "sql": 60, "ml": 50}
        gaps = SkillEngine.calculate_skill_gap(student, target)
        self.assertEqual(gaps["python"], 30)
        self.assertEqual(gaps["sql"], 20)
        self.assertEqual(gaps["ml"], 50)


class GamificationEngineTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpassword123")

    def test_add_xp(self):
        xp = GamificationEngine.add_xp(self.user, 'QUIZ_PASSED')
        self.assertEqual(xp, 20)
        
        # Verify in DB
        self.user.stats.refresh_from_db()
        self.assertEqual(self.user.stats.xp, 20)
        
    def test_streak_logic_new_user(self):
        streak = GamificationEngine.log_meaningful_activity(self.user)
        self.assertEqual(streak, 1)
        self.user.stats.refresh_from_db()
        self.assertEqual(self.user.stats.longest_streak, 1)
