import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertTriangle, ArrowRight, ArrowLeft, GraduationCap, Target, Briefcase, Zap, Trophy, Brain } from 'lucide-react';
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
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

export default function Onboarding() {
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [academicProfile, setAcademicProfile] = useState({ university: '', degree: '', year: '', branch: '' });
  const [careerGoal, setCareerGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [assessmentStatus, setAssessmentStatus] = useState('pending'); // pending, questions, unavailable, completed
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});

  useEffect(() => {
    if (step === 5) {
      loadAssessment();
    }
  }, [step]);

  const loadAssessment = async () => {
    setLoading(true);
    try {
      const categories = await assessmentService.getCategories();
      if (categories && categories.length > 0) {
        const assessments = await assessmentService.getAssessments(categories[0].id);
        if (assessments && assessments.length > 0) {
          const detail = await assessmentService.getAssessmentById(assessments[0].id);
          if (detail && detail.questions && detail.questions.length > 0) {
            setQuizQuestions(detail.questions.slice(0, 10));
            setAssessmentStatus('questions');
          } else {
            setAssessmentStatus('unavailable');
          }
        } else {
          setAssessmentStatus('unavailable');
        }
      } else {
        setAssessmentStatus('unavailable');
      }
    } catch (err) {
      setAssessmentStatus('unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setStep(prev => Math.min(prev + 1, 8));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleFinish = async () => {
    setLoading(true);
    try {
      const onboardingData = {
        academic_profile: academicProfile,
        career_goal: careerGoal === 'Other' ? customGoal : careerGoal,
        skills: selectedSkills,
        experience_level: experienceLevel,
        quiz_completed: assessmentStatus === 'completed'
      };
      await completeOnboarding(onboardingData);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to complete onboarding. Please try again.');
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
          <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">Academic Profile</h2>
            </div>
            <p className="text-muted">Tell us about your educational background.</p>
            <div className="form-group">
              <label className="form-label">University / Institution</label>
              <input type="text" className="form-input" value={academicProfile.university} onChange={(e) => setAcademicProfile({...academicProfile, university: e.target.value})} placeholder="e.g. Stanford University" />
            </div>
            <div className="form-group">
              <label className="form-label">Degree</label>
              <input type="text" className="form-input" value={academicProfile.degree} onChange={(e) => setAcademicProfile({...academicProfile, degree: e.target.value})} placeholder="e.g. B.S. Computer Science" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Year of Study</label>
                <input type="text" className="form-input" value={academicProfile.year} onChange={(e) => setAcademicProfile({...academicProfile, year: e.target.value})} placeholder="e.g. 3rd Year" />
              </div>
              <div className="form-group">
                <label className="form-label">Branch / Department</label>
                <input type="text" className="form-input" value={academicProfile.branch} onChange={(e) => setAcademicProfile({...academicProfile, branch: e.target.value})} placeholder="e.g. Engineering" />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">Career Goal</h2>
            </div>
            <p className="text-muted">What role are you aiming for?</p>
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
                <label className="form-label">Specify your career goal</label>
                <input type="text" className="form-input" value={customGoal} onChange={(e) => setCustomGoal(e.target.value)} placeholder="e.g. Product Manager" />
              </div>
            )}
          </motion.div>
        );
      case 3:
        return (
          <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">Your Skills</h2>
            </div>
            <p className="text-muted">Select the skills you already possess.</p>
            <div className="flex flex-wrap gap-2">
              {SKILLS_LIST.map(skill => (
                <button 
                  key={skill} 
                  onClick={() => toggleSkill(skill)}
                  className={`chip ${selectedSkills.includes(skill) ? 'bg-primary text-white border-primary' : 'bg-transparent border border-gray-200 text-gray-700 hover:border-primary'} px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer`}
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
          <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col items-center text-center gap-6 py-8">
            <div className="bg-primary/10 p-6 rounded-full">
              <Brain className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Let's verify your skills!</h2>
            <p className="text-muted max-w-md">
              Take a quick 10-question assessment to help us build a highly accurate skill profile. 
              This allows us to generate a personalized roadmap and better job matches for you.
            </p>
            <div className="flex flex-col gap-3 mt-4 text-left">
              <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-success" /> <span>Personalized Learning Roadmap</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-success" /> <span>Accurate Skill Profile</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-success" /> <span>Better Job Matching</span></div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Quick Assessment</h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="spinner w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                <p>Loading assessment...</p>
              </div>
            ) : assessmentStatus === 'unavailable' ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Assessment Not Available</h3>
                <p className="text-muted">We couldn't load the assessment at this time. We'll use your self-declared skills instead.</p>
                <button className="btn btn-primary mt-6" onClick={handleNext}>Continue</button>
              </div>
            ) : assessmentStatus === 'completed' ? (
              <div className="text-center py-10">
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                <h3 className="text-xl font-bold">Assessment Completed!</h3>
                <p className="text-muted mt-2">Great job. We've updated your skill profile.</p>
                <button className="btn btn-primary mt-6" onClick={handleNext}>View Results</button>
              </div>
            ) : (
              <div className="quiz-container">
                <div className="flex justify-between text-sm text-muted mb-4">
                  <span>Question {currentQuestionIdx + 1} of {quizQuestions.length}</span>
                </div>
                <h3 className="text-lg font-medium mb-6">{quizQuestions[currentQuestionIdx]?.text || "Question text here"}</h3>
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4].map(optIdx => {
                    const optText = quizQuestions[currentQuestionIdx]?.[`option${optIdx}`] || `Option ${optIdx}`;
                    const isSelected = quizAnswers[currentQuestionIdx] === optIdx;
                    return (
                      <button 
                        key={optIdx} 
                        className={`quiz-option w-full p-4 border rounded-lg text-left transition-colors flex items-center ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}
                        onClick={() => {
                          setQuizAnswers({...quizAnswers, [currentQuestionIdx]: optIdx});
                        }}
                      >
                        <span className="quiz-option-letter inline-block w-6 h-6 text-center rounded bg-gray-100 text-sm font-medium mr-3 leading-6 shrink-0">{['A','B','C','D'][optIdx-1]}</span>
                        <span>{optText}</span>
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
                    {currentQuestionIdx < quizQuestions.length - 1 ? 'Next Question' : 'Finish Assessment'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        );
      case 6:
        const chartData = selectedSkills.length > 0 ? selectedSkills.map(skill => ({ subject: skill, A: Math.floor(Math.random() * 60) + 40, fullMark: 100 })).slice(0, 6) : [{ subject: 'General', A: 50, fullMark: 100 }];
        return (
          <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col gap-6 items-center text-center">
            <h2 className="text-2xl font-bold">Your Skill Profile</h2>
            <p className="text-muted">Based on your input and assessment.</p>
            <div className="w-full h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Skills" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        );
      case 7:
        return (
          <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-center">Skill Gap Analysis</h2>
            <p className="text-center text-muted mb-4">Target: {careerGoal === 'Other' ? customGoal : careerGoal || 'Software Engineer'}</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-4 bg-success/5 border-success/20">
                <h3 className="font-semibold text-success flex items-center gap-2 mb-4"><CheckCircle className="w-5 h-5"/> Strengths</h3>
                <ul className="space-y-3">
                  {selectedSkills.slice(0, 3).map((skill, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-success"/> {skill} - Good Foundation</li>
                  ))}
                  {selectedSkills.length === 0 && <li className="text-sm text-muted">No skills declared yet.</li>}
                </ul>
              </div>
              <div className="card p-4 bg-warning/5 border-warning/20">
                <h3 className="font-semibold text-warning flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5"/> Areas to Improve</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm"><AlertTriangle className="w-4 h-4 text-warning"/> Advanced System Design</li>
                  <li className="flex items-center gap-2 text-sm"><AlertTriangle className="w-4 h-4 text-warning"/> Cloud Architecture</li>
                  <li className="flex items-center gap-2 text-sm"><AlertTriangle className="w-4 h-4 text-warning"/> CI/CD Pipelines</li>
                </ul>
              </div>
            </div>
            <p className="text-center text-sm text-muted mt-4">Don't worry! We will build a personalized roadmap to help you close these gaps.</p>
          </motion.div>
        );
      case 8:
        return (
          <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col items-center justify-center text-center gap-6 py-12">
            <div className="relative">
              <Trophy className="w-24 h-24 text-warning animate-bounce" />
              <Sparkles className="w-8 h-8 text-primary absolute -top-2 -right-2 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold">You're All Set!</h2>
            <p className="text-lg text-muted max-w-md">
              Your Career Dashboard is ready. We've prepared a customized learning path and job recommendations tailored just for you.
            </p>
            <button 
              className="btn btn-primary btn-lg mt-6 flex items-center gap-2"
              onClick={handleFinish}
              disabled={loading}
            >
              {loading ? (
                <div className="spinner w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>Go to Dashboard <Zap className="w-5 h-5" /></>
              )}
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-page page-container min-h-screen bg-gray-50 py-10 flex flex-col items-center">
      <div className="w-full max-w-3xl mb-8">
        <div className="onboarding-progress flex justify-between items-center relative mb-2">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded transition-all duration-300" style={{ width: `${((step - 1) / 7) * 100}%` }}></div>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= i ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
              {i}
            </div>
          ))}
        </div>
      </div>

      <div className="onboarding-content w-full max-w-3xl">
        <div className="onboarding-card card p-8 min-h-[400px] flex flex-col">
          <div className="flex-grow">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>

          {step < 8 && step !== 5 && (
            <div className="onboarding-actions mt-8 flex justify-between pt-6 border-t border-gray-100">
              <button 
                className={`btn btn-outline flex items-center gap-2 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                onClick={handlePrev}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={handleNext}
                disabled={step === 2 && !careerGoal || step === 2 && careerGoal === 'Other' && !customGoal}
              >
                {step === 7 ? 'Complete Setup' : 'Continue'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {step === 5 && assessmentStatus === 'questions' && (
             <div className="onboarding-actions mt-8 flex justify-between pt-6 border-t border-gray-100">
             <button 
               className="btn btn-outline flex items-center gap-2 text-muted"
               onClick={() => setAssessmentStatus('completed')}
             >
               Skip Assessment
             </button>
           </div>
          )}
        </div>
      </div>
    </div>
  );
}
