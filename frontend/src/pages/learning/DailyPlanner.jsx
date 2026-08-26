import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Circle, Clock, Video, FileText, Code, Trophy, Map } from 'lucide-react';
import { learningService } from '../../services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const DailyPlanner = () => {
  const [plannerData, setPlannerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanner();
  }, []);

  const fetchPlanner = async () => {
    try {
      setLoading(true);
      const res = await learningService.getDailyPlanner();
      // Assume API returns { targets: [...], completed_count: X, total_count: Y }
      setPlannerData(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load daily planner');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (targetId) => {
    try {
      await learningService.updateProgress({ target_id: targetId, completed: true });
      toast.success('+50 XP Earned! Great job.', { icon: '🌟' });
      // Optimistic update
      setPlannerData(prev => ({
        ...prev,
        completed_count: prev.completed_count + 1,
        targets: prev.targets.map(t => t.id === targetId ? { ...t, status: 'completed' } : t)
      }));
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const getTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'exercise': return <Code className="w-4 h-4" />;
      case 'assessment': return <Trophy className="w-4 h-4" />;
      default: return <Map className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="page-container max-w-3xl mx-auto">
        <div className="skeleton-title w-1/3 h-8 mb-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0"></div>
              <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const targets = plannerData?.targets || [];
  const completed = plannerData?.completed_count || targets.filter(t => t.status === 'completed').length;
  const total = plannerData?.total_count || targets.length;
  const progressPercent = total === 0 ? 0 : (completed / total) * 100;

  return (
    <div className="page-container max-w-3xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <Calendar className="w-5 h-5" />
            <span>{format(new Date(), 'EEEE, MMMM do')}</span>
          </div>
          <h1 className="text-4xl font-bold">Today's Mission</h1>
          <p className="text-muted mt-2">Complete your daily targets to maintain your streak.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 min-w-[200px]">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-semibold text-muted">Progress</span>
            <span className="text-xl font-bold">{completed} <span className="text-sm font-normal text-muted">/ {total}</span></span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {targets.length === 0 ? (
        <div className="empty-state text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No targets for today</h3>
          <p className="text-muted max-w-sm mx-auto mb-6">Take an assessment to generate personalized learning targets for your daily mission.</p>
          <Link to="/assessments" className="btn btn-primary inline-flex items-center gap-2">Go to Assessments</Link>
        </div>
      ) : (
        <div className="timeline relative pl-4 md:pl-8 space-y-8 before:absolute before:inset-0 before:ml-[1.7rem] md:before:ml-[2.7rem] before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
          {targets.map((target, index) => {
            const isCompleted = target.status === 'completed';
            
            return (
              <motion.div 
                key={target.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="timeline-item relative flex items-start gap-6 group"
              >
                <div className={`absolute -left-[1.4rem] md:-left-[0.4rem] mt-1 w-8 h-8 rounded-full border-4 flex items-center justify-center bg-white dark:bg-gray-900 z-10 transition-colors ${
                  isCompleted ? 'border-green-500 text-green-500' : 'border-gray-300 dark:border-gray-600 text-transparent'
                }`}>
                  {isCompleted && <CheckCircle2 className="w-5 h-5 fill-current text-white" />}
                </div>

                <div className={`flex-grow p-5 rounded-2xl border transition-all ${
                  isCompleted 
                    ? 'bg-gray-50/50 dark:bg-gray-800/30 border-transparent opacity-75' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-md flex items-center gap-1 ${
                          isCompleted ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {getTypeIcon(target.type)}
                          <span className="capitalize">{target.type}</span>
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {target.duration || '15 min'}
                        </span>
                      </div>
                      <h3 className={`text-lg font-bold ${isCompleted ? 'line-through text-muted' : ''}`}>
                        {target.title}
                      </h3>
                      {target.description && (
                        <p className="text-sm text-muted mt-1 max-w-xl">{target.description}</p>
                      )}
                    </div>

                    {!isCompleted && (
                      <button 
                        onClick={() => handleComplete(target.id)}
                        className="btn btn-outline hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-900/30 dark:hover:text-green-400 shrink-0 self-start sm:self-center"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailyPlanner;
