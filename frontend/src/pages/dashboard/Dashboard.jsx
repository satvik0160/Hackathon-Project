import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboard.service';
import { assessmentService, jobService, learningService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import './command-center.css';

import HeroBanner from './components/HeroBanner';
import RoadmapSprintCard from './components/RoadmapSprintCard';
import SkillScoreCard from './components/SkillScoreCard';
import VectorBreakdownCard from './components/VectorBreakdownCard';
import OpportunityMatchCard from './components/OpportunityMatchCard';
import GrowthCard from './components/GrowthCard';
import MissionCard from './components/MissionCard';
import LeaderboardPreviewCard from './components/LeaderboardPreviewCard';
import ProgressOverviewCard from './components/ProgressOverviewCard';

import ActivityHeatmapCard from './components/ActivityHeatmapCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } }
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    readiness: 0,
    skillLevel: 1,
    activityMap: {},
    dailyTargets: [],
    completedTargets: 0,
    totalTargets: 0
  });
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [vector, setVector] = useState({ technical: 0, problemSolving: 0, interviewReady: 0 });
  const [opportunities, setOpportunities] = useState([]);

  // Time tracking data for heatmap
  const [timeData, setTimeData] = useState({});
  useEffect(() => {
    import('../../utils/timeTracker').then(({ getTimeData }) => {
      setTimeData(getTimeData());
      const handleUpdate = () => setTimeData(getTimeData());
      window.addEventListener('timeTrackerUpdate', handleUpdate);
      return () => window.removeEventListener('timeTrackerUpdate', handleUpdate);
    });
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      try {
        const data = await dashboardService.getDashboardData(user.id);
        if (!cancelled) {
          setDashboardData(data);
          setLoadingData(false);
        }
      } catch (err) {
        console.error('[Dashboard] Failed to load data:', err);
        if (!cancelled) {
          setError(err?.message || 'Failed to load dashboard data');
          setLoadingData(false);
        }
      }

      // Secondary, non-blocking: real per-category scores for the vector cards.
      try {
        const { data: history } = await assessmentService.getHistory();
        if (!cancelled) setVector(computeVector(history || []));
      } catch (e) {
        console.warn('[Dashboard] history unavailable', e?.message);
      }

      // Secondary: real job matches (client-side deterministic scoring).
      try {
        const { data } = await jobService.getMatches();
        const matches = data?.matches || [];
        if (!cancelled) {
          setOpportunities(matches.slice(0, 3).map((j) => ({
            company: j.company_name,
            role: j.title,
            matchPercent: j.match_score || 0,
          })));
        }
      } catch (e) {
        console.warn('[Dashboard] matches unavailable', e?.message);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  // Derive the Vector Breakdown from the user's real assessment history.
  const computeVector = (history) => {
    if (!history.length) return { technical: 0, problemSolving: 0, interviewReady: 0 };
    const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
    const pcts = history.map((h) => Number(h.score_percentage) || 0);
    const technical = avg(pcts);
    const psKeywords = ['problem solving', 'algorithm', 'data structure', 'dsa', 'logic'];
    const ps = history.filter((h) => {
      const name = (h.assessment?.skill_categories?.name || h.assessment?.title || '').toLowerCase();
      return psKeywords.some((k) => name.includes(k));
    });
    const problemSolving = ps.length ? avg(ps.map((h) => Number(h.score_percentage) || 0)) : technical;
    const interviewReady = Math.round((100 * pcts.filter((p) => p >= 60).length) / pcts.length);
    return { technical, problemSolving, interviewReady };
  };

  const handleAddTask = async (title) => {
    try {
      await learningService.addTarget({ title });
      const data = await dashboardService.getDashboardData(user.id);
      setDashboardData(data);
      toast.success('Task added to today\u2019s mission');
    } catch (err) {
      console.error('[Dashboard] add task failed', err);
      toast.error('Failed to add task');
      throw err;
    }
  };

  // Extract user data
  const firstName = (user?.full_name || user?.name || user?.user_metadata?.full_name || user?.username || user?.email?.split('@')[0] || 'User').split(' ')[0];
  const skillScore = dashboardData.readiness || user?.skill_score_percent || user?.skill_score || 0;

  // Target role from user profile (if set during onboarding)
  const targetRole = user?.target_role || user?.career_goal || '';

  // Skills from user profile (these are the skills they're working on)
  const userSkills = user?.skills || [];
  const roadmapSkills = userSkills.length > 0
    ? userSkills.slice(0, 2).map((skill, idx) => ({
        name: typeof skill === 'string' ? skill : skill.name || skill,
        percent: typeof skill === 'object' ? (skill.progress || 0) : 0,
        icon: idx === 0 ? 'Code' : 'Layout',
        color: idx === 0 ? 'teal' : 'purple'
      }))
    : [];

  // Build tasks from dailyTargets
  const tasks = (dashboardData.dailyTargets || []).map(t => ({
    id: t.id,
    title: t.title,
    done: t.done
  }));

  // Calculate total hours from time data
  const totalSeconds = Object.values(timeData).reduce((sum, s) => sum + s, 0);
  const totalHours = Math.floor(totalSeconds / 3600);

  // Calculate completed assessments count
  const completedAssessments = dashboardData.activityMap
    ? Object.values(dashboardData.activityMap).reduce((sum, v) => sum + v, 0)
    : 0;

  // Skeleton loading state
  if (loadingData) {
    return (
      <div className="cc-page" style={{ padding: 0 }}>
        <div className="cc-hero">
          <div className="cc-skeleton" style={{ height: 174, borderRadius: 22 }} />
        </div>
        <div className="cc-right-rail" style={{ gap: 16 }}>
          <div className="cc-skeleton" style={{ height: 90, borderRadius: 22 }} />
          <div className="cc-skeleton" style={{ height: 369, borderRadius: 22 }} />
        </div>
        <div className="cc-skeleton" style={{ height: 267, borderRadius: 22 }} />
        <div className="cc-middle-row">
          <div className="cc-skeleton" style={{ height: 262, borderRadius: 22 }} />
          <div className="cc-skeleton" style={{ height: 261, borderRadius: 22 }} />
          <div className="cc-skeleton" style={{ height: 264, borderRadius: 22 }} />
        </div>
        <div className="cc-bottom-row">
          <div className="cc-skeleton" style={{ height: 155, borderRadius: 22 }} />
          <div className="cc-skeleton" style={{ height: 155, borderRadius: 22 }} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="cc-page"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ padding: 0 }}
    >
      {/* Hero Banner */}
      <motion.div className="cc-hero" variants={itemVariants}>
        <HeroBanner firstName={firstName} />
      </motion.div>

      {/* Right Rail */}
      <motion.div className="cc-right-rail" variants={itemVariants}>
        <GrowthCard />
        <MissionCard
          tasks={tasks}
          onAddTask={handleAddTask}
        />
        <LeaderboardPreviewCard />
      </motion.div>

      {/* Roadmap Sprint Card */}
      <motion.div className="cc-roadmap" variants={itemVariants}>
        <RoadmapSprintCard
          targetRole={targetRole}
          roleDescription="Master the required skills to achieve your target role."
          weekNumber={1}
          totalWeeks={12}
          skills={roadmapSkills}
          onLaunchModule={() => navigate('/learning')}
        />
      </motion.div>

      {/* Middle Row: Skill Score + Vector Breakdown + Opportunity Match */}
      <motion.div className="cc-middle-row" variants={itemVariants}>
        <SkillScoreCard score={skillScore} level={dashboardData.skillLevel} />
        <VectorBreakdownCard
          technical={vector.technical}
          problemSolving={vector.problemSolving}
          interviewReady={vector.interviewReady}
          analysisLink="/analytics"
        />
        <OpportunityMatchCard
          opportunities={opportunities}
          onViewAll={() => navigate('/jobs')}
        />
      </motion.div>

      {/* Bottom Row: Progress Overview + Activity Heatmap */}
      <motion.div className="cc-bottom-row" variants={itemVariants}>
        <ProgressOverviewCard
          skillsCompleted={completedAssessments}
          skillsTotal={undefined}
          projectsBuilt={0}
          projectsTotal={undefined}
          quizzesPassed={completedAssessments}
          quizzesTotal={undefined}
          hoursLearned={totalHours}
          hoursTotal={undefined}
        />
        <ActivityHeatmapCard timeData={timeData} />
      </motion.div>

      {/* Inline error display */}
      {error && (
        <div className="col-span-full px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}
    </motion.div>
  );
}
