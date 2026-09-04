import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, ArrowLeft, GraduationCap, Target, Briefcase, Zap, Trophy, Brain, Sparkles } from 'lucide-react';
import { assessmentService } from '../../services/api';

const SKILLS_LIST = [
  'Python', 'JavaScript', 'React', 'Django', 'SQL', 'Machine Learning', 
  'Data Analysis', 'HTML/CSS', 'Node.js', 'Git', 'Docker', 'Cloud Computing', 
  'Cybersecurity', 'UI/UX Design', 'Java', 'C++', 'Go', 'Kubernetes'
];

const CAREER_GOALS = [
  'Data Scientist', 'Full Stack Developer', 'DevOps Engineer', 
  'Cybersecurity Analyst', 'AI/ML Engineer', 'Cloud Architect', 
  'Mobile Developer', 'Backend Engineer', 'Frontend Engineer'
];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
  out: { 
    opacity: 0, 
    y: -20, 
    transition: { ease: [0.16, 1, 0.3, 1], duration: 0.4 }
  }
};

export default function Onboarding() {
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();

  // On first mount, validate that saved step state is consistent.
  // If we land on step 4 but there's no career goal chosen (i.e. the user
  // hasn't actually completed prior steps — stale localStorage from a
  // previous abandoned session), reset to step 1.
  const [step, setStep] = useState(() => {
    const saved = parseInt(localStorage.getItem('onb_step')) || 1;
    const savedGoal = localStorage.getItem('onb_goal') || '';
    // Only allow resuming past step 1 if prior steps were actually filled out
    if (saved > 1 && !savedGoal) {
      // Clear all stale onboarding keys
      ['onb_step', 'onb_academic', 'onb_goal', 'onb_cgoal', 'onb_skills', 'onb_exp'].forEach(k => localStorage.removeItem(k));
      return 1;
    }
    return saved;
  });
  const [loading, setLoading] = useState(false);
  
  const [academicProfile, setAcademicProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('onb_academic')) || { university: '', degree: '', year: '', branch: '' }; }
    catch { return { university: '', degree: '', year: '', branch: '' }; }
  });
  const [careerGoal, setCareerGoal] = useState(() => localStorage.getItem('onb_goal') || '');
  const [customGoal, setCustomGoal] = useState(() => localStorage.getItem('onb_cgoal') || '');
  const [selectedSkills, setSelectedSkills] = useState(() => {
    try { return JSON.parse(localStorage.getItem('onb_skills')) || []; }
    catch { return []; }
  });
  const [experienceLevel, setExperienceLevel] = useState(() => localStorage.getItem('onb_exp') || 'beginner');
  const [assessmentStatus, setAssessmentStatus] = useState('pending');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizFeedback, setQuizFeedback] = useState({});

  const TOTAL_STEPS = 4;

  useEffect(() => {
    localStorage.setItem('onb_step', step.toString());
    localStorage.setItem('onb_academic', JSON.stringify(academicProfile));
    localStorage.setItem('onb_goal', careerGoal);
    localStorage.setItem('onb_cgoal', customGoal);
    localStorage.setItem('onb_skills', JSON.stringify(selectedSkills));
    localStorage.setItem('onb_exp', experienceLevel);
  }, [step, academicProfile, careerGoal, customGoal, selectedSkills, experienceLevel]);

  useEffect(() => {
    if (step === 4) {
      loadAssessment();
    }
  }, [step]);

  // When assessment is completed, automatically finish and navigate to dashboard
  useEffect(() => {
    if (assessmentStatus === 'completed') {
      handleFinish();
    }
  }, [assessmentStatus]);

  const loadAssessment = async () => {
    setLoading(true);
    try {
      const catRes = await assessmentService.getCategories();
      const categories = catRes.data?.results || catRes.data;
      
      if (categories && categories.length > 0) {
        // 1. Try to exact-match the career goal first (highest priority)
        const goalLower = (careerGoal || '').toLowerCase();
        let targetCat = categories.find(c => goalLower.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(goalLower));
        
        // 2. If no career goal match, try to match the first selected skill
        if (!targetCat && selectedSkills && selectedSkills.length > 0) {
          const firstSkillLower = selectedSkills[0].toLowerCase();
          targetCat = categories.find(c => c.name.toLowerCase() === firstSkillLower || firstSkillLower.includes(c.name.toLowerCase()));
        }

        // 3. Advanced fallback mapping
        if (!targetCat) {
          const domainStr = ((selectedSkills?.join(' ') || '') + ' ' + (careerGoal || '')).toLowerCase();
          if (domainStr.includes('web') || domainStr.includes('front') || domainStr.includes('javascript') || domainStr.includes('html')) {
             targetCat = categories.find(c => c.name === 'React');
          } else if (domainStr.includes('data') || domainStr.includes('machine') || domainStr.includes('ai') || domainStr.includes('analysis')) {
             targetCat = categories.find(c => c.name === 'Data Science' || c.name === 'Data Analysis');
          }
        }
        
        if (!targetCat) targetCat = categories[0]; // absolute fallback

        const asmRes = await assessmentService.getAssessments();
        const allAssessments = asmRes.data?.results || asmRes.data;
        
        if (allAssessments && allAssessments.length > 0) {
          // Filter assessments to match the chosen category
          const categoryAssessments = allAssessments.filter(a => a.category_id === targetCat.id);
          
          if (categoryAssessments.length > 0) {
            // Find assessment matching difficulty within the correct category
            let targetAsm = categoryAssessments.find(a => a.difficulty === experienceLevel);
            if (!targetAsm) targetAsm = categoryAssessments[0];
  
            const detailRes = await assessmentService.getAssessmentById(targetAsm.id);
            const detail = detailRes.data;
            
            if (detail && detail.questions && detail.questions.length > 0) {
              setQuizQuestions(detail.questions.slice(0, 10));
              setAssessmentStatus('questions');
              setLoading(false);
              return;
            }
          }
        }
      }
      
      // Fallback to MOCK questions if database is empty so it ALWAYS asks 10 questions as requested
      const mockQuestions = Array.from({ length: 10 }).map((_, i) => ({
        id: `mock-${i}`,
        question_text: `Sample domain question ${i + 1}: What is the primary use of ${selectedSkills[0] || 'Python'} in modern architecture?`,
        option_a: 'Data Analysis and Machine Learning',
        option_b: 'System level memory management',
        option_c: 'Browser DOM manipulation',
        option_d: 'Embedded systems development',
        correct_option: 'a'
      }));
      setQuizQuestions(mockQuestions);
      setAssessmentStatus('questions');
      
    } catch (err) {
      console.error(err);
      // Fallback to MOCK questions on error
      const mockQuestions = Array.from({ length: 10 }).map((_, i) => ({
        id: `mock-${i}`,
        question_text: `Technical question ${i + 1} for ${careerGoal || 'your domain'}. Which of the following is correct?`,
        option_a: 'Option A is the standard approach.',
        option_b: 'Option B is deprecated.',
        option_c: 'Option C is used for testing only.',
        option_d: 'Option D is incorrect.',
        correct_option: 'a'
      }));
      setQuizQuestions(mockQuestions);
      setAssessmentStatus('questions');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 4 && assessmentStatus === 'unavailable') {
      handleFinish();
    } else {
      setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    }
  };
  
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleFinish = async () => {
    setLoading(true);
    try {
      let correctCount = 0;
      quizQuestions.forEach((q, idx) => {
        const selected = quizAnswers[idx];
        if (!selected) return;
        
        if (q?.id && !String(q.id).startsWith('mock')) {
           const fb = quizFeedback[idx];
           if (fb && fb.correct_option === selected) correctCount++;
        } else {
           if (q.correct_option === selected) correctCount++;
        }
      });
      const skillScore = quizQuestions.length > 0 ? Math.round((correctCount / quizQuestions.length) * 100) : 0;

      const onboardingData = {
        academic_profile: academicProfile,
        career_goal: careerGoal === 'Other' ? customGoal : careerGoal,
        skills: selectedSkills,
        experience_level: experienceLevel,
        quiz_completed: assessmentStatus === 'completed',
        skill_score: skillScore
      };
      await completeOnboarding(onboardingData);
      ['onb_step', 'onb_academic', 'onb_goal', 'onb_cgoal', 'onb_skills', 'onb_exp'].forEach(key => localStorage.removeItem(key));
      navigate('/dashboard', { replace: true });
    } catch (error) {
      import('../../utils/helpers').then(({ parseApiError }) => {
        toast.error(parseApiError(error));
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="step-1" variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">What is your Aim?</h2>
            </div>
            <p className="text-muted">What role or domain do you want to master?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CAREER_GOALS.map(goal => (
                <button key={goal} onClick={() => setCareerGoal(goal)} className={`btn ${careerGoal === goal ? 'btn-primary' : 'btn-outline'} w-full justify-center text-sm py-3`}>
                  {goal}
                </button>
              ))}
              <button onClick={() => setCareerGoal('Other')} className={`btn ${careerGoal === 'Other' ? 'btn-primary' : 'btn-outline'} w-full justify-center text-sm py-3`}>
                Other
              </button>
            </div>
            {careerGoal === 'Other' && (
              <div className="form-group mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Specify your career aim</label>
                <input type="text" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all" value={customGoal} onChange={(e) => setCustomGoal(e.target.value)} placeholder="e.g. Product Manager" />
              </div>
            )}
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step-2" variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">College & Year</h2>
            </div>
            <p className="text-muted">Tell us about your educational background.</p>
            <div className="form-group">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">College / University</label>
              <input type="text" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all" value={academicProfile.university} onChange={(e) => setAcademicProfile({...academicProfile, university: e.target.value})} placeholder="e.g. Stanford University" />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Degree</label>
              <input type="text" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all" value={academicProfile.degree} onChange={(e) => setAcademicProfile({...academicProfile, degree: e.target.value})} placeholder="e.g. B.S. Computer Science" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Year of Study</label>
                <input type="text" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all" value={academicProfile.year} onChange={(e) => setAcademicProfile({...academicProfile, year: e.target.value})} placeholder="e.g. 3rd Year" />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Branch / Department</label>
                <input type="text" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all" value={academicProfile.branch} onChange={(e) => setAcademicProfile({...academicProfile, branch: e.target.value})} placeholder="e.g. Engineering" />
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step-3" variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">Technical Skills</h2>
            </div>
            <p className="text-muted">What programming languages and tools do you know?</p>
            <div className="flex flex-wrap gap-2">
              {SKILLS_LIST.map(skill => (
                <button 
                  type="button"
                  key={skill} 
                  onClick={() => toggleSkill(skill)}
                  className={`filter-chip cursor-pointer transition-colors ${selectedSkills.includes(skill) ? 'active' : ''}`}
                >
                  {skill}
                </button>
              ))}
            </div>
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Overall Experience Level</h3>
              <div className="flex gap-3">
                {['beginner', 'intermediate', 'advanced'].map(level => (
                  <button 
                    key={level} 
                    onClick={() => setExperienceLevel(level)}
                    className={`btn ${experienceLevel === level ? 'btn-primary' : 'btn-outline'} capitalize flex-1`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step-4" variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Domain Knowledge Check</h2>
            {loading || assessmentStatus === 'pending' ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="spinner w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                <p>Preparing 10 questions based on your domain...</p>
              </div>
            ) : assessmentStatus === 'unavailable' ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Questions Not Available</h3>
                <p className="text-muted">We couldn't load the questions for this domain right now. You can skip this step.</p>
                <button className="btn btn-primary mt-6" onClick={handleFinish}>Go to Dashboard</button>
              </div>
            ) : assessmentStatus === 'completed' ? (
              <div className="text-center py-10">
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                <h3 className="text-xl font-bold">Completed!</h3>
                <p className="text-muted mt-2">Redirecting to Dashboard...</p>
              </div>
            ) : assessmentStatus === 'questions' && quizQuestions.length > 0 ? (
              <div className="quiz-container">
                <div className="flex justify-between text-sm text-muted mb-4">
                  <span>Question {currentQuestionIdx + 1} of {quizQuestions.length}</span>
                </div>
                <h3 className="text-lg font-medium mb-6">{quizQuestions[currentQuestionIdx]?.question_text || "Question text here"}</h3>
                <div className="flex flex-col gap-3">
                  {['A', 'B', 'C', 'D'].map((opt, index) => {
                    const question = quizQuestions[currentQuestionIdx];
                    let optText = question?.[`option_${opt.toLowerCase()}`];
                    if (!optText && question?.options && Array.isArray(question.options)) {
                      optText = question.options[index];
                    }
                    optText = optText || `Option ${opt}`;
                    
                    const isSelected = quizAnswers[currentQuestionIdx] === opt;
                    const isLocked = !!quizAnswers[currentQuestionIdx];
                    const fb = quizFeedback[currentQuestionIdx];
                    const isCorrectOption = fb && fb.correct_option === opt;
                    const isWrongSelected = fb && isSelected && fb.correct_option !== opt;

                    let inlineStyle = {};
                    if (isCorrectOption) {
                      inlineStyle = { backgroundColor: '#dcfce7', borderColor: '#22c55e', borderWidth: '3px', color: '#166534' };
                    } else if (isWrongSelected) {
                      inlineStyle = { backgroundColor: '#fef2f2', borderColor: '#ef4444', borderWidth: '3px', color: '#991b1b' };
                    } else if (isLocked && !isCorrectOption) {
                      inlineStyle = { opacity: 0.45 };
                    }

                    return (
                      <button 
                        key={opt} 
                        className={`quiz-option w-full ${isSelected && !fb ? 'selected' : ''}`}
                        style={inlineStyle}
                        disabled={isLocked}
                        onClick={async () => {
                          if (isLocked) return;
                          setQuizAnswers({...quizAnswers, [currentQuestionIdx]: opt});
                          // Call RPC for instant feedback (skip for mock questions)
                          if (question?.id && !String(question.id).startsWith('mock')) {
                            try {
                              const res = await assessmentService.checkSingleAnswer(question.id, opt);
                              setQuizFeedback(prev => ({...prev, [currentQuestionIdx]: res.data}));
                            } catch (e) {
                              console.error('Feedback check failed', e);
                            }
                          }
                        }}
                      >
                        <span className="quiz-option-letter">{opt}</span>
                        <span className="flex-1 text-left">{optText}</span>
                        {isCorrectOption && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
                        {isWrongSelected && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-8 flex justify-end">
                  <button 
                    className="btn btn-primary"
                    disabled={!quizAnswers[currentQuestionIdx]}
                    onClick={() => {
                      if (currentQuestionIdx < quizQuestions.length - 1) {
                        setCurrentQuestionIdx(prev => prev + 1);
                      } else {
                        setAssessmentStatus('completed');
                      }
                    }}
                  >
                    {currentQuestionIdx < quizQuestions.length - 1 ? 'Next Question' : 'Finish & Open Dashboard'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="spinner w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                <p>Loading assessment...</p>
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-page page-container min-h-screen py-10 flex flex-col items-center antialiased tracking-tight">
      <div className="w-full max-w-3xl mb-8 relative z-10">
        <div className="onboarding-progress flex justify-between items-center relative mb-2 px-2">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -z-10 -translate-y-1/2 rounded-full"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 -z-10 -translate-y-1/2 rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}></div>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(i => (
            <motion.div 
              key={i} 
              initial={false}
              animate={{
                scale: step >= i ? 1.1 : 1,
                backgroundColor: step >= i ? '#6366f1' : 'rgba(255,255,255,0.05)',
                color: step >= i ? '#ffffff' : '#64748b',
                borderColor: step >= i ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 shadow-lg z-10`}
            >
              {i}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="onboarding-content w-full max-w-3xl relative z-10">
        <div className="onboarding-card card p-8 min-h-[400px] flex flex-col bg-neutral-950/80 backdrop-blur-2xl border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] rounded-3xl">
          <div className="flex-grow">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>

          {step < 4 && (
            <div className="onboarding-actions mt-8 flex justify-between pt-6 border-t border-white/10">
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.97 }}
                className={`btn btn-outline flex items-center gap-2 border-white/10 text-slate-300 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                onClick={handlePrev}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-primary flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                onClick={handleNext}
                disabled={step === 1 && !careerGoal || step === 1 && careerGoal === 'Other' && !customGoal}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}
          {step === 4 && assessmentStatus === 'questions' && (
             <div className="onboarding-actions mt-8 flex justify-between pt-6 border-t border-white/10">
             <motion.button 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.97 }}
               className="btn btn-outline flex items-center gap-2 text-slate-400 border-white/10"
               onClick={() => setAssessmentStatus('completed')}
             >
               Skip to Dashboard
             </motion.button>
           </div>
          )}
        </div>
      </div>
    </div>
  );
}
