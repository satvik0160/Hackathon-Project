import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Map, Gamepad2, Brain, Star, AlertTriangle, CheckCircle, XCircle, ArrowRight, ArrowLeft, Trophy, Flame, Smartphone } from 'lucide-react';
import { assessmentService, insforge } from '../../services/api';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { Editor } from '@monaco-editor/react';

const TestQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchAssessment();
    return () => clearInterval(timerRef.current);
  }, [id]);

  useEffect(() => {
    if (assessment && !result && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [assessment, result, timeLeft]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const res = await assessmentService.getAssessmentById(id);
      setAssessment(res.data);
      setTimeLeft((res.data.time_limit_minutes || 15) * 60);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load assessment');
      navigate('/assessments');
    } finally {
      setLoading(false);
    }
  };

  const [feedback, setFeedback] = useState({});

  const handleSelectOption = async (optionLetter) => {
    if (result) return;
    const qId = assessment.questions[currentQuestionIndex].id;
    // Lock answer
    if (answers[qId]) return; 

    setAnswers(prev => ({ ...prev, [qId]: optionLetter }));
    
    if (assessment.questions[currentQuestionIndex].question_type !== 'coding') {
      try {
        const res = await assessmentService.checkSingleAnswer(qId, optionLetter);
        setFeedback(prev => ({ ...prev, [qId]: res.data }));
      } catch (e) {
        console.error('Feedback check failed', e);
      }
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && Object.keys(answers).length < assessment.questions.length) {
      if (!window.confirm('You have unanswered questions. Are you sure you want to submit?')) {
        return;
      }
    }

    try {
      setIsSubmitting(true);
      clearInterval(timerRef.current);
      const timeTaken = (assessment.time_limit_minutes * 60) - timeLeft;
      
      // Capture previous stats for delta display
      let prevStats = { total_points: 0, skill_level: 1, skill_score_percent: 0 };
      try {
        const { data: userData } = await insforge.auth.getCurrentUser();
        if (userData?.user?.id) {
          const { data: userRow } = await insforge.from('users').select('total_points, skill_level, skill_score_percent').eq('id', userData.user.id).single();
          if (userRow) prevStats = userRow;
        }
      } catch (e) { /* ignore */ }
      
      const res = await assessmentService.submitAssessment(id, {
        answers,
        time_taken_seconds: timeTaken
      });
      
      setResult({ ...res.data, prevStats });
      toast.success('Assessment submitted successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!assessment) return null;

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <Smartphone className="w-16 h-16 text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Desktop Required</h2>
        <p className="text-text-secondary mb-6">
          This technical assessment features an integrated code editor that requires a larger screen. Please switch to a desktop or tablet in landscape mode.
        </p>
        <button onClick={() => navigate('/assessments')} className="btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  if (result) {
    const xpEarned = result.xp_earned || 0;
    const prevPoints = result.prevStats?.total_points || 0;
    const newPoints = result.total_points ?? prevPoints;
    const pointsGained = newPoints - prevPoints;
    const prevLevel = result.prevStats?.skill_level || 1;
    const newLevel = result.skill_level ?? prevLevel;
    const leveledUp = newLevel > prevLevel;
    const prevSkillPercent = result.prevStats?.skill_score_percent || 0;
    const newSkillPercent = result.skill_score_percent ?? prevSkillPercent;
    const skillDelta = newSkillPercent - prevSkillPercent;
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 text-center">
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-8 text-white">
            <Trophy className="w-20 h-20 mx-auto mb-4 text-amber-300" />
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Test Completed!</h1>
            <p className="text-xl opacity-90">You scored {result.score_percentage}%</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8">
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-muted text-sm mb-1">Correct</span>
              <span className="text-2xl font-bold text-green-600">{result.correct_count}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-muted text-sm mb-1">Incorrect</span>
              <span className="text-2xl font-bold text-red-600">{assessment.questions.length - result.correct_count}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-muted text-sm mb-1">XP Earned</span>
              <span className="text-2xl font-bold text-purple-600">+{xpEarned}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-muted text-sm mb-1">Level</span>
              <span className="text-2xl font-bold text-indigo-600 flex items-center gap-1">
                {newLevel}
                {leveledUp && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold animate-bounce">LEVEL UP!</span>}
              </span>
            </div>
          </div>

          {/* Skill Score Improvement Section */}
          {(pointsGained > 0 || skillDelta !== 0) && (
            <div className="px-8 pb-8">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-4">Skill Score Improvement</h3>
                <div className="flex items-center justify-center gap-4 text-lg">
                  <span className="text-slate-400 font-semibold">{prevSkillPercent}%</span>
                  <span className="text-2xl">→</span>
                  <span className="text-indigo-700 font-bold text-2xl">{newSkillPercent}%</span>
                  {skillDelta > 0 && (
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-sm">+{skillDelta}%</span>
                  )}
                </div>
                <div className="mt-4 w-full bg-indigo-100 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: `${prevSkillPercent}%` }}
                    animate={{ width: `${newSkillPercent}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  />
                </div>
                {pointsGained > 0 && (
                  <p className="text-xs text-indigo-500 mt-2 font-medium">+{pointsGained} total points earned</p>
                )}
              </div>
            </div>
          )}
        </div>

        <h3 className="text-2xl font-bold mb-6">Question Review</h3>
        <div className="space-y-6">
          {assessment.questions.map((q, idx) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correct_option;
            
            return (
              <div key={q.id} className={`p-6 rounded-xl border ${isCorrect ? 'border-green-200 bg-green-50/30 ' : 'border-red-200 bg-red-50/30 '}`}>
                <div className="flex gap-4 items-start">
                  {isCorrect ? <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-1" /> : <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />}
                  <div>
                    <h4 className="font-semibold mb-4 text-lg">
                      <span className="text-muted mr-2">{idx + 1}.</span>
                      {q.question_text}
                    </h4>
                    <div className="grid gap-2 mb-4">
                      {['A', 'B', 'C', 'D'].map((opt, optIdx) => {
                        const isSelected = userAnswer === opt;
                        const isActualCorrect = q.correct_option === opt;
                        
                        let optText = q[`option_${opt.toLowerCase()}`];
                        if (!optText && q.options && Array.isArray(q.options)) {
                          optText = q.options[optIdx];
                        }

                        let style = {};
                        if (isActualCorrect) {
                          style = { backgroundColor: '#dcfce7', borderColor: '#22c55e', borderWidth: '2px', color: '#166534', fontWeight: 600 };
                        } else if (isSelected && !isActualCorrect) {
                          style = { backgroundColor: '#fef2f2', borderColor: '#ef4444', borderWidth: '2px', color: '#991b1b' };
                        }
                        
                        return (
                          <div key={opt} className="p-3 rounded-lg text-sm border border-gray-200 " style={style}>
                            <span className="font-bold mr-2">{opt}:</span> {optText || `Option ${opt}`}
                            {isActualCorrect && <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />}
                            {isSelected && !isActualCorrect && <XCircle className="w-4 h-4 text-red-600 inline ml-2" />}
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                        <span className="font-bold">Explanation:</span> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button onClick={() => navigate('/assessments')} className="btn btn-outline py-3 px-6">Back to Tests</button>
          <button onClick={() => navigate('/roadmap')} className="btn btn-primary py-3 px-6">View Learning Path</button>
        </div>
        </div>
        <div className="space-y-6">
          <div className="card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" /> What's Next?
            </h3>
            <p className="text-slate-600 text-sm mb-6">Based on your performance, here are some recommended actions to boost your skills further.</p>
            
            <div className="space-y-4">
              <button onClick={() => navigate('/roadmap')} className="w-full text-left p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Map className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Update Learning Path</h4>
                  <p className="text-xs text-slate-500">Refine your roadmap based on these results.</p>
                </div>
              </button>
              
              <button onClick={() => navigate('/arcade')} className="w-full text-left p-4 rounded-xl border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50 transition-colors flex gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Gamepad2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Code Arcade</h4>
                  <p className="text-xs text-slate-500">Practice your skills in gamified challenges.</p>
                </div>
              </button>
              
              <button onClick={() => navigate('/assessments')} className="w-full text-left p-4 rounded-xl border border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-colors flex gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Take Another Test</h4>
                  <p className="text-xs text-slate-500">Validate more skills to earn XP.</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const currentQ = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / assessment.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-[80vh] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">{assessment.title}</h2>
          <p className="text-muted text-sm">Question {currentQuestionIndex + 1} of {assessment.questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-semibold ${timeLeft < 60 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-700 '}`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="w-full bg-gray-200 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="mb-8"
          >
            <div className="text-2xl font-medium mb-8 leading-relaxed">
              <ReactMarkdown className="markdown-body">{currentQ.question_text}</ReactMarkdown>
            </div>
            
            {currentQ.question_type === 'coding' ? (
              <div className="h-[400px] border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  theme="vs-dark"
                  value={answers[currentQ.id] || ''}
                  onChange={(val) => setAnswers(prev => ({ ...prev, [currentQ.id]: val }))}
                  options={{ minimap: { enabled: false }, fontSize: 16 }}
                />
              </div>
            ) : (
              <div className="grid gap-4">
                {['A', 'B', 'C', 'D'].map((opt, index) => {
                  const isSelected = answers[currentQ.id] === opt;
                  const qFeedback = feedback[currentQ.id];
                  const isLocked = !!answers[currentQ.id];
                  
                  let optText = currentQ[`option_${opt.toLowerCase()}`];
                  if (!optText && currentQ.options && Array.isArray(currentQ.options)) {
                    optText = currentQ.options[index];
                  }

                  // Determine feedback state
                  const isCorrectOption = qFeedback && qFeedback.correct_option === opt;
                  const isWrongSelected = qFeedback && isSelected && qFeedback.correct_option !== opt;

                  // Build inline style for guaranteed visibility
                  let inlineStyle = {};
                  if (isCorrectOption) {
                    inlineStyle = {
                      backgroundColor: '#dcfce7',
                      borderColor: '#22c55e',
                      borderWidth: '3px',
                      color: '#166534',
                    };
                  } else if (isWrongSelected) {
                    inlineStyle = {
                      backgroundColor: '#fef2f2',
                      borderColor: '#ef4444',
                      borderWidth: '3px',
                      color: '#991b1b',
                    };
                  } else if (isLocked && !isCorrectOption) {
                    inlineStyle = { opacity: 0.45 };
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      disabled={isLocked}
                      className={`quiz-option w-full ${isSelected && !qFeedback ? 'selected' : ''}`}
                      style={inlineStyle}
                    >
                      <span className="quiz-option-letter">{opt}</span>
                      <span className="text-lg flex-1 text-left">{optText || `Option ${opt}`}</span>
                      {isCorrectOption && <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />}
                      {isWrongSelected && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 ">
        <button
          onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
          disabled={currentQuestionIndex === 0}
          className="btn btn-outline flex items-center gap-2 px-6 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {currentQuestionIndex === assessment.questions.length - 1 ? (
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="btn btn-primary flex items-center gap-2 px-8 py-3 font-bold bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'} <CheckCircle className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIndex(p => Math.min(assessment.questions.length - 1, p + 1))}
            className="btn btn-primary flex items-center gap-2 px-6"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TestQuiz;
