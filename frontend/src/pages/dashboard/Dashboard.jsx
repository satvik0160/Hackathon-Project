import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboard.service';
import { useNavigate } from 'react-router-dom';

import './command-center.css';

import HeroBanner from './components/HeroBanner';
import RoadmapSprintCard from './components/RoadmapSprintCard';
import SkillScoreCard from './components/SkillScoreCard';
import VectorBreakdownCard from './components/VectorBreakdownCard';
import OpportunityMatchCard from './components/OpportunityMatchCard';
import GrowthCard from './components/GrowthCard';
import MissionCard from './components/MissionCard';
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
    if (user?.id) {
      dashboardService.getDashboardData(user.id)
        .then(data => {
          setDashboardData(data);
          setLoadingData(false);
        })
        .catch(err => {
          console.error('[Dashboard] Failed to load data:', err);
          setError(err?.message || 'Failed to load dashboard data');
          setLoadingData(false);
        });
    }
  }, [user]);

  // Extract user data
  const firstName = (user?.full_name || user?.name || user?.user_metadata?.full_name || 'Explorer').split(' ')[0];
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
          onAddTask={null /* No task-creation path exists yet */}
        />
      </motion.div>

      {/* Roadmap Sprint Card */}
      <motion.div variants={itemVariants}>
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
        <SkillScoreCard score={skillScore} />
        <VectorBreakdownCard
          technical={0}
          problemSolving={0}
          interviewReady={0}
          analysisLink="/analytics"
        />
        <OpportunityMatchCard opportunities={[]} />
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
