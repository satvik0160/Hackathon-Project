import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Trophy, CheckCircle2, Lock, ArrowRight, Play, CheckSquare, Square, Loader2, MapPin, ExternalLink, UploadCloud } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { learningService, insforge } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Roadmap = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  
  const [activeCheckpoint, setActiveCheckpoint] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [projectInputs, setProjectInputs] = useState({});
  const [evaluationState, setEvaluationState] = useState({});

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async ({ forceRebuild = false, persist = false } = {}) => {
    try {
      setLoading(true);
      const res = await learningService.getPaths();
      const pathNodes = res.data?.nodes || res.data || [];
      if (!forceRebuild && pathNodes.length > 0) {
        setNodes(pathNodes);
      } else {
        const goal = user?.career_goal || 'Full Stack Developer';
        
        let generatedNodes = [];
        try {
          const aiRes = await learningService.generatePath(goal);
          if (aiRes && aiRes.data && aiRes.data.length > 0) {
            generatedNodes = aiRes.data.map((node, idx) => ({
              id: node.id || String(idx + 1),
              title: node.title,
              description: node.description,
              tasks: [], 
            }));
          }
        } catch (e) {
          console.error("AI Roadmap generation failed", e);
        }

        if (generatedNodes.length === 0) {
          generatedNodes = [
            { id: '1', title: 'Fundamentals', description: 'Core basics for your path', tasks: [] },
            { id: '2', title: 'Core Concepts', description: 'Building the foundation', tasks: [] },
            { id: '3', title: 'Intermediate Skills', description: 'Expanding knowledge', tasks: [] },
            { id: '4', title: 'Advanced Topics', description: 'Mastering the domain', tasks: [] },
            { id: '5', title: 'Projects & Portfolio', description: 'Putting it all together', tasks: [] },
            { id: '6', title: 'Interview Prep', description: 'Getting ready for jobs', tasks: [] },
          ];
        }

        setNodes(generatedNodes);
        if (persist) {
          await learningService.createPath({ career_goal: goal, nodes: generatedNodes });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load your roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await fetchRoadmap({ forceRebuild: true, persist: true });
      toast.success('Career roadmap generated and saved!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const saveNodesToDb = async (updatedNodes) => {
    try {
      if (!user) {
        toast.error('You must be logged in to save progress.');
        return;
      }
      const goal = user?.career_goal || 'Full Stack Developer';
      await learningService.createPath({ career_goal: goal, nodes: updatedNodes });
    } catch (error) {
      console.error('Failed to save nodes', error);
      toast.error('Failed to save progress: ' + (error.message || 'Unknown error. Check internet connection.'));
    }
  };

  const generateTasksForNode = async (node) => {
    setGeneratingTasks(true);
    const goal = user?.career_goal || 'Full Stack Developer';
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key missing");

      let resourcesContext = '';
      try {
        const { data: resources } = await insforge.from('learning_resources').select('title, resource_type, skill_category, url').limit(20);
        if (resources && resources.length > 0) {
          resourcesContext = `Here are some available internal resources in our Learning Hub: ${JSON.stringify(resources)}\nIf any of these internal resources match the checkpoint, you MUST explicitly suggest reading/watching them.`;
        }
      } catch (err) {
        console.warn('Could not fetch resources for context', err);
      }

      const prompt = `${resourcesContext}
Generate a highly detailed, comprehensive list of ALL necessary learning tasks to fully master the checkpoint: "${node.title}" (${node.description}).
You MUST generate a minimum of 5 tasks and a maximum of 10 tasks.
DO NOT use generic titles like "Read documentation". You must specify EXACTLY which concepts, videos, or documents to read. 
If an internal resource from the Learning Hub (provided above) is a good fit, recommend it explicitly by title. If not, recommend the BEST specific high-quality external resources (e.g., specific MDN Web Docs articles, freeCodeCamp, specific YouTube channels, or specific official documentation pages).

Return a JSON array with objects containing: 
- id (string, unique)
- title (string, highly detailed and specific, e.g. 'Read MDN Web Docs on JavaScript Closures' or 'Watch "React Hooks Masterclass" on YouTube')
- type (string: 'video', 'exercise', 'reading', 'quiz', 'assessment', 'project')
- location_suggestion (string: EXACT location, e.g. 'Learning Hub', 'Assessments Tab', 'MDN Docs', 'YouTube', 'Code Editor', 'freeCodeCamp')
- url (string: a valid URL link to the resource. For internal resources, use '/learning' or '/assessments'. For external, provide the EXACT https:// link to a SPECIFIC video or article. DO NOT just link to 'https://youtube.com'. If you absolutely cannot provide a specific video URL, provide a YouTube search link that includes the user's specific career domain like 'https://www.youtube.com/results?search_query=${encodeURIComponent(goal + ' ' + node.title)}'. Use '#' if no link is applicable)
- reasoning (string: a short 1-2 sentence explanation of why this task is important and what the user gains after completing it)
- completed (boolean: false)

Reply ONLY with the raw JSON array.`;
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      const text = data.candidates[0].content.parts[0].text;
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const tasks = JSON.parse(cleaned);

      const updatedNodes = nodes.map(n => n.id === node.id ? { ...n, tasks } : n);
      setNodes(updatedNodes);
      setActiveCheckpoint({ ...node, tasks });
      await saveNodesToDb(updatedNodes);
    } catch (error) {
      console.error('Failed to generate tasks', error);
      toast.error('Failed to generate specific tasks for this checkpoint.');
      const fallbackTasks = [
        { id: Date.now() + '1', title: 'Read official MDN Web Docs on ' + node.title + ' fundamentals', type: 'reading', location_suggestion: 'MDN Docs', url: 'https://developer.mozilla.org/en-US/search?q=' + encodeURIComponent(goal + ' ' + node.title), reasoning: 'Official documentation provides the most accurate and in-depth understanding of the core concepts, ensuring you build a solid foundation.', completed: false },
        { id: Date.now() + '2', title: 'Watch a comprehensive crash course video on ' + node.title, type: 'video', location_suggestion: 'YouTube', url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(goal + ' ' + node.title + ' tutorial'), reasoning: 'Video crash courses help visualize complex topics quickly and give you a practical overview of how tools fit together.', completed: false },
        { id: Date.now() + '3', title: 'Complete 3 beginner practice exercises in your local editor', type: 'exercise', location_suggestion: 'Code Editor', url: '#', reasoning: 'Hands-on practice is essential. Writing code yourself reinforces syntax and builds muscle memory.', completed: false },
        { id: Date.now() + '4', title: 'Build a small mini-project applying these concepts', type: 'project', location_suggestion: 'Code Editor', url: '#', reasoning: 'Building a project from scratch teaches you how to integrate different concepts and prepares you for real-world development.', completed: false },
        { id: Date.now() + '5', title: 'Take a Skill Assessment on ' + node.title + ' to verify knowledge', type: 'assessment', location_suggestion: 'Assessments Tab', url: '/assessments', reasoning: 'Taking an assessment validates your learning and exposes any remaining knowledge gaps before moving to the next checkpoint.', completed: false },
      ];
      const updatedNodes = nodes.map(n => n.id === node.id ? { ...n, tasks: fallbackTasks } : n);
      setNodes(updatedNodes);
      setActiveCheckpoint({ ...node, tasks: fallbackTasks });
      await saveNodesToDb(updatedNodes);
    } finally {
      setGeneratingTasks(false);
    }
  };

  const evaluateProject = async (nodeId, taskId, link, description) => {
    setEvaluationState(prev => ({ ...prev, [taskId]: { loading: true } }));
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API missing");

      const prompt = `You are an expert tech mentor evaluating a student's mini-project.
Topic: "${activeCheckpoint.title}"
Task: "${activeCheckpoint.tasks.find(t => t.id === taskId)?.title}"
Student's Project Link: ${link}
Student's Description: ${description || 'No description provided.'}

Based on the topic and the description provided, evaluate the submission. Even if you cannot browse the link directly, infer the effort from the description, the URL domain (e.g. github, vercel), and context.
Provide a strict but encouraging rating out of 10.
Return a JSON object with EXACTLY two fields:
- score (number, 1 to 10)
- feedback (string, 2-3 sentences of constructive feedback)
Reply ONLY with the raw JSON object.`;
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      const text = data.candidates[0].content.parts[0].text;
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleaned);

      const updatedNodes = nodes.map(n => {
        if (n.id === nodeId) {
          const updatedTasks = n.tasks.map(t => t.id === taskId ? { 
            ...t, 
            completed: true, 
            project_score: result.score, 
            project_feedback: result.feedback,
            project_link: link
          } : t);
          if (activeCheckpoint?.id === nodeId) {
            setActiveCheckpoint({ ...n, tasks: updatedTasks });
          }
          return { ...n, tasks: updatedTasks };
        }
        return n;
      });
      setNodes(updatedNodes);
      await saveNodesToDb(updatedNodes);
      toast.success('Project evaluated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to evaluate project. Please try again.');
    } finally {
      setEvaluationState(prev => ({ ...prev, [taskId]: { loading: false } }));
    }
  };

  const toggleTaskComplete = async (nodeId, taskId) => {
    const updatedNodes = nodes.map(n => {
      if (n.id === nodeId) {
        const updatedTasks = n.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
        if (activeCheckpoint?.id === nodeId) {
          setActiveCheckpoint({ ...n, tasks: updatedTasks });
        }
        return { ...n, tasks: updatedTasks };
      }
      return n;
    });
    setNodes(updatedNodes);
    await saveNodesToDb(updatedNodes);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  let nodesFullySatisfied = 0;
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.tasks && n.tasks.length > 0 && n.tasks.every(t => t.completed)) {
      nodesFullySatisfied++;
    } else {
      break;
    }
  }

  const dynamicNodes = nodes.map((node, index) => {
    let status = 'locked';
    if (index < nodesFullySatisfied) status = 'completed';
    else if (index === nodesFullySatisfied) status = 'active';
    
    return { ...node, dynamicStatus: status };
  });

  return (
    <div className="page-container py-12 max-w-7xl mx-auto min-h-[90vh] flex flex-col relative overflow-hidden bg-slate-50/50">
      
      {/* Background Decorators */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-purple-400/20 rounded-full blur-[120px] mix-blend-multiply animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[20%] right-[5%] w-96 h-96 bg-cyan-400/20 rounded-full blur-[120px] mix-blend-multiply animate-[pulse_8s_ease-in-out_infinite_reverse]"></div>
      </div>

      <AnimatePresence>
        {activeCheckpoint && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="fixed inset-0 z-50 bg-slate-50/90 backdrop-blur-md overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto py-12 px-6">
              <button 
                onClick={() => setActiveCheckpoint(null)}
                className="mb-8 px-4 py-2 bg-white rounded-full shadow-md text-slate-600 hover:text-indigo-600 hover:shadow-lg flex items-center gap-2 font-bold transition-all hover:-translate-x-1"
              >
                <ArrowRight className="w-5 h-5 rotate-180" /> Back to Roadmap
              </button>
              
              <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-slate-100 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-purple-800 mb-4 relative z-10">{activeCheckpoint.title}</h1>
                <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium relative z-10">{activeCheckpoint.description}</p>
                
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600"><CheckCircle2 className="w-6 h-6" /></div>
                  Required Tasks
                </h2>

                {generatingTasks ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-slate-500 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200"
                  >
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                    <p className="font-semibold text-lg text-indigo-900">Consulting AI Mentor...</p>
                    <p className="text-sm">Curating the best resources for this checkpoint.</p>
                  </motion.div>
                ) : (
                  <div className="space-y-5 relative z-10">
                    {activeCheckpoint.tasks && activeCheckpoint.tasks.length > 0 ? (
                      activeCheckpoint.tasks.map((task, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={task.id} 
                          onMouseEnter={() => setHoveredTask(task.id)}
                          onMouseLeave={() => setHoveredTask(null)}
                          onClick={() => { if (task.type !== 'project' || task.completed) toggleTaskComplete(activeCheckpoint.id, task.id); }}
                          className={`flex items-start gap-5 p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 shadow-sm ${
                            task.completed 
                              ? 'bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-200 shadow-emerald-100/50' 
                              : 'bg-white border-slate-100 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100'
                          }`}
                        >
                          <div className="mt-1 shrink-0 transition-transform duration-300 group-hover:scale-110">
                            {task.completed ? (
                              <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600"><CheckSquare className="w-7 h-7" /></div>
                            ) : (
                              <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50"><Square className="w-7 h-7" /></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-extrabold text-xl mb-1 transition-colors ${task.completed ? 'text-emerald-900 line-through opacity-60' : 'text-slate-800'}`}>
                              {task.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-3 items-center">
                              <span className="inline-flex items-center px-3 py-1.5 bg-slate-100/80 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-lg">
                                {task.type || 'Task'}
                              </span>
                              {task.location_suggestion && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100/50">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {task.location_suggestion}
                                </span>
                              )}
                              {task.url && task.url !== '#' && (
                                <a 
                                  href={task.url}
                                  target={task.url.startsWith('http') ? "_blank" : "_self"}
                                  rel={task.url.startsWith('http') ? "noopener noreferrer" : ""}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-100 text-blue-700 text-xs font-black rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-blue-500/30 group"
                                >
                                  Open Resource <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </a>
                              )}
                            </div>
                            <AnimatePresence>
                              {hoveredTask === task.id && task.reasoning && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 bg-indigo-50/70 rounded-2xl text-sm text-indigo-900 border border-indigo-100 flex items-start gap-3 shadow-inner">
                                    <Sparkles className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                                    <p className="leading-relaxed"><strong className="text-indigo-800">Why this matters:</strong> {task.reasoning}</p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {task.type === 'project' && !task.completed && (
                              <div className="mt-5 w-full" onClick={(e) => e.stopPropagation()}>
                                <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-2xl border-2 border-indigo-100 shadow-sm flex flex-col gap-4">
                                  <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-2 uppercase tracking-wide">
                                    <UploadCloud className="w-4 h-4 text-indigo-500" />
                                    Submit Project for Evaluation
                                  </h4>
                                  <input 
                                    type="text" 
                                    placeholder="Project Link (GitHub, Vercel, Live Demo...)" 
                                    className="w-full px-4 py-3 rounded-xl border border-indigo-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/20 bg-white transition-shadow"
                                    value={projectInputs[task.id]?.link || ''}
                                    onChange={(e) => setProjectInputs(prev => ({...prev, [task.id]: { ...prev[task.id], link: e.target.value }}))}
                                  />
                                  <textarea 
                                    placeholder="Briefly describe what you built, the challenges faced, and the tech stack used..." 
                                    className="w-full px-4 py-3 rounded-xl border border-indigo-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/20 min-h-[80px] bg-white transition-shadow resize-none"
                                    value={projectInputs[task.id]?.description || ''}
                                    onChange={(e) => setProjectInputs(prev => ({...prev, [task.id]: { ...prev[task.id], description: e.target.value }}))}
                                  />
                                  <button 
                                    disabled={evaluationState[task.id]?.loading || !projectInputs[task.id]?.link}
                                    onClick={() => evaluateProject(activeCheckpoint.id, task.id, projectInputs[task.id]?.link, projectInputs[task.id]?.description)}
                                    className="self-end px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2 transition-all"
                                  >
                                    {evaluationState[task.id]?.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    Evaluate & Complete
                                  </button>
                                </div>
                              </div>
                            )}

                            {task.type === 'project' && task.completed && task.project_score && (
                              <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="mt-5 w-full" onClick={(e) => e.stopPropagation()}>
                                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 shadow-sm">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-extrabold text-emerald-900 flex items-center gap-2">
                                      <Trophy className="w-5 h-5 text-emerald-500" />
                                      AI Mentor Score
                                    </h4>
                                    <span className="px-4 py-1.5 bg-emerald-500 text-white font-black rounded-full text-lg shadow-md shadow-emerald-500/30">
                                      {task.project_score} / 10
                                    </span>
                                  </div>
                                  <p className="text-emerald-800 text-sm font-medium leading-relaxed bg-white/60 p-4 rounded-xl">{task.project_feedback}</p>
                                  {task.project_link && (
                                    <a href={task.project_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-100/50 px-3 py-1.5 rounded-lg transition-colors">
                                      View Submitted Link <ExternalLink className="w-3 h-3"/>
                                    </a>
                                  )}
                                </div>
                              </motion.div>
                            )}

                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                          <BookOpen className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No Tasks Generated Yet</h3>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">Click below to ask your AI Mentor to curate the best resources and challenges for this topic.</p>
                        <button 
                          onClick={() => generateTasksForNode(activeCheckpoint)}
                          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 mx-auto"
                        >
                          <Sparkles className="w-6 h-6" /> Generate Required Tasks
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {activeCheckpoint.tasks && activeCheckpoint.tasks.length > 0 && activeCheckpoint.tasks.every(t => t.completed) && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="mt-12 p-10 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 rounded-[2rem] text-white text-center shadow-2xl shadow-emerald-500/40 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                    <Trophy className="w-16 h-16 text-emerald-100 mx-auto mb-4 drop-shadow-md" />
                    <h3 className="text-4xl font-black mb-3 drop-shadow-sm">Checkpoint Conquered! 🎉</h3>
                    <p className="text-lg font-medium text-emerald-50 max-w-lg mx-auto">You have mastered this topic and completed all challenges. Your next milestone is now unlocked on the roadmap.</p>
                    <button 
                      onClick={() => setActiveCheckpoint(null)}
                      className="mt-8 px-10 py-4 bg-white text-emerald-700 font-black text-lg rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all"
                    >
                      Continue Journey
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`transition-all duration-500 ${activeCheckpoint ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <div className="text-center mb-16 z-10 relative">
          <motion.span 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-full text-xs font-black tracking-widest uppercase mb-4 shadow-lg shadow-indigo-500/35"
          >
            Interactive Career Map
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-700 mb-4"
          >
            Your Path to <span className="text-indigo-600">{user?.career_goal || 'Success'}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-slate-500 font-semibold text-lg max-w-2xl mx-auto"
          >
            Complete carefully curated tasks to unlock each checkpoint, level up your skills, and master your domain.
          </motion.p>
          
          {nodes.length === 0 && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
              onClick={handleGenerate}
              disabled={generating}
              className="mt-8 inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {generating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              {generating ? 'Mapping your journey...' : 'Generate My Roadmap'}
            </motion.button>
          )}
        </div>

        {dynamicNodes.length > 0 && (
          <div className="flex flex-col md:flex-row gap-8 flex-1 relative z-10 w-full">
            
            <div className="flex-1 relative py-12 px-4 flex justify-center">
              
              {/* Background inactive line - thinner, subtle */}
              <div className="absolute top-12 bottom-12 left-1/2 w-2 -ml-1 bg-slate-200/50 rounded-full z-0 overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(167,139,250,0.3),transparent)] animate-[pulse_3s_ease-in-out_infinite] h-[200%]"></div>
              </div>
              
              {/* Glowing active line - Neon Laser effect */}
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(1, Math.min(100, ((nodesFullySatisfied + 0.05) / (Math.max(1, dynamicNodes.length - 1))) * 100))}%` }}
                transition={{ duration: 2, ease: 'easeOut', type: 'spring', bounce: 0.2 }}
                className="absolute top-12 left-1/2 w-2 -ml-1 bg-white rounded-full z-0 shadow-[0_0_15px_3px_rgba(6,182,212,0.8),0_0_30px_6px_rgba(59,130,246,0.8),0_0_45px_9px_rgba(168,85,247,0.8)]"
              >
                {/* Scrolling data effect inside the laser */}
                <div className="absolute inset-0 opacity-50 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_10px,rgba(255,255,255,0.8)_10px,rgba(255,255,255,0.8)_20px)] animate-[pulse_1s_linear_infinite]"></div>
                
                {/* The bright 'spark' tip of the progress line */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full blur-[4px] shadow-[0_0_30px_15px_rgba(168,85,247,0.9)] animate-pulse"></div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_5px_rgba(255,255,255,1)]"></div>
              </motion.div>

              <div className="flex flex-col justify-between w-full max-w-2xl z-10 relative space-y-20">
                {dynamicNodes.map((n, idx) => {
                  const isCompleted = n.dynamicStatus === 'completed';
                  const isActive = n.dynamicStatus === 'active';
                  const isLocked = n.dynamicStatus === 'locked';
                  
                  const isLeft = idx % 2 === 0;

                  return (
                    <motion.div 
                      key={n.id} 
                      initial={{ opacity: 0, x: isLeft ? -50 : 50, y: 30 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ type: "spring", stiffness: 100, damping: 15, delay: idx * 0.1 }}
                      className={`relative flex items-center w-full ${isLeft ? 'justify-start' : 'justify-end'}`}
                      onMouseEnter={() => setHoveredNode(n.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      
                      <motion.div 
                        whileHover={!isLocked ? { scale: 1.05, y: -5, rotateY: isLeft ? 5 : -5 } : {}}
                        className={`w-[45%] bg-white/90 backdrop-blur-2xl p-7 rounded-[2rem] shadow-xl border-2 transition-colors cursor-pointer overflow-hidden group ${
                          isCompleted ? 'border-cyan-300 hover:shadow-cyan-500/20' : 
                          isActive ? 'border-purple-400 hover:shadow-purple-500/30 shadow-purple-500/20' : 
                          'border-slate-200 opacity-60'
                        }`} onClick={() => setSelectedNode(n)}
                        style={{ perspective: 1000 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {isCompleted && <div className="p-2 bg-cyan-100 text-cyan-600 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>}
                          {isActive && <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Sparkles className="w-6 h-6 animate-pulse" /></div>}
                          {isLocked && <div className="p-2 bg-slate-100 text-slate-400 rounded-xl"><Lock className="w-6 h-6" /></div>}
                          <h4 className={`text-xl font-black ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>{n.title}</h4>
                        </div>
                        <p className="text-sm font-medium text-slate-500 line-clamp-3 leading-relaxed">{n.description}</p>
                        
                        {/* Start Button Overlay */}
                        <AnimatePresence>
                          {hoveredNode === n.id && !isLocked && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-[2rem] z-10"
                            >
                              <motion.button 
                                initial={{ scale: 0.8, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 10 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveCheckpoint(n);
                                  if (!n.tasks || n.tasks.length === 0) generateTasksForNode(n);
                                }}
                                className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-500/40 hover:-translate-y-1 transition-transform"
                              >
                                <Play className="w-5 h-5 fill-white" />
                                {isCompleted ? 'Review Tasks' : 'Start Checkpoint'}
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Horizontal Connector Line */}
                      <div className={`absolute top-1/2 -translate-y-1/2 h-1.5 z-10 ${isLeft ? 'right-1/2 w-[5%]' : 'left-1/2 w-[5%]'}`}>
                        <div className={`w-full h-full rounded-full transition-all duration-1000 ${
                          isCompleted ? 'bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)]' : 
                          isActive ? 'bg-gradient-to-r from-purple-400 to-indigo-400 shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-pulse' : 
                          'bg-slate-200'
                        }`}></div>
                      </div>

                      {/* Beacon Point */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <motion.div 
                          animate={isActive ? { boxShadow: ["0 0 0 0 rgba(168,85,247,0.7)", "0 0 0 20px rgba(168,85,247,0)", "0 0 0 0 rgba(168,85,247,0)"] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`w-10 h-10 rounded-full border-[4px] flex items-center justify-center bg-white transition-all duration-500 ${
                            isCompleted ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.9)] scale-110' : 
                            isActive ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.9)] scale-125' : 
                            'border-slate-300'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-cyan-500' : isActive ? 'bg-purple-500' : 'bg-slate-300'}`}></div>
                        </motion.div>
                      </div>
                      
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Details remain hidden since we have a dedicated page, but keeping for compatibility if screen is wide enough */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Roadmap;
