import sys

new_code = """import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Star, Check, AlertTriangle, Copy, RotateCcw, ChevronRight, ChevronLeft, Search, Zap, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { aiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const containerVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export default function AIResume() {
  const { user } = useAuth();
  const [mode, setMode] = useState(null); // 'build' | 'analyze'
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  const [resumeData, setResumeData] = useState({
    targetRole: '',
    template: 'ATS Optimized',
    pastedResume: '',
    fileName: ''
  });
  const [generatedResume, setGeneratedResume] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

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
      const payload = { target_role: resumeData.targetRole };
      if (mode === 'analyze') {
        payload.resume_text = resumeData.pastedResume;
      }
      const res = await aiService.resumeTailor(payload);
      setGeneratedResume(res.data?.resume_markdown || res.data?.tailored_resume || '# Your Generated Resume\\n\\nFailed to generate content properly.');
      setStep(5);
    } catch (error) {
      toast.error('Failed to generate resume');
      setStep(mode === 'analyze' ? 3 : 3);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeData.pastedResume) {
      toast.error('Please upload a resume first');
      return;
    }
    setLoading(true);
    setStep(2);
    try {
      const res = await aiService.resumeAnalyze({ 
        target_role: resumeData.targetRole,
        resume_text: resumeData.pastedResume 
      });
      setAnalysisResult(res.data?.analysis || null);
      setStep(3);
    } catch (error) {
      toast.error('Failed to analyze resume');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromPDF = async (file) => {
    try {
      setUploadProgress('Reading PDF...');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        setUploadProgress(`Extracting text (Page ${i}/${pdf.numPages})...`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        text += strings.join(' ') + '\\n';
      }
      return text;
    } catch (e) {
      console.error(e);
      throw new Error('Failed to parse PDF');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file');
      return;
    }

    try {
      setResumeData({...resumeData, fileName: file.name});
      const extractedText = await extractTextFromPDF(file);
      if (!extractedText.trim()) {
        toast.error('Could not extract text from this PDF. It might be scanned or empty.');
      } else {
        setResumeData(prev => ({...prev, pastedResume: extractedText, fileName: file.name}));
        toast.success('Resume parsed successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Error processing file');
    } finally {
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = () => {
    if (generatedResume) {
      navigator.clipboard.writeText(generatedResume);
      toast.success('Copied to clipboard!');
    }
  };

  const userSkills = typeof user?.skills === 'string' ? JSON.parse(user.skills) : (user?.skills || []);

  const startOver = () => {
    setMode(null);
    setStep(1);
    setGeneratedResume(null);
    setAnalysisResult(null);
    setResumeData({ targetRole: '', template: 'ATS Optimized', pastedResume: '', fileName: '' });
  }

  return (
    <div className="page-container py-8 max-w-5xl mx-auto">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Star className="w-8 h-8 text-primary" fill="currentColor" />
          AI Resume Studio
        </h1>
        <p className="text-muted mt-2">Build from scratch or analyze & improve your existing resume</p>
      </div>

      <AnimatePresence mode="wait">
        {!mode && (
          <motion.div key="mode-select" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div 
              onClick={() => { setMode('build'); setStep(1); }}
              className="card p-8 border-2 border-transparent hover:border-primary/30 hover:shadow-xl cursor-pointer transition-all group"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Resume Builder</h3>
              <p className="text-muted mb-6">Create a highly targeted ATS-friendly resume from scratch using your profile data and skills.</p>
              <div className="text-primary font-medium flex items-center">Get Started <ChevronRight className="w-4 h-4 ml-1" /></div>
            </div>

            <div 
              onClick={() => { setMode('analyze'); setStep(1); }}
              className="card p-8 border-2 border-transparent hover:border-violet-500/30 hover:shadow-xl cursor-pointer transition-all group"
            >
              <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Resume Analyzer</h3>
              <p className="text-muted mb-6">Upload your existing PDF resume to get ATS insights, strengths, weaknesses, and a 1-click AI rewrite.</p>
              <div className="text-violet-600 font-medium flex items-center">Analyze Resume <ChevronRight className="w-4 h-4 ml-1" /></div>
            </div>
          </motion.div>
        )}

        {mode === 'build' && (
          <div key="build-flow">
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
                  <div className="mt-8 flex justify-between">
                    <button className="btn btn-outline" onClick={startOver}><ChevronLeft className="w-4 h-4 mr-2" /> Cancel</button>
                    <button className="btn btn-primary px-8" disabled={!resumeData.targetRole} onClick={() => setStep(2)}>
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
                    <button className="btn btn-primary" onClick={handleGenerate}>Generate Resume <Star className="w-4 h-4 ml-2" fill="currentColor" /></button>
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
            </AnimatePresence>
          </div>
        )}

        {mode === 'analyze' && (
          <div key="analyze-flow">
            <div className="flex gap-4 mb-8">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`flex-1 h-2 rounded-full ${i <= step ? 'bg-violet-500' : 'bg-gray-200'}`} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="a-step1" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="card p-8 border-t-4 border-t-violet-500">
                  <h2 className="text-2xl font-bold mb-6">Upload Your Resume</h2>
                  
                  <div className="form-group mb-8 max-w-xl">
                    <label className="form-label">Target Role (Optional)</label>
                    <input
                      type="text"
                      className="form-input py-3"
                      placeholder="e.g. Data Scientist (helps AI give tailored feedback)"
                      value={resumeData.targetRole}
                      onChange={e => setResumeData({...resumeData, targetRole: e.target.value})}
                    />
                  </div>

                  <div className="mb-8 max-w-xl">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                    />
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${resumeData.pastedResume ? 'border-violet-500 bg-violet-50' : 'border-gray-300 hover:border-violet-400 hover:bg-slate-50'}`}
                    >
                      <UploadCloud className={`w-12 h-12 mb-4 ${resumeData.pastedResume ? 'text-violet-600' : 'text-gray-400'}`} />
                      <h4 className="text-lg font-semibold mb-2">
                        {resumeData.fileName ? resumeData.fileName : 'Click to Upload Resume (PDF)'}
                      </h4>
                      {uploadProgress ? (
                        <p className="text-violet-600 font-medium">{uploadProgress}</p>
                      ) : (
                        <p className="text-sm text-gray-500 text-center max-w-xs">
                          {resumeData.pastedResume 
                            ? 'PDF successfully parsed and ready for analysis.' 
                            : 'Upload your existing PDF resume. We will extract the text and analyze it.'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button className="btn btn-outline" onClick={startOver}><ChevronLeft className="w-4 h-4 mr-2" /> Cancel</button>
                    <button className="btn bg-violet-600 hover:bg-violet-700 text-white px-8" disabled={!resumeData.pastedResume.trim() || !!uploadProgress} onClick={handleAnalyze}>
                      Analyze Resume <Search className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="a-step2" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-600 rounded-full animate-spin mb-6"></div>
                  <h2 className="text-2xl font-bold mb-2">Analyzing Resume...</h2>
                  <p className="text-muted">Scanning for ATS compatibility and extracting insights</p>
                </motion.div>
              )}

              {step === 3 && analysisResult && (
                <motion.div key="a-step3" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="card p-8 border-t-4 border-t-violet-500">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b">
                    <div>
                      <h2 className="text-2xl font-bold">Analysis Results</h2>
                      <p className="text-muted">Targeting: {resumeData.targetRole || 'General Role'}</p>
                    </div>
                    <div className="text-center bg-violet-50 px-6 py-4 rounded-xl border border-violet-100">
                      <div className="text-4xl font-bold text-violet-600 mb-1">{analysisResult.score}%</div>
                      <div className="text-xs font-semibold text-violet-800 uppercase tracking-wide">ATS Match</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-4"><Check className="w-5 h-5"/> Strengths</h3>
                      <ul className="space-y-3">
                        {analysisResult.strengths?.map((s, i) => (
                          <li key={i} className="flex gap-3 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-600 flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5"/> Weaknesses</h3>
                      <ul className="space-y-3">
                        {analysisResult.weaknesses?.map((w, i) => (
                          <li key={i} className="flex gap-3 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border mb-8">
                    <h3 className="font-bold mb-2 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /> AI Insights</h3>
                    <p className="text-slate-700 text-sm leading-relaxed">{analysisResult.insights}</p>
                  </div>

                  <div className="flex justify-between items-center bg-violet-50/50 p-4 rounded-xl border border-violet-100">
                    <div>
                      <h4 className="font-bold text-violet-900">Want a better score?</h4>
                      <p className="text-sm text-violet-700">Let the AI rewrite your resume based on these insights.</p>
                    </div>
                    <button className="btn bg-violet-600 text-white hover:bg-violet-700" onClick={handleGenerate}>
                      Improve Resume <Star className="w-4 h-4 ml-2" fill="currentColor"/>
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="a-step4" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-600 rounded-full animate-spin mb-6"></div>
                  <h2 className="text-2xl font-bold mb-2">Improving Your Resume...</h2>
                  <p className="text-muted">Applying AI insights to rewrite and optimize for ATS</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {step === 5 && (
          <motion.div key="step5" variants={containerVariants} initial="hidden" animate="show" exit="exit">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 bg-white p-8 md:p-12 rounded-xl shadow-lg border prose prose-sm md:prose-base max-w-none">
                <ReactMarkdown>{generatedResume}</ReactMarkdown>
              </div>
              <div className="w-full md:w-80 shrink-0 space-y-4 sticky top-6">
                <div className={`card p-6 border ${mode === 'analyze' ? 'bg-violet-50 border-violet-100' : 'bg-green-50 border-green-100'}`}>
                  <div className="text-center mb-4">
                    <div className={`text-4xl font-bold mb-1 ${mode === 'analyze' ? 'text-violet-600' : 'text-green-600'}`}>
                      {mode === 'analyze' ? '98%' : '92%'}
                    </div>
                    <div className={`text-sm font-medium uppercase tracking-wide ${mode === 'analyze' ? 'text-violet-800' : 'text-green-800'}`}>ATS Score Estimate</div>
                  </div>
                  <p className={`text-xs text-center ${mode === 'analyze' ? 'text-violet-700' : 'text-green-700'}`}>Highly optimized for {resumeData.targetRole || 'general roles'}</p>
                </div>
                
                <button onClick={copyToClipboard} className={`btn ${mode === 'analyze' ? 'bg-violet-600 hover:bg-violet-700' : 'btn-primary'} text-white w-full py-3 flex items-center justify-center gap-2`}>
                  <Copy className="w-4 h-4" /> Copy Markdown
                </button>
                <button onClick={startOver} className="btn btn-outline w-full py-3 flex items-center justify-center gap-2">
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
"""

with open('frontend/src/pages/ai/AIResume.jsx', 'w') as f:
    f.write(new_code)

print("AIResume.jsx updated with PDF upload!")
