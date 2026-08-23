import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle, XCircle, ArrowRight, ArrowLeft, Trophy, Flame, Smartphone } from 'lucide-react';
import { assessmentService } from '../../services/api';
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

  const handleSelectOption = (optionLetter) => {
    if (result) return;
    const qId = assessment.questions[currentQuestionIndex].id;
    setAnswers(prev => ({ ...prev, [qId]: optionLetter }));
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
      
      const res = await assessmentService.submitAssessment(id, {
        answers,
        time_taken_seconds: timeTaken
      });
      
      setResult(res.data);
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
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto p-6"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8 text-center">
          <div className="bg-gradient-to-r from-primary to-accent p-8 text-white">
            <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-300" />
            <h1 className="text-4xl font-bold mb-2">Test Completed!</h1>
            <p className="text-xl opacity-90">You scored {result.score_percentage}%</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8">
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <span className="text-muted text-sm mb-1">Correct</span>
              <span className="text-2xl font-bold text-green-600">{result.correct_count}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <span className="text-muted text-sm mb-1">Incorrect</span>
              <span className="text-2xl font-bold text-red-600">{assessment.questions.length - result.correct_count}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <span className="text-muted text-sm mb-1">XP Earned</span>
              <span className="text-2xl font-bold text-purple-600">+{result.xp_earned || 0}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <span className="text-muted text-sm mb-1">Streak</span>
              <span className="text-2xl font-bold text-orange-500 flex items-center gap-1">
                <Flame className="w-5 h-5" /> {result.current_streak || 0}
              </span>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-6">Question Review</h3>
        <div className="space-y-6">
          {assessment.questions.map((q, idx) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correct_option;
            
            return (
              <div key={q.id} className={`p-6 rounded-xl border ${isCorrect ? 'border-green-200 bg-green-50/30 dark:border-green-900 dark:bg-green-900/10' : 'border-red-200 bg-red-50/30 dark:border-red-900 dark:bg-red-900/10'}`}>
                <div className="flex gap-4 items-start">
                  {isCorrect ? <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-1" /> : <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />}
                  <div>
                    <h4 className="font-semibold mb-4 text-lg">
                      <span className="text-muted mr-2">{idx + 1}.</span>
                      {q.question_text}
                    </h4>
                    <div className="grid gap-2 mb-4">
                      {['A', 'B', 'C', 'D'].map(opt => {
                        const isSelected = userAnswer === opt;
                        const isActualCorrect = q.correct_option === opt;
                        let optClass = 'p-3 rounded-lg text-sm border ';
                        
                        if (isActualCorrect) optClass += 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100 font-semibold';
                        else if (isSelected && !isActualCorrect) optClass += 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100';
                        else optClass += 'bg-white border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300';
                        
                        return (
                          <div key={opt} className={optClass}>
                            <span className="font-bold mr-2">{opt}:</span> {q[`option_${opt.toLowerCase()}`]}
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
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
          <button onClick={() => navigate('/learning-paths')} className="btn btn-primary py-3 px-6">View Learning Path</button>
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
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-semibold ${timeLeft < 60 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-8 overflow-hidden">
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
              <ReactMarkdown>{currentQ.question_text}</ReactMarkdown>
            </div>
            
            {currentQ.question_type === 'coding' ? (
              <div className="h-[400px] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
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
                {['A', 'B', 'C', 'D'].map(opt => {
                  const isSelected = answers[currentQ.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      className={`quiz-option p-4 rounded-xl border-2 text-left flex items-center transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className={`quiz-option-letter w-8 h-8 flex items-center justify-center rounded-lg font-bold mr-4 shrink-0 ${
                        isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {opt}
                      </span>
                      <span className="text-lg">{currentQ[`option_${opt.toLowerCase()}`]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
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
            className="btn btn-primary flex items-center gap-2 px-8 py-3 font-bold bg-green-600 hover:bg-green-700 text-white"
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
