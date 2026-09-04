import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { jobService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, Users, BarChart2, Lock, MapPin, Building, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const IndustryDashboard = () => {
  const { isIndustry } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '', description: '', job_type: 'Full-time', location: '', 
    is_remote: false, required_skills: '', salary_range: '', deadline: ''
  });

  const mockSkillIntelligence = [
    { skill: 'React', demand: 95, supply: 60, critical: true },
    { skill: 'Python', demand: 85, supply: 75, critical: false },
    { skill: 'TypeScript', demand: 90, supply: 45, critical: true },
    { skill: 'AWS', demand: 80, supply: 40, critical: true },
    { skill: 'Node.js', demand: 75, supply: 65, critical: false }
  ];

  useEffect(() => {
    if (!isIndustry) {
      setLoading(false);
      return;
    }

    const fetchJobs = async () => {
      setLoading(true);
      try {
        try {
          const res = await jobService.getListings();
          setJobs(res.data || []);
        } catch (err) {
          setJobs([
            { id: 1, title: 'Senior Frontend Developer', status: 'Active', applications: 24, location: 'Remote', created_at: '2026-08-15' },
            { id: 2, title: 'Backend Engineer (Node.js)', status: 'Closed', applications: 56, location: 'New York, NY', created_at: '2026-07-20' },
          ]);
        }
      } catch (err) {
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [isIndustry]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      // Mock API call to post job
      // await jobService.postJob({...formData});
      toast.success('Job posted successfully!');
      setActiveTab('jobs');
      setJobs([{ 
        id: Date.now(), 
        title: formData.title, 
        status: 'Active', 
        applications: 0, 
        location: formData.is_remote ? 'Remote' : formData.location, 
        created_at: new Date().toISOString() 
      }, ...jobs]);
      setFormData({ title: '', description: '', job_type: 'Full-time', location: '', is_remote: false, required_skills: '', salary_range: '', deadline: '' });
    } catch (err) {
      toast.error('Failed to post job');
    }
  };

  if (!isIndustry) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Lock className="w-16 h-16 text-muted mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted">You need Industry Partner privileges to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-12 w-48 mb-6"></div>
        <div className="skeleton h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold">Industry Partner Dashboard</h1>
        <p className="text-muted">Manage your job listings and discover top talent</p>
      </div>

      <div className="tabs flex gap-4 mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button className={`tab px-4 py-2 font-medium ${activeTab === 'jobs' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-foreground'}`} onClick={() => setActiveTab('jobs')}>My Jobs</button>
        <button className={`tab px-4 py-2 font-medium ${activeTab === 'post' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-foreground'}`} onClick={() => setActiveTab('post')}>Post Job</button>
        <button className={`tab px-4 py-2 font-medium ${activeTab === 'candidates' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-foreground'}`} onClick={() => setActiveTab('candidates')}>Candidates</button>
        <button className={`tab px-4 py-2 font-medium ${activeTab === 'intelligence' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-foreground'}`} onClick={() => setActiveTab('intelligence')}>Skill Intelligence</button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'jobs' && (
          <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {jobs.length === 0 ? (
              <div className="empty-state text-center py-12">
                <Briefcase className="w-12 h-12 mx-auto text-muted mb-4" />
                <h3 className="text-lg font-medium">No jobs posted yet</h3>
                <button className="btn btn-primary mt-4" onClick={() => setActiveTab('post')}>Post your first job</button>
              </div>
            ) : (
              <div className="grid grid-2 gap-4">
                {jobs.map(job => (
                  <div key={job.id} className="card p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="card-title text-lg font-bold">{job.title}</h3>
                      <span className={`badge px-2 py-1 text-xs rounded-full font-medium ${job.status === 'Active' ? 'bg-success/20 text-success' : 'bg-neutral-500/20 text-neutral-500'}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted mb-4">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {job.location}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {job.applications} applicants</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-outline">View Applicants</button>
                      <button className="btn btn-sm btn-ghost">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'post' && (
          <motion.div key="post" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card p-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="w-5 h-5"/> Create New Job Listing</h2>
            <form onSubmit={handlePostJob} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input type="text" required className="form-input w-full" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select className="form-select w-full p-2 border rounded-lg bg-background" value={formData.job_type} onChange={e => setFormData({...formData, job_type: e.target.value})}>
                    <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input type="date" required className="form-input w-full" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" className="form-input w-full" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="form-input w-4 h-4" checked={formData.is_remote} onChange={e => setFormData({...formData, is_remote: e.target.checked})} />
                <span>Is Remote?</span>
              </label>
              <div className="form-group">
                <label className="form-label">Required Skills (comma separated)</label>
                <input type="text" required placeholder="React, Node.js, AWS" className="form-input w-full" value={formData.required_skills} onChange={e => setFormData({...formData, required_skills: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Salary Range</label>
                <input type="text" placeholder="$80,000 - $120,000" className="form-input w-full" value={formData.salary_range} onChange={e => setFormData({...formData, salary_range: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea required className="form-input w-full h-32 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn btn-primary w-full">Post Job</button>
            </form>
          </motion.div>
        )}

        {activeTab === 'candidates' && (
          <motion.div key="candidates" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="empty-state text-center py-20">
            <Users className="w-16 h-16 mx-auto text-primary mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Candidate Matching</h2>
            <p className="text-muted max-w-md mx-auto">Our AI is analyzing student profiles to find the perfect matches for your jobs. This feature will be available soon.</p>
          </motion.div>
        )}

        {activeTab === 'intelligence' && (
          <motion.div key="intelligence" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><BarChart2 className="w-5 h-5"/> Industry Skill Intelligence</h2>
            <p className="text-muted mb-6">Compare industry demand against the current student talent supply across the platform.</p>
            
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockSkillIntelligence} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="skill" type="category" width={100} tick={{fill: 'currentColor'}} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff'}} />
                  <Legend />
                  <Bar dataKey="demand" name="Industry Demand" fill="#D9AF67" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="supply" name="Student Supply" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold mb-4">Critical Skill Gaps</h3>
              <div className="flex flex-wrap gap-2">
                {mockSkillIntelligence.filter(s => s.critical).map(skill => (
                  <span key={skill.skill} className="badge bg-danger/10 text-danger border border-danger/20 px-3 py-1 rounded-full text-sm">
                    {skill.skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IndustryDashboard;
