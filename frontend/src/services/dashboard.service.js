import { insforge } from './api';

export const dashboardService = {
  getDashboardData: async (userId) => {
    // 1. Readiness (Average score from user_assessments)
    const { data: assessments, error: asmErr } = await insforge
      .from('user_assessments')
      .select('score, percentage, completed_at, assessment_id')
      .eq('user_id', userId);
      
    let readiness = 0;
    let activityMap = {};
    if (!asmErr && assessments && assessments.length > 0) {
      const sum = assessments.reduce((acc, curr) => acc + curr.percentage, 0);
      readiness = Math.round(sum / assessments.length);
      
      // Calculate Activity for heatmap
      assessments.forEach(asm => {
        const dateStr = new Date(asm.completed_at).toISOString().split('T')[0];
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      });
    }

    // 2. Daily Planner (Fetch some assessments that the user hasn't done)
    let dailyTargets = [];
    let completedTargets = 0;
    try {
      const { data: allAssessments } = await insforge.from('assessments').select('id, title, description, time_limit_minutes, category_id');
      if (allAssessments) {
        // filter out done ones or mark them as done
        const doneIds = new Set((assessments || []).map(a => a.assessment_id));
        
        dailyTargets = allAssessments.slice(0, 3).map(asm => ({
          id: asm.id,
          title: asm.title,
          description: asm.description,
          duration: `${asm.time_limit_minutes}m`,
          done: doneIds.has(asm.id)
        }));
        completedTargets = dailyTargets.filter(t => t.done).length;
      }
    } catch(e) {
      console.error(e);
    }
    
    return {
      readiness,
      activityMap,
      dailyTargets,
      completedTargets,
      totalTargets: dailyTargets.length
    };
  }
};
