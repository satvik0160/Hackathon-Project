import { insforge, learningService } from './api';

export const dashboardService = {
  getDashboardData: async (userId) => {
    // 1. Readiness (skill_score_percent) & Level from public.users
    const { data: userData, error: userErr } = await insforge.database
      .from('users')
      .select('skill_score_percent, skill_level')
      .eq('id', userId)
      .single();

    let readiness = userData ? userData.skill_score_percent : 0;
    let skillLevel = userData ? userData.skill_level : 1;

    // Heatmap data from user_assessments
    const { data: assessments, error: asmErr } = await insforge.database
      .from('user_assessments')
      .select('score, percentage, completed_at, assessment_id')
      .eq('user_id', userId);

    let activityMap = {};
    if (!asmErr && assessments && assessments.length > 0) {
      // Calculate Activity for heatmap
      assessments.forEach(asm => {
        const dateStr = new Date(asm.completed_at).toISOString().split('T')[0];
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      });
    }

    // 2. Today's Mission — the user's real daily_planner_targets rows.
    //    learningService.getDailyPlanner auto-generates targets from the
    //    user's weakest assessed categories on first call of the day.
    let dailyTargets = [];
    let completedTargets = 0;
    try {
      const { data } = await learningService.getDailyPlanner();
      dailyTargets = (data || []).map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        duration: t.duration,
        type: t.type,
        done: t.status === 'completed',
      }));
      completedTargets = dailyTargets.filter(t => t.done).length;
    } catch (e) {
      console.warn('[dashboardService] Failed to load daily planner:', e?.message);
    }

    return {
      readiness,
      skillLevel,
      activityMap,
      dailyTargets,
      completedTargets,
      totalTargets: dailyTargets.length
    };
  }
};
