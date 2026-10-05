import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Clock, Video, FileText, Code, Trophy, Map, ArrowRight, Wand2, X } from 'lucide-react';
import { learningService, insforge } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const DailyPlanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plannerData, setPlannerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [genDays, setGenDays] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Real stats
  const [realStats, setRealStats] = useState({ tests: 0, videos: 0 });

  useEffect(() => {
    fetchPlannerAndStats();
  }, [user]);

  const fetchPlannerAndStats = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await learningService.getDailyPlanner();
      const raw = res.data;
      let targets = [];
      if (raw && raw.targets && Array.isArray(raw.targets)) {
        targets = raw.targets;
      } else {
        targets = Array.isArray(raw) ? raw : [];
      }

      // Fetch real tests and resources
      const { data: tests } = await insforge.from('user_assessments').select('id').eq('user_id', user.id);
      const { data: resData } = await insforge.from('user_resource_progress').select('id').eq('user_id', user.id).eq('completed', true);
      
      const testsCount = tests ? tests.length : 0;
      const videosCount = resData ? resData.length : 0;
      
      setRealStats({ tests: testsCount, videos: videosCount });
      
      // Auto-tick logic:
      // If the user has 3 tests done in real DB, the first 3 'assessment' targets should be auto-completed.
      let remainingTests = testsCount;
      let remainingVideos = videosCount;
      
      targets = targets.map(t => {
        if (t.status !== 'completed') {
          if (t.type === 'assessment' && remainingTests > 0) {
            remainingTests--;
            return { ...t, autoCompleted: true };
          }
          if ((t.type === 'video' || t.type === 'article' || t.type === 'learning') && remainingVideos > 0) {
            remainingVideos--;
            return { ...t, autoCompleted: true };
          }
        }
        return t;
      });

      setPlannerData({ 
        targets, 
        completed_count: targets.filter(t => t.status === 'completed' || t.autoCompleted).length, 
        total_count: targets.length 
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to load daily planner');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTimetable = async (e, directGoal = null) => {
    e?.preventDefault();
    const activeGoal = directGoal || user?.career_goal || 'Software Engineering';
    
    try {
      setIsGenerating(true);
      toast.loading('AI is generating your timetable...', { id: 'gen_timetable' });
      await learningService.generateTimetable(activeGoal, genDays);
      toast.success('Timetable generated successfully!', { id: 'gen_timetable' });
      setShowGenerator(false);
      fetchPlannerAndStats();
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate timetable', { id: 'gen_timetable' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = async (targetId) => {
    try {
      await learningService.updateProgress({ target_id: targetId, completed: true });
      toast.success('+50 XP Earned! Great job.', { icon: '🌟' });
      // Optimistic update
      setPlannerData(prev => ({
        ...prev,
        completed_count: (prev?.completed_count || 0) + 1,
        targets: (prev?.targets || []).map(t => t.id === targetId ? { ...t, status: 'completed' } : t)
      }));
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleStart = (type) => {
    if (type === 'assessment') navigate('/assessments');
    else if (type === 'learning' || type === 'video' || type === 'article') navigate('/roadmap');
    else if (type === 'mock-interview') navigate('/interview');
    else if (type === 'resume') navigate('/resume');
    else navigate('/arcade'); 
  };

  const getTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'exercise': return <Code className="w-4 h-4" />;
      case 'assessment': return <Trophy className="w-4 h-4" />;
      case 'mock-interview': return <Video className="w-4 h-4" />;
      case 'resume': return <FileText className="w-4 h-4" />;
      default: return <Map className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="page-container max-w-3xl mx-auto py-8">
        <div className="skeleton-title w-1/3 h-8 mb-8 bg-gray-200 animate-pulse rounded"></div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse shrink-0"></div>
              <div className="w-full h-24 bg-gray-200 animate-pulse rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const targets = plannerData?.targets || [];
  
  const groupedTargets = targets.reduce((acc, target) => {
    const d = target.target_date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(target);
    return acc;
  }, {});
  const sortedDates = Object.keys(groupedTargets).sort();

  const completed = plannerData?.completed_count || targets.filter(t => t.status === 'completed' || t.autoCompleted).length;
  const total = plannerData?.total_count || targets.length;
  const progressPercent = total === 0 ? 0 : (completed / total) * 100;

  return (
    <div className="page-container max-w-3xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <Calendar className="w-5 h-5" />
            <span>AI-Generated Schedule</span>
          </div>
          <h1 className="text-4xl font-bold">Your Mission Timeline</h1>
          <p className="text-muted mt-2">Complete your daily targets to maintain your streak.</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[200px]">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-semibold text-muted">Progress</span>
            <span className="text-xl font-bold">{completed} <span className="text-sm font-normal text-muted">/ {total}</span></span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        {!showGenerator ? (
          <button 
            onClick={() => setShowGenerator(true)} 
            className="btn btn-outline w-full md:w-auto flex items-center justify-center gap-2 border-primary/30 text-primary hover:bg-primary/5"
          >
            <Wand2 className="w-4 h-4" /> 
            Generate AI Timetable
          </button>
        ) : (
          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 relative">
            <button onClick={() => setShowGenerator(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-primary">
              <Wand2 className="w-5 h-5" />
              AI Timetable Generator
            </h3>
            <p className="text-muted text-sm mb-4">Let AI build a personalized multi-day plan for your domain ({user?.career_goal || 'Software Engineering'}) to hit your goal.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={(e) => handleGenerateTimetable(e, user?.career_goal || 'Software Engineering')} 
                className="btn btn-primary whitespace-nowrap" 
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate 7-Day Plan'}
              </button>
            </div>
          </div>
        )}
      </div>

      {targets.length === 0 ? (
        <div className="empty-state text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300 ">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No targets for today</h3>
          <p className="text-muted max-w-sm mx-auto mb-6">Take an assessment to generate personalized learning targets for your daily mission.</p>
          <Link to="/assessments" className="btn btn-primary inline-flex items-center gap-2">Go to Assessments</Link>
        </div>
      ) : (
        <div className="space-y-12">
          {sortedDates.map((dateStr, dateIndex) => (
            <div key={dateStr}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                <Calendar className="w-5 h-5 text-primary" />
                {format(new Date(dateStr), 'EEEE, MMMM do')}
              </h2>
              <div className="timeline relative pl-4 md:pl-8 space-y-8 before:absolute before:inset-0 before:ml-[1.7rem] md:before:ml-[2.7rem] before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-200">
                {groupedTargets[dateStr].map((target, index) => {
                  const isCompleted = target.status === 'completed' || target.autoCompleted;
                  
                  return (
                    <motion.div 
                      key={target.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="timeline-item relative flex items-start gap-6 group"
                    >
                      <div className={`absolute -left-[1.4rem] md:-left-[0.4rem] mt-1 w-8 h-8 rounded-full border-4 flex items-center justify-center bg-white z-10 transition-colors ${
                        isCompleted ? 'border-green-500 text-green-500' : 'border-gray-300 text-transparent'
                      }`}>
                        {isCompleted && <CheckCircle2 className="w-5 h-5 fill-current text-white" />}
                      </div>

                      <div className={`flex-grow p-5 rounded-2xl border transition-all ${
                        isCompleted 
                          ? 'bg-gray-50/50 border-transparent opacity-75' 
                          : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-md flex items-center gap-1 ${
                                isCompleted ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700 '
                              }`}>
                                {getTypeIcon(target.type)}
                                <span className="capitalize">{target.type}</span>
                              </span>
                              <span className="text-xs text-muted flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {target.duration || '15 min'}
                              </span>
                              {target.autoCompleted && (
                                <span className="text-xs font-bold text-green-600 border border-green-200 bg-green-50 px-2 py-0.5 rounded-full">
                                  Auto-Synced from Activity
                                </span>
                              )}
                            </div>
                            <h3 className={`text-lg font-bold ${isCompleted ? 'line-through text-muted' : ''}`}>
                              {target.title}
                            </h3>
                            {target.description && (
                              <p className="text-sm text-muted mt-1 max-w-xl">{target.description}</p>
                            )}
                          </div>

                          {!isCompleted && (
                            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                              <button 
                                onClick={() => handleStart(target.type)}
                                className="btn btn-primary shrink-0 flex items-center gap-1"
                              >
                                Start <ArrowRight className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleComplete(target.id)}
                                className="btn btn-outline hover:bg-green-50 hover:text-green-700 hover:border-green-300 shrink-0"
                              >
                                Mark Done
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyPlanner;
