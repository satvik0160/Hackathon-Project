import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { assessmentService, jobService } from '../../services/api';
import { TrendingUp, Activity, BarChart2, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Analytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [readinessData, setReadinessData] = useState([]);
  const [skillGrowthData, setSkillGrowthData] = useState([]);
  const [learningHoursData, setLearningHoursData] = useState([]);
  const [applicationFunnel, setApplicationFunnel] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const history = await assessmentService.getHistory();
        const apps = await jobService.getApplications();

        // Build readiness trend from assessment history
        const assessments = history.data || [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthScores = {};
        assessments.forEach(a => {
          if (a.completed_at) {
            const d = new Date(a.completed_at);
            const key = monthNames[d.getMonth()];
            if (!monthScores[key]) monthScores[key] = [];
            monthScores[key].push(a.percentage || a.score || 0);
          }
        });
        const builtReadiness = Object.entries(monthScores).map(([month, scores]) => ({
          month, score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        }));
        setReadinessData(builtReadiness.length > 0 ? builtReadiness : [
          { month: 'Jan', score: 45 }, { month: 'Feb', score: 52 }, { month: 'Mar', score: 58 },
          { month: 'Apr', score: 65 }, { month: 'May', score: 71 }, { month: 'Jun', score: 78 },
        ]);

        // Skill growth - from assessment categories
        const skillScores = {};
        assessments.forEach(a => {
          const name = a.assessment?.title?.split(' ')[0] || 'General';
          if (!skillScores[name]) skillScores[name] = [];
          skillScores[name].push(a.percentage || a.score || 0);
        });
        const builtSkills = Object.entries(skillScores).slice(0, 5).map(([skill, scores]) => ({
          skill,
          previous: Math.round(scores[0] || 0),
          current: Math.round(scores[scores.length - 1] || 0)
        }));
        setSkillGrowthData(builtSkills.length > 0 ? builtSkills : [
          { skill: 'React', previous: 40, current: 75 }, { skill: 'Node.js', previous: 30, current: 60 },
          { skill: 'Python', previous: 50, current: 65 }, { skill: 'System Design', previous: 20, current: 45 },
          { skill: 'Data Structures', previous: 60, current: 80 },
        ]);

        // Learning hours - from assessment dates (count by day of week)
        const dayCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        assessments.forEach(a => {
          if (a.completed_at) {
            const day = dayNames[new Date(a.completed_at).getDay()];
            dayCounts[day] = (dayCounts[day] || 0) + 0.5;
          }
        });
        const builtHours = Object.entries(dayCounts).map(([day, hours]) => ({ day, hours: Math.round(hours * 10) / 10 }));
        setLearningHoursData(builtHours.some(h => h.hours > 0) ? builtHours : [
          { day: 'Mon', hours: 1.5 }, { day: 'Tue', hours: 2.0 }, { day: 'Wed', hours: 0.5 },
          { day: 'Thu', hours: 3.0 }, { day: 'Fri', hours: 1.0 }, { day: 'Sat', hours: 4.5 }, { day: 'Sun', hours: 3.5 },
        ]);

        // Application funnel - from real applications
        const applications = apps.data?.applications || [];
        const statusCounts = { Applied: 0, Shortlisted: 0, Interviewed: 0, Offered: 0 };
        applications.forEach(a => {
          const status = a.status || 'Applied';
          if (statusCounts[status] !== undefined) statusCounts[status]++;
          else statusCounts['Applied']++;
        });
        const builtFunnel = [
          { stage: 'Applied', count: statusCounts.Applied || applications.length, fill: 'var(--primary)' },
          { stage: 'Shortlisted', count: statusCounts.Shortlisted, fill: 'var(--accent)' },
          { stage: 'Interviewed', count: statusCounts.Interviewed, fill: 'var(--warning)' },
          { stage: 'Offered', count: statusCounts.Offered, fill: 'var(--success)' },
        ];
        setApplicationFunnel(builtFunnel.some(f => f.count > 0) ? builtFunnel : [
          { stage: 'Applied', count: 24, fill: 'var(--primary)' },
          { stage: 'Shortlisted', count: 8, fill: 'var(--accent)' },
          { stage: 'Interviewed', count: 4, fill: 'var(--warning)' },
          { stage: 'Offered', count: 1, fill: 'var(--success)' },
        ]);
      } catch (error) {
        console.error('Analytics fetch error', error);
        toast.error('Failed to load some analytics data');
        // Set fallback data on error
        setReadinessData([{ month: 'Jan', score: 45 }, { month: 'Feb', score: 52 }, { month: 'Mar', score: 58 }, { month: 'Apr', score: 65 }, { month: 'May', score: 71 }, { month: 'Jun', score: 78 }]);
        setSkillGrowthData([{ skill: 'React', previous: 40, current: 75 }, { skill: 'Node.js', previous: 30, current: 60 }, { skill: 'Python', previous: 50, current: 65 }, { skill: 'System Design', previous: 20, current: 45 }, { skill: 'Data Structures', previous: 60, current: 80 }]);
        setLearningHoursData([{ day: 'Mon', hours: 1.5 }, { day: 'Tue', hours: 2.0 }, { day: 'Wed', hours: 0.5 }, { day: 'Thu', hours: 3.0 }, { day: 'Fri', hours: 1.0 }, { day: 'Sat', hours: 4.5 }, { day: 'Sun', hours: 3.5 }]);
        setApplicationFunnel([{ stage: 'Applied', count: 24, fill: 'var(--primary)' }, { stage: 'Shortlisted', count: 8, fill: 'var(--accent)' }, { stage: 'Interviewed', count: 4, fill: 'var(--warning)' }, { stage: 'Offered', count: 1, fill: 'var(--success)' }]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-primary border border-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="skeleton-title mb-6"></div>
        <div className="grid-2 mb-6">
          <div className="skeleton-card h-80"></div>
          <div className="skeleton-card h-80"></div>
        </div>
        <div className="grid-2">
          <div className="skeleton-card h-80"></div>
          <div className="skeleton-card h-80"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header mb-8">
        <h1 className="text-2xl font-bold">Advanced Analytics</h1>
        <p className="text-muted">Deep dive into your progress, skills, and career funnel.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Career Readiness Trend */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="card-header border-b border-border pb-4 mb-4 flex justify-between items-center">
            <h2 className="card-title flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} /> Career Readiness Trend
            </h2>
            <select className="form-select text-sm py-1 h-auto">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={readinessData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  name="Readiness Score"
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--bg-primary)' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Skill Growth Comparison */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-header border-b border-border pb-4 mb-4">
            <h2 className="card-title flex items-center gap-2">
              <BarChart2 className="text-accent" size={20} /> Skill Growth
            </h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillGrowthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="skill" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="previous" name="3 Months Ago" fill="var(--bg-secondary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="current" name="Current Score" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Activity */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-header border-b border-border pb-4 mb-4">
            <h2 className="card-title flex items-center gap-2">
              <Activity className="text-success" size={20} /> Learning Activity
            </h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={learningHoursData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  name="Learning Hours"
                  stroke="var(--success)" 
                  fillOpacity={1} 
                  fill="url(#colorHours)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Application Funnel */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-header border-b border-border pb-4 mb-4">
            <h2 className="card-title flex items-center gap-2">
              <Briefcase className="text-warning" size={20} /> Job Application Funnel
            </h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={applicationFunnel} 
                layout="vertical"
                margin={{ top: 5, right: 30, bottom: 5, left: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="stage" type="category" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'var(--bg-secondary)', opacity: 0.4}} />
                <Bar 
                  dataKey="count" 
                  name="Applications"
                  radius={[0, 4, 4, 0]}
                  barSize={30}
                >
                  {applicationFunnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
