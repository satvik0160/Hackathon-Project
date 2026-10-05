import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Trophy, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
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
  
  // Track tasks to calculate topic progress
  const [plannerTargets, setPlannerTargets] = useState([]);
  const [realStats, setRealStats] = useState({ tests: 0, videos: 0 });

  useEffect(() => {
    fetchRoadmap();
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    if (!user?.id) return;
    try {
      const { data: targets } = await insforge.from('daily_planner_targets').select('*').eq('user_id', user.id);
      setPlannerTargets(targets || []);
      
      const { data: tests } = await insforge.from('user_assessments').select('id').eq('user_id', user.id);
      const { data: res } = await insforge.from('user_resource_progress').select('id').eq('user_id', user.id).eq('completed', true);
      
      setRealStats({ 
        tests: tests ? tests.length : 0, 
        videos: res ? res.length : 0 
      });
    } catch(e) {}
  };

  const fetchRoadmap = async ({ forceRebuild = false, persist = false } = {}) => {
    try {
      setLoading(true);
      const res = await learningService.getPaths();
      const pathNodes = res.data?.nodes || res.data || [];
      if (!forceRebuild && pathNodes.length > 0) {
        setNodes(pathNodes);
      } else {
        const goal = user?.career_goal || 'Full Stack Developer';
        
        // Simple fallback generation if no nodes (we just use standard logic from old file, but compressed)
        let generatedNodes = [];
        try {
          const aiRes = await learningService.generatePath(goal);
          if (aiRes && aiRes.data && aiRes.data.length > 0) {
            generatedNodes = aiRes.data.map((node, idx) => ({
              id: node.id || String(idx + 1),
              title: node.title,
              description: node.description,
              estimated_hours: node.estimated_hours || 40,
              skills_gained: node.skills_gained || [],
              status: idx === 0 ? 'completed' : idx === 1 ? 'active' : 'locked',
              resources: []
            }));
          }
        } catch (e) {
          console.error("AI Roadmap generation failed", e);
        }

        if (generatedNodes.length === 0) {
          // Fallback array
          generatedNodes = [
            { id: '1', title: 'Fundamentals', description: 'Core basics for your path', status: 'completed' },
            { id: '2', title: 'Core Concepts', description: 'Building the foundation', status: 'active' },
            { id: '3', title: 'Intermediate Skills', description: 'Expanding knowledge', status: 'locked' },
            { id: '4', title: 'Advanced Topics', description: 'Mastering the domain', status: 'locked' },
            { id: '5', title: 'Projects & Portfolio', description: 'Putting it all together', status: 'locked' },
            { id: '6', title: 'Interview Prep', description: 'Getting ready for jobs', status: 'locked' },
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

  const handleViewModules = () => {
    navigate('/learning');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate dynamic node statuses based on timetable progress + real progress
  // Every 3 tasks (2 tests + 1 video) = 1 node completed
  const completedTargets = plannerTargets.filter(t => t.status === 'completed');
  let testCount = completedTargets.filter(t => t.type === 'assessment').length + realStats.tests;
  let videoCount = completedTargets.filter(t => t.type === 'video').length + realStats.videos;
  
  // Calculate how many nodes are fully satisfied
  let nodesFullySatisfied = 0;
  while (testCount >= 2 && videoCount >= 1) {
    nodesFullySatisfied++;
    testCount -= 2;
    videoCount -= 1;
  }

  // Map nodes with new dynamic status
  const dynamicNodes = nodes.map((node, index) => {
    let status = 'locked';
    if (index < nodesFullySatisfied) status = 'completed';
    else if (index === nodesFullySatisfied) status = 'active';
    
    return { ...node, dynamicStatus: status };
  });

  return (
    <div className="page-container py-8 max-w-6xl mx-auto min-h-[90vh] flex flex-col relative">
      <div className="text-center mb-12 z-10">
        <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-full text-sm font-semibold mb-3 shadow-lg shadow-indigo-500/35 animate-glow-pulse">
          Interactive Career Map
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Your Path to {user?.career_goal || 'Success'}</h1>
        <p className="text-slate-500 font-medium mb-4">Follow the glowing beacons. Complete Timetable tasks (2 skill tests + 1 video) to unlock the next checkpoint.</p>
        
        {nodes.length === 0 && (
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all duration-200"
          >
            {generating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate My Roadmap
          </button>
        )}
      </div>

      {dynamicNodes.length > 0 && (
        <div className="flex flex-col md:flex-row gap-8 flex-1 relative z-10 w-full">
          
          {/* Beacons and Glowing Road */}
          <div className="flex-1 relative py-10 px-4 flex justify-center">
            
            {/* The Road Line Background */}
            <div className="absolute top-10 bottom-10 left-1/2 w-2 -ml-1 bg-slate-200 rounded-full z-0"></div>
            
            {/* The Glowing Road (Progress Fill) */}
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${Math.min(100, (nodesFullySatisfied / (Math.max(1, dynamicNodes.length - 1))) * 100)}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute top-10 left-1/2 w-2 -ml-1 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 rounded-full z-0 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
            ></motion.div>

            <div className="flex flex-col justify-between w-full max-w-lg z-10 relative space-y-16">
              {dynamicNodes.map((n, idx) => {
                const isCompleted = n.dynamicStatus === 'completed';
                const isActive = n.dynamicStatus === 'active';
                const isLocked = n.dynamicStatus === 'locked';
                
                const isLeft = idx % 2 === 0;

                return (
                  <div key={n.id} className={`relative flex items-center w-full ${isLeft ? 'justify-start' : 'justify-end'}`}>
                    
                    {/* Card */}
                    <div className={`w-5/12 bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-lg border transition-all cursor-pointer ${
                      isCompleted ? 'border-cyan-300 hover:shadow-cyan-500/30' : 
                      isActive ? 'border-purple-400 hover:shadow-purple-500/30 ring-2 ring-purple-400/50' : 
                      'border-slate-200 opacity-60'
                    }`} onClick={() => setSelectedNode(n)}>
                      <div className="flex items-center gap-2 mb-2">
                        {isCompleted && <CheckCircle2 className="w-5 h-5 text-cyan-500" />}
                        {isActive && <Sparkles className="w-5 h-5 text-purple-500" />}
                        {isLocked && <Lock className="w-4 h-4 text-slate-400" />}
                        <h4 className={`font-bold ${isLocked ? 'text-slate-500' : 'text-slate-900'}`}>{n.title}</h4>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">{n.description}</p>
                    </div>

                    {/* Beacon Point on the road */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center bg-white transition-all duration-500 ${
                        isCompleted ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)]' : 
                        isActive ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.8)] animate-pulse' : 
                        'border-slate-300'
                      }`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-cyan-500' : isActive ? 'bg-purple-500' : 'bg-slate-300'}`}></div>
                      </div>
                    </div>
                    
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Sidebar */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full md:w-1/3 bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 z-20 sticky top-24 h-fit"
              >
                <button 
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 font-bold transition-colors"
                  onClick={() => setSelectedNode(null)}
                >
                  ✕
                </button>
                <div className="mb-4">
                  <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wide border ${
                    selectedNode.dynamicStatus === 'completed' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                    selectedNode.dynamicStatus === 'active' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {selectedNode.dynamicStatus}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight mb-3 text-slate-900">{selectedNode.title}</h3>
                <p className="text-slate-600 font-medium mb-6">{selectedNode.description}</p>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                  <h4 className="text-sm font-bold text-slate-700 mb-3">Topic Progress</h4>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-slate-500 flex items-center gap-1"><Trophy className="w-4 h-4"/> Skill Tests</span>
                    <span className="font-bold text-slate-700">2 Required</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-3">
                    <span className="text-slate-500 flex items-center gap-1"><BookOpen className="w-4 h-4"/> Video Resources</span>
                    <span className="font-bold text-slate-700">1 Required</span>
                  </div>
                  <p className="text-xs text-slate-400">Progress is tracked via the Timetable targets.</p>
                </div>

                <button
                  onClick={() => navigate('/planner')}
                  className="w-full mb-3 text-sm py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  Go to Timetable <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
