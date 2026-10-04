import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsService } from '../../services/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, GraduationCap, AlertTriangle, Briefcase, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const InstitutionDashboard = () => {
  const { isInstitution } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isInstitution) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getInstitutionAnalytics();
        setData(res.data && Object.keys(res.data).length > 0 ? res.data : null);
      } catch (err) {
        const status = err?.statusCode || err?.status;
        if (status === 403 || /access denied/i.test(err?.message || '')) {
          setError('Access Denied: You do not have permission to view this dashboard.');
        } else {
          setError('Failed to load dashboard data.');
          toast.error('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isInstitution]);

  if (!isInstitution) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Lock className="w-16 h-16 text-muted mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted">You need Institution Admin privileges to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-12 w-1/3 mb-6"></div>
        <div className="grid grid-4 gap-4 mb-6">
          <div className="skeleton h-32 rounded-lg"></div>
          <div className="skeleton h-32 rounded-lg"></div>
          <div className="skeleton h-32 rounded-lg"></div>
          <div className="skeleton h-32 rounded-lg"></div>
        </div>
        <div className="grid grid-2 gap-6">
          <div className="skeleton h-80 rounded-lg"></div>
          <div className="skeleton h-80 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="w-16 h-16 text-danger mb-4" />
        <h1 className="text-2xl font-bold mb-2">Error Loading Dashboard</h1>
        <p className="text-muted">{error}</p>
      </div>
    );
  }

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'Strong': return 'text-success bg-success/10';
      case 'Moderate': return 'text-warning bg-warning/10';
      case 'Weak': return 'text-danger bg-danger/10';
      case 'Missing': return 'text-neutral-500 bg-neutral-500/10';
      default: return '';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold">Institution Dashboard</h1>
        <p className="text-muted">Analytics and insights for your student body</p>
      </div>

      <div className="grid grid-4 gap-4 mb-6">
        <motion.div className="stat-card card p-4 flex items-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="p-3 bg-primary/10 rounded-full text-primary"><Users className="w-6 h-6" /></div>
          <div>
            <div className="text-muted text-sm">Total Students</div>
            <div className="text-2xl font-bold">{data?.stats?.totalStudents}</div>
          </div>
        </motion.div>
        <motion.div className="stat-card card p-4 flex items-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="p-3 bg-success/10 rounded-full text-success"><GraduationCap className="w-6 h-6" /></div>
          <div>
            <div className="text-muted text-sm">Avg Readiness</div>
            <div className="text-2xl font-bold">{data?.stats?.averageScore}%</div>
          </div>
        </motion.div>
        <motion.div className="stat-card card p-4 flex items-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="p-3 bg-danger/10 rounded-full text-danger"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <div className="text-muted text-sm">Top Skill Gaps</div>
            <div className="text-2xl font-bold">{data?.stats?.topGaps}</div>
          </div>
        </motion.div>
        <motion.div className="stat-card card p-4 flex items-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="p-3 bg-accent/10 rounded-full text-accent"><Briefcase className="w-6 h-6" /></div>
          <div>
            <div className="text-muted text-sm">Placement Ready</div>
            <div className="text-2xl font-bold">{data?.stats?.placementReadiness}%</div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-2 gap-6 mb-6">
        <motion.div className="card p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h2 className="card-title mb-4">Industry Demand vs Student Supply (Skill Gaps)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.skillGaps || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="skill" type="category" width={100} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="required" name="Industry Demand" fill="#8884d8" />
                <Bar dataKey="current" name="Student Supply" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="card p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <h2 className="card-title mb-4">Student Career Goals</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.careerDistribution || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                  {(data?.careerDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-2 gap-6">
        <motion.div className="card p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <h2 className="card-title mb-4">Curriculum Alignment</h2>
          <div className="table-container">
            <table className="table w-full">
              <thead>
                <tr className="text-left border-b border-neutral-200 ">
                  <th className="pb-2">Topic</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.curriculumAlignment || []).map((item, idx) => (
                  <tr key={idx} className="border-b border-neutral-100 last:border-0">
                    <td className="py-3">{item.topic}</td>
                    <td className="py-3">
                      <span className={`badge px-2 py-1 rounded-md text-xs font-semibold ${getRatingColor(item.rating)}`}>
                        {item.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div className="card p-4 bg-primary/5 border-primary/20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <h2 className="card-title mb-4">Recommendations</h2>
          {(!data?.skillGaps || data.skillGaps.length === 0) ? (
            <p className="text-sm text-muted">No skill gaps detected yet — collect more student assessment data.</p>
          ) : (
            <ul className="space-y-4">
              {data.skillGaps.slice(0, 3).map((gap) => (
                <li key={gap.skill} className="flex items-start gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg mt-1"><GraduationCap className="w-4 h-4 text-primary" /></div>
                  <div>
                    <h4 className="font-semibold text-sm">{gap.skill}</h4>
                    <p className="text-xs text-muted">
                      Industry demand {gap.required}% vs student supply {gap.current}% — consider a targeted workshop.
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default InstitutionDashboard;
