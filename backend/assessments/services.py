from typing import Dict, Any, List

class SkillEngine:
    """
    Central service for calculating skill proficiency, gaps, and readiness.
    Keeps calculations deterministic as requested.
    """
    
    @staticmethod
    def verify_skill_progression(current_proficiency: float, test_score: float, pass_threshold: float = 80.0) -> float:
        """
        Implements rule: test score >= 80% as a prerequisite for topic skill progression.
        Example: Current ML = 48%, Test = 92% -> New ML = 54%
        Formula: If passed, new = current + (test_score - current) * 0.15
        """
        if test_score < pass_threshold:
            return current_proficiency
        
        # Deterministic small bump if passed
        improvement_factor = 0.15
        new_proficiency = current_proficiency + ((test_score - current_proficiency) * improvement_factor)
        
        # Ensure it doesn't drop if test score is somehow lower than current proficiency but above threshold
        return max(current_proficiency, round(new_proficiency, 2))

    @staticmethod
    def calculate_skill_gap(student_skills: Dict[str, float], target_skills: Dict[str, float]) -> Dict[str, float]:
        """
        Calculates the exact numeric gap for required skills.
        """
        gaps = {}
        for skill, required_level in target_skills.items():
            current = student_skills.get(skill, 0.0)
            if current < required_level:
                gaps[skill] = round(required_level - current, 2)
        return gaps

    @staticmethod
    def calculate_career_readiness(student_skills: Dict[str, float], target_skills: Dict[str, float]) -> Dict[str, Any]:
        """
        Creates a transparent scoring service for career readiness.
        Returns overall score, component scores, and explanation.
        """
        if not target_skills:
            return {"overall_score": 0, "components": {}, "explanation": "No target skills defined for this career."}

        total_weight = sum(target_skills.values())
        achieved_weight = 0
        components = {}

        for skill, required in target_skills.items():
            current = student_skills.get(skill, 0.0)
            score = min(current / required, 1.0) * 100 if required > 0 else 100
            components[skill] = round(score, 2)
            achieved_weight += min(current, required)

        overall = (achieved_weight / total_weight) * 100 if total_weight > 0 else 0

        explanation = []
        gaps = SkillEngine.calculate_skill_gap(student_skills, target_skills)
        if gaps:
            explanation.append(f"You have critical gaps in {len(gaps)} skills.")
            top_gap = max(gaps, key=gaps.get)
            explanation.append(f"Focus on improving {top_gap} first.")
        else:
            explanation.append("You meet all the baseline requirements for this role!")

        return {
            "overall_score": round(overall, 2),
            "component_scores": components,
            "explanation": " ".join(explanation)
        }
