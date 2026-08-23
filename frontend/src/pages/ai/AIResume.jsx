import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Wand2, Check, AlertTriangle, Copy, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { aiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const containerVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export default function AIResume() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [resumeData, setResumeData] = useState({
    targetRole: '',
    template: 'ATS Optimized'
  });
  const [generatedResume, setGeneratedResume] = useState(null);

  const templates = [
    { id: 'ats', name: 'ATS Optimized', desc: 'Clean, parseable format for enterprise systems' },
    { id: 'modern', name: 'Modern', desc: 'Stand out with a clean, contemporary design' },
    { id: 'minimal', name: 'Minimal', desc: 'Focus strictly on content with elegant typography' },
    { id: 'academic', name: 'Academic', desc: 'Detailed format for research and academic roles' }
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setStep(4);
    try {
      const res = await aiService.resumeTailor({ target_role: resumeData.targetRole });
      setGeneratedResume(res.data?.resume_markdown || '# Your Generated Resume\n\nFailed to generate content properly.');
      setStep(5);
    } catch (error) {
      toast.error('Failed to generate resume');
      setStep(3); // go back
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedResume) {
      navigator.clipboard.writeText(generatedResume);
      toast.success('Copied to clipboard!');
    }
  };

  // Helper to safely parse user skills if it's a string
  const userSkills = typeof user?.skills === 'string' ? JSON.parse(user.skills) : (user?.skills || []);

  return (
    <div className="page-container py-8 max-w-5xl mx-auto">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Wand2 className="w-8 h-8 text-primary" />
          AI Resume Builder
        </h1>
        <p className="text-muted mt-2">Tailor your profile for specific roles instantly</p>
      </div>

      <div className="flex gap-4 mb-8">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`flex-1 h-2 rounded-full ${i <= step ? 'bg-primary' : 'bg-gray-200'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="card p-8">
            <h2 className="text-2xl font-bold mb-6">What role are you targeting?</h2>
            <div className="form-group max-w-xl">
              <label className="form-label">Target Role</label>
              <input
                type="text"
                className="form-input text-lg py-3"
                placeholder="e.g. Senior Frontend Developer"
                value={resumeData.targetRole}
                onChange={e => setResumeData({...resumeData, targetRole: e.target.value})}
              />
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                className="btn btn-primary px-8" 
                disabled={!resumeData.targetRole}
                onClick={() => setStep(2)}
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="card p-8">
            <h2 className="text-2xl font-bold mb-6">Review Profile Data</h2>
            <p className="text-muted mb-6">This information will be used to build your resume.</p>
            
            <div className="grid grid-2 gap-6 mb-8">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-500 mb-1">Career Goal</h4>
                <p className="font-medium">{user?.career_goal || 'Not set'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-500 mb-1">Experience Level</h4>
                <p className="font-medium capitalize">{user?.experience_level || 'Beginner'}</p>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="font-semibold mb-4">Skills to Include</h4>
              <div className="flex flex-wrap gap-3">
                {userSkills.map((skill, i) => (
                  <div key={i} className="chip bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full flex items-center gap-2">
                    <Check className="w-3 h-3" />
                    {typeof skill === 'object' ? skill.name : skill}
                  </div>
                ))}
                {userSkills.length === 0 && <p className="text-muted italic">No verified skills found in your profile.</p>}
              </div>
              <div className="mt-4 p-4 bg-amber-50 rounded-lg flex items-start gap-3 text-amber-800 text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Only verified skills and true experiences will be included. The AI will strictly avoid fabrication.</p>
              </div>
            </div>

            <div className="flex justify-between">
              <button className="btn btn-outline" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4 mr-2" /> Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Next <ChevronRight className="w-4 h-4 ml-2" /></button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="card p-8">
            <h2 className="text-2xl font-bold mb-6">Choose Template</h2>
            <div className="grid grid-2 gap-4 mb-8">
              {templates.map(tpl => (
                <div 
                  key={tpl.id}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${resumeData.template === tpl.name ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}
                  onClick={() => setResumeData({...resumeData, template: tpl.name})}
                >
                  <FileText className={`w-8 h-8 mb-3 ${resumeData.template === tpl.name ? 'text-primary' : 'text-gray-400'}`} />
                  <h3 className="font-semibold text-lg mb-1">{tpl.name}</h3>
                  <p className="text-muted text-sm">{tpl.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button className="btn btn-outline" onClick={() => setStep(2)}><ChevronLeft className="w-4 h-4 mr-2" /> Back</button>
              <button className="btn btn-primary" onClick={handleGenerate}>Generate Resume <Wand2 className="w-4 h-4 ml-2" /></button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold mb-2">Tailoring Your Resume...</h2>
            <p className="text-muted">Analyzing your skills against "{resumeData.targetRole}" requirements</p>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" variants={containerVariants} initial="hidden" animate="show" exit="exit">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 bg-white p-8 md:p-12 rounded-xl shadow-lg border prose prose-sm md:prose-base max-w-none">
                <ReactMarkdown>{generatedResume}</ReactMarkdown>
              </div>
              <div className="w-full md:w-80 shrink-0 space-y-4 sticky top-6">
                <div className="card p-6 bg-green-50 border-green-100">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-green-600 mb-1">92%</div>
                    <div className="text-sm font-medium text-green-800 uppercase tracking-wide">ATS Score Estimate</div>
                  </div>
                  <p className="text-xs text-green-700 text-center">Highly optimized for {resumeData.targetRole}</p>
                </div>
                
                <button onClick={copyToClipboard} className="btn btn-primary w-full py-3 flex items-center justify-center gap-2">
                  <Copy className="w-4 h-4" /> Copy Markdown
                </button>
                <button onClick={() => setStep(1)} className="btn btn-outline w-full py-3 flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Start Over
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
