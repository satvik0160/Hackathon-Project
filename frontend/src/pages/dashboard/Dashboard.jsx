import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import { 
  Flame, Trophy, Star, Target, CheckCircle, Clock, 
  BookOpen, Briefcase, UserCheck, ArrowRight, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { authService, assessmentService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [profileRes, historyRes] = await Promise.all([
          authService.getProfile(),
          assessmentService.getHistory()
        ]);
        setProfile(profileRes.data);
        setHistory(historyRes.data || []);
      } catch (error) {
        console.error("Dashboard fetch error", error);
        // Fallback for demo purposes if API fails
        if (user) {
          setProfile(user);
        } else {
          toast.error("Failed to load dashboard data");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Dummy stats processing
  const stats = {
    streak: profile?.stats?.streak || 5,
    longestStreak: profile?.stats?.longestStreak || 12,
    xp: profile?.stats?.xp || 2450,
    readiness: 78
  };

  // Prepare radar chart data
  const getRadarData = () => {
    const skills = profile?.skills || {};
    if (Object.keys(skills).length === 0) {
      return [
        { subject: 'Frontend', A: 80 },
        { subject: 'Backend', A: 60 },
        { subject: 'Database', A: 70 },
        { subject: 'DevOps', A: 40 },
        { subject: 'UI/UX', A: 65 },
        { subject: 'Problem Solving', A: 85 },
      ];
    }
    
    return Object.entries(skills).map(([key, value]) => ({
      subject: key.charAt(0).toUpperCase() + key.slice(1),
      A: value * 10 || 50 // Assuming scale 1-10 mapped to 0-100
    })).slice(0, 6); // Max 6 for radar chart
  };

  // Generate heatmap data (mock)
  const generateHeatmap = () => {
    const cells = [];
    const today = new Date();
    // Generate past ~180 days for a half-year view to fit better
    for (let i = 180; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const intensity = Math.floor(Math.random() * 5); // 0 to 4
      cells.push(
        <div 
          key={i} 
          className={`heatmap-cell level-${intensity}`}
          title={`${date.toLocaleDateString()}: ${intensity * 2} activities`}
        />
      );
    }
    return cells;
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="skeleton-title mb-6"></div>
        <div className="grid-4 mb-8">
          <div className="skeleton-card h-24"></div>
          <div className="skeleton-card h-24"></div>
          <div className="skeleton-card h-24"></div>
          <div className="skeleton-card h-24"></div>
        </div>
        <div className="skeleton-card h-64 mb-8"></div>
        <div className="grid-2">
          <div className="skeleton-card h-64"></div>
          <div className="skeleton-card h-64"></div>
        </div>
      </div>
    );
  }

  const radarData = getRadarData();

  return (
    <div className="page-container">
      <motion.div 
        className="page-header mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {getTimeGreeting()}, {profile?.username || 'Explorer'} 👋
          </h1>
          <p className="text-muted flex items-center gap-2">
            <span>Your goal:</span>
            <span className="badge badge-primary">{profile?.career_goal || 'Software Engineer'}</span>
          </p>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div 
        className="grid-4 mb-8"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariant} className="stat-card card-hover">
          <div className="flex justify-between items-start mb-2">
            <span className="stat-label">Current Streak</span>
            <div className="card-icon text-warning"><Flame size={20} /></div>
          </div>
          <div className="stat-value">{stats.streak} <span className="text-sm font-normal text-muted">Days</span></div>
          <div className="text-sm text-success flex items-center gap-1 mt-2">
            <Activity size={14} /> Keeps going up!
          </div>
        </motion.div>

        <motion.div variants={itemVariant} className="stat-card card-hover">
          <div className="flex justify-between items-start mb-2">
            <span className="stat-label">Longest Streak</span>
            <div className="card-icon text-accent"><Trophy size={20} /></div>
          </div>
          <div className="stat-value">{stats.longestStreak} <span className="text-sm font-normal text-muted">Days</span></div>
          <div className="text-sm text-muted mt-2">Personal best</div>
        </motion.div>

        <motion.div variants={itemVariant} className="stat-card card-hover">
          <div className="flex justify-between items-start mb-2">
            <span className="stat-label">Total XP</span>
            <div className="card-icon text-primary"><Star size={20} /></div>
          </div>
          <div className="stat-value">{stats.xp.toLocaleString()}</div>
          <div className="progress-sm mt-2">
            <div className="progress-track">
              <div className="progress-fill bg-primary" style={{ width: '45%' }}></div>
            </div>
          </div>
          <div className="text-xs text-right mt-1 text-muted">550 to next level</div>
        </motion.div>

        <motion.div variants={itemVariant} className="stat-card card-hover">
          <div className="flex justify-between items-start mb-2">
            <span className="stat-label">Readiness</span>
            <div className="card-icon text-success"><Target size={20} /></div>
          </div>
          <div className="stat-value">{stats.readiness}%</div>
          <div className="text-sm text-success mt-2">+5% from last week</div>
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Career Readiness Gauge */}
        <motion.div 
          className="card lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-header border-b border-border pb-4 mb-4">
            <h2 className="card-title">Career Readiness Score</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--bg-secondary)" strokeWidth="10" />
                <motion.circle 
                  cx="50" cy="50" r="40" fill="transparent" 
                  stroke="var(--primary)" strokeWidth="10" 
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (251.2 * stats.readiness / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{stats.readiness}%</span>
                <span className="text-xs text-muted uppercase font-semibold">Ready</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              {[
                { label: 'Technical Skills', val: 82, color: 'var(--primary)' },
                { label: 'Projects', val: 65, color: 'var(--accent)' },
                { label: 'Problem Solving', val: 90, color: 'var(--success)' },
                { label: 'Interview Readiness', val: 50, color: 'var(--warning)' },
                { label: 'Communication', val: 75, color: 'var(--primary)' },
                { label: 'Industry Exposure', val: 40, color: 'var(--danger)' },
              ].map((item, idx) => (
                <div key={idx} className="w-full cursor-pointer group">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="group-hover:text-primary transition-colors">{item.label}</span>
                    <span className="font-semibold">{item.val}%</span>
                  </div>
                  <div className="h-2 w-full bg-bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.val}%` }}
                      transition={{ duration: 1, delay: 0.3 + (idx * 0.1) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Skill Radar */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-header mb-2">
            <h2 className="card-title">Skill Profile</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar
                  name="Skills"
                  dataKey="A"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.4}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Heatmap */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card-header border-b border-border pb-4 mb-4">
            <h2 className="card-title">Activity Heatmap</h2>
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="min-w-max">
              <div className="heatmap-grid flex flex-wrap gap-1 w-full max-h-32 flex-col" style={{ height: '110px' }}>
                {generateHeatmap()}
              </div>
              <div className="flex justify-end items-center gap-2 mt-4 text-xs text-muted">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm heatmap-cell level-0"></div>
                  <div className="w-3 h-3 rounded-sm heatmap-cell level-1"></div>
                  <div className="w-3 h-3 rounded-sm heatmap-cell level-2"></div>
                  <div className="w-3 h-3 rounded-sm heatmap-cell level-3"></div>
                  <div className="w-3 h-3 rounded-sm heatmap-cell level-4"></div>
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="card-header border-b border-border pb-4 mb-4">
            <h2 className="card-title">Recent Activity</h2>
          </div>
          {history.length > 0 ? (
            <div className="timeline">
              {history.slice(0, 3).map((item, idx) => (
                <div key={item.id || idx} className="timeline-item">
                  <div className="timeline-dot bg-primary"></div>
                  <div className="ml-6 mb-4">
                    <p className="font-semibold text-sm">{item.assessment_name || 'Assessment Completed'}</p>
                    <p className="text-xs text-muted mt-1">Score: {item.score}% • {new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state py-8">
              <Clock className="empty-state-icon" size={32} />
              <p className="text-muted mt-2">No recent activity found.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid-4">
          <Link to="/assessments" className="card card-hover flex flex-col items-center justify-center p-6 text-center border border-border group">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CheckCircle size={24} />
            </div>
            <h3 className="font-semibold mb-1">Take Assessment</h3>
            <p className="text-xs text-muted">Test your skills</p>
          </Link>
          
          <Link to="/learning" className="card card-hover flex flex-col items-center justify-center p-6 text-center border border-border group">
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <h3 className="font-semibold mb-1">Continue Learning</h3>
            <p className="text-xs text-muted">Resume your path</p>
          </Link>
          
          <Link to="/jobs" className="card card-hover flex flex-col items-center justify-center p-6 text-center border border-border group">
            <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Briefcase size={24} />
            </div>
            <h3 className="font-semibold mb-1">Find Jobs</h3>
            <p className="text-xs text-muted">Browse opportunities</p>
          </Link>
          
          <Link to="/interview" className="card card-hover flex flex-col items-center justify-center p-6 text-center border border-border group">
            <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UserCheck size={24} />
            </div>
            <h3 className="font-semibold mb-1">Practice Interview</h3>
            <p className="text-xs text-muted">AI mock interview</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
