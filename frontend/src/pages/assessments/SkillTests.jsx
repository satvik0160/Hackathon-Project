import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Clock, Lock, Star, PlayCircle, 
  CheckCircle, Target, BookOpen, AlertCircle
} from 'lucide-react';
import { assessmentService } from '../../services/api';
import { toast } from 'react-hot-toast';

const SkillTests = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, assessRes, histRes] = await Promise.all([
        assessmentService.getCategories().catch(() => ({ data: [] })),
        assessmentService.getAssessments().catch(() => ({ data: [] })),
        assessmentService.getHistory().catch(() => ({ data: [] }))
      ]);
      
      setCategories([{ id: 'All', name: 'All Categories' }, ...(catsRes.data || [])]);
      setAssessments(assessRes.data || []);
      setHistory(histRes.data || []);
    } catch (error) {
      console.error('Failed to load assessments', error);
      toast.error('Failed to load skill tests');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getHistoryForTest = (testId) => {
    return history.filter(h => h.assessment_id === testId);
  };

  const getBestScore = (testId) => {
    const attempts = getHistoryForTest(testId);
    if (!attempts.length) return null;
    return Math.max(...attempts.map(a => a.score_percentage));
  };

  const isTestLocked = (test) => {
    if (!test.prerequisite_id) return false;
    const prereqScore = getBestScore(test.prerequisite_id);
    return !prereqScore || prereqScore < 80;
  };

  const filteredAssessments = activeCategory === 'All' 
    ? assessments 
    : assessments.filter(a => a.category_id === activeCategory);

  return (
    <div className="page-container">
      <div className="page-header mb-8">
        <h1 className="text-3xl font-bold mb-2">Skill Assessments</h1>
        <p className="text-muted">Validate your skills, earn XP, and unlock new learning paths.</p>
      </div>

      <div className="tabs flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`tab px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
              activeCategory === cat.id 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-auto gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card skeleton-card h-64 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          ))}
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="empty-state text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <BookOpen className="w-16 h-16 text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No tests found</h3>
          <p className="text-muted">No assessments available in this category.</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-auto gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
        >
          {filteredAssessments.map(test => {
            const bestScore = getBestScore(test.id);
            const attemptsCount = getHistoryForTest(test.id).length;
            const locked = isTestLocked(test);

            return (
              <motion.div
                key={test.id}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className={`card relative overflow-hidden flex flex-col p-6 rounded-xl border ${
                  locked ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow'
                }`}
              >
                {locked && (
                  <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                      <Lock className="w-6 h-6 text-gray-500" />
                    </div>
                    <h4 className="font-bold mb-1">Test Locked</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Score 80% in {assessments.find(a => a.id === test.prerequisite_id)?.title || 'prerequisite'} to unlock
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <span className={`badge px-2.5 py-1 text-xs font-semibold rounded-md border ${getDifficultyColor(test.difficulty)}`}>
                    {test.difficulty === 'EASY' && '🟢 '}
                    {test.difficulty === 'MEDIUM' && '🟡 '}
                    {test.difficulty === 'HARD' && '🔴 '}
                    {test.difficulty}
                  </span>
                  {bestScore !== null && (
                    <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                      <Trophy className="w-4 h-4" />
                      {bestScore}%
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold mb-2">{test.title}</h3>
                <p className="text-sm text-muted mb-6 flex-grow">{test.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted flex items-center gap-1"><Target className="w-3 h-3"/> Questions</span>
                    <span className="font-semibold">{test.questions_count || 10}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted flex items-center gap-1"><Clock className="w-3 h-3"/> Time Limit</span>
                    <span className="font-semibold">{test.time_limit_minutes || 15} min</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <button 
                    onClick={() => navigate(`/assessments/${test.id}`)}
                    disabled={locked}
                    className="w-full btn btn-primary flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    <PlayCircle className="w-5 h-5" />
                    {attemptsCount > 0 ? 'Retake Test' : 'Start Test'}
                  </button>
                  {attemptsCount > 0 && (
                    <p className="text-center text-xs text-muted mt-3">
                      Previous attempts: {attemptsCount}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default SkillTests;
