import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Save, X, Award, Book, Star, Activity } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { authService, assessmentService } from '../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    career_goal: user?.career_goal || '',
    experience_level: user?.experience_level || 'beginner'
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await assessmentService.getHistory();
      setHistory(res.data?.history || []);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await authService.updateProfile(formData);
      await refreshProfile();
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const userSkills = typeof user?.skills === 'string' ? JSON.parse(user.skills) : (user?.skills || []);
  
  // Transform skills for Radar Chart (mocking levels if not present)
  const radarData = userSkills.map(skill => ({
    subject: typeof skill === 'object' ? skill.name : skill,
    A: typeof skill === 'object' ? (skill.level || 80) : Math.floor(Math.random() * 40) + 60,
    fullMark: 100,
  })).slice(0, 6); // Max 6 for a good radar chart

  return (
    <div className="page-container py-8">
      {/* Profile Header */}
      <div className="card p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg border-4 border-white">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{user?.username || 'User'}</h1>
              <span className="badge badge-primary">{user?.role || 'Student'}</span>
            </div>
            <p className="text-muted flex items-center gap-2 mb-1">
              {user?.email}
            </p>
            {!isEditing ? (
              <p className="text-sm mt-2 max-w-2xl">{user?.bio || 'No bio provided yet.'}</p>
            ) : (
              <textarea 
                className="form-input mt-2 w-full max-w-2xl" 
                rows="2"
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about yourself..."
              />
            )}
          </div>

          <div className="absolute top-4 right-4">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="btn btn-outline btn-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleSave} className="btn btn-primary btn-sm flex items-center gap-2" disabled={loading}>
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-2 md:grid-4 gap-4 mt-8 pt-6 border-t relative z-10">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Career Goal</p>
            {!isEditing ? (
              <p className="font-semibold">{user?.career_goal || 'Not Set'}</p>
            ) : (
              <input 
                type="text" 
                className="form-input py-1 px-2 text-sm" 
                value={formData.career_goal}
                onChange={e => setFormData({...formData, career_goal: e.target.value})}
              />
            )}
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Experience Level</p>
            {!isEditing ? (
              <p className="font-semibold capitalize">{user?.experience_level || 'Beginner'}</p>
            ) : (
              <select 
                className="form-select py-1 px-2 text-sm"
                value={formData.experience_level}
                onChange={e => setFormData({...formData, experience_level: e.target.value})}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            )}
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Joined</p>
            <p className="font-semibold">{user?.created_at ? format(new Date(user.created_at), 'MMM yyyy') : 'Recently'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Skills & Radar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Skill Profile
            </h3>
            {radarData.length > 2 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Skills" dataKey="A" stroke="#D9AF67" fill="#D9AF67" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state py-8">
                <p className="text-sm">Complete more assessments to generate your skill radar.</p>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Verified Skills
            </h3>
            <div className="space-y-4">
              {userSkills.length > 0 ? userSkills.map((skill, idx) => {
                const name = typeof skill === 'object' ? skill.name : skill;
                const score = typeof skill === 'object' ? (skill.level || 85) : Math.floor(Math.random() * 20) + 80;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium flex items-center gap-1">
                        {name} {score >= 80 && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                      </span>
                      <span className="text-muted">{score}%</span>
                    </div>
                    <div className="progress-track bg-gray-100 rounded-full h-2">
                      <div className="progress-fill bg-primary rounded-full h-full" style={{ width: `${score}%` }}></div>
                    </div>
                  </div>
                )
              }) : (
                <p className="text-sm text-muted">No skills verified yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2">
          <div className="card p-6 h-full">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Book className="w-5 h-5 text-amber-500" /> Assessment History
            </h3>
            
            {historyLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-lg w-full"></div>)}
              </div>
            ) : history.length > 0 ? (
              <div className="table-container">
                <table className="table w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 font-semibold text-muted text-sm">Date</th>
                      <th className="pb-3 font-semibold text-muted text-sm">Assessment</th>
                      <th className="pb-3 font-semibold text-muted text-sm">Score</th>
                      <th className="pb-3 font-semibold text-muted text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-4 text-sm">{format(new Date(record.created_at || Date.now()), 'MMM dd, yyyy')}</td>
                        <td className="py-4 font-medium">{record.assessment?.title || 'Unknown Test'}</td>
                        <td className="py-4 font-bold">{record.score}%</td>
                        <td className="py-4">
                          <span className={`badge ${record.passed ? 'badge-success' : 'badge-danger'}`}>
                            {record.passed ? 'Passed' : 'Needs Review'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state py-12">
                <Book className="w-12 h-12 text-muted opacity-50 mb-4 mx-auto" />
                <h4 className="font-medium mb-1">No Assessment History</h4>
                <p className="text-sm text-muted">Take some skill assessments to see your history here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
