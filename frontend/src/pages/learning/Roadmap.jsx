import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, BookOpen, PlayCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { learningService } from '../../services/api';
import { toast } from 'react-hot-toast';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';

const Roadmap = () => {
  const { user } = useAuth();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const fgRef = useRef();

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await learningService.getPaths();
      const pathNodes = res.data?.nodes || res.data || [];
      if (pathNodes.length > 0) {
        setNodes(pathNodes);
      } else {
        // Generate personalized fallback from user profile
        const userSkills = typeof user?.skills === 'string' ? JSON.parse(user.skills) : (user?.skills || []);
        const goal = user?.career_goal || 'Full Stack Developer';
        
        // Build a personalized roadmap based on career goal
        const roadmapTemplates = {
          'Full Stack Developer': [
            { id: '1', title: 'HTML, CSS & JavaScript', status: 'completed', description: 'Web fundamentals' },
            { id: '2', title: 'React & Frontend Frameworks', status: 'active', description: 'Modern UI development' },
            { id: '3', title: 'Node.js & Express', status: 'locked', description: 'Server-side development' },
            { id: '4', title: 'Databases & SQL', status: 'locked', description: 'Data persistence layer' },
            { id: '5', title: 'DevOps & Deployment', status: 'locked', description: 'CI/CD and cloud hosting' },
          ],
          'Data Scientist': [
            { id: '1', title: 'Python Fundamentals', status: 'completed', description: 'Core Python programming' },
            { id: '2', title: 'Statistics & Probability', status: 'active', description: 'Mathematical foundations' },
            { id: '3', title: 'Pandas & Data Wrangling', status: 'locked', description: 'Data manipulation' },
            { id: '4', title: 'Machine Learning', status: 'locked', description: 'ML algorithms and models' },
            { id: '5', title: 'Deep Learning & NLP', status: 'locked', description: 'Advanced AI techniques' },
          ],
          'DevOps Engineer': [
            { id: '1', title: 'Linux & Shell Scripting', status: 'completed', description: 'System administration' },
            { id: '2', title: 'Docker & Containers', status: 'active', description: 'Containerization' },
            { id: '3', title: 'Kubernetes', status: 'locked', description: 'Container orchestration' },
            { id: '4', title: 'CI/CD Pipelines', status: 'locked', description: 'Automation and deployment' },
            { id: '5', title: 'Cloud Infrastructure (AWS/GCP)', status: 'locked', description: 'Cloud services' },
          ],
          'AI/ML Engineer': [
            { id: '1', title: 'Python & Math Foundations', status: 'completed', description: 'Prerequisites' },
            { id: '2', title: 'Machine Learning Basics', status: 'active', description: 'Supervised & unsupervised learning' },
            { id: '3', title: 'Deep Learning & Neural Networks', status: 'locked', description: 'Neural architectures' },
            { id: '4', title: 'NLP & Computer Vision', status: 'locked', description: 'Specialized domains' },
            { id: '5', title: 'MLOps & Model Deployment', status: 'locked', description: 'Production ML systems' },
          ],
        };

        // Match career goal to template or build from skills
        let selectedRoadmap = null;
        const goalLower = goal.toLowerCase();
        for (const [key, template] of Object.entries(roadmapTemplates)) {
          if (goalLower.includes(key.toLowerCase()) || key.toLowerCase().includes(goalLower)) {
            selectedRoadmap = template;
            break;
          }
        }

        if (!selectedRoadmap && userSkills.length > 0) {
          // Build from skills: mark known skills as completed
          selectedRoadmap = userSkills.slice(0, 5).map((skill, idx) => {
            const name = typeof skill === 'object' ? skill.name : skill;
            return {
              id: String(idx + 1),
              title: name,
              status: idx === 0 ? 'completed' : idx === 1 ? 'active' : 'locked',
              description: `Master ${name} for your career path`
            };
          });
        }

        setNodes(selectedRoadmap || roadmapTemplates['Full Stack Developer']);
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
      await learningService.generatePath();
      toast.success('Career Roadmap generated based on your profile!');
      fetchRoadmap();
    } catch (error) {
      toast.error('Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const graphData = useMemo(() => {
    const gNodes = nodes.map((n) => ({
      id: n.id,
      name: n.title,
      status: n.status,
      description: n.description,
      val: 20
    }));
    
    const gLinks = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      gLinks.push({
        source: nodes[i].id,
        target: nodes[i+1].id
      });
    }

    return { nodes: gNodes, links: gLinks };
  }, [nodes]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    
    // Aim at node from outside it
    const distance = 100;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    if (fgRef.current) {
      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        3000
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="page-container py-8 max-w-6xl mx-auto h-[90vh] flex flex-col relative">
      <div className="text-center mb-6 z-10">
        <span className="inline-block px-3 py-1 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white rounded-full text-sm font-semibold mb-3 shadow-lg shadow-indigo-500/25 animate-glow-pulse">
          3D Skill Galaxy
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Your Path to {user?.career_goal || 'Success'}</h1>
        <p className="text-slate-500 font-medium mb-4">Explore your personalized skill constellation — click any node to inspect it.</p>
        
        {nodes.length === 0 && (
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all duration-200"
          >
            {generating ? <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate My Roadmap
          </button>
        )}
      </div>

      {nodes.length > 0 && (
        <div className="skill-galaxy flex-1 relative rounded-2xl border border-indigo-500/30 shadow-inner overflow-hidden">
          {/* Animated starfield overlay */}
          <div className="starfield absolute inset-0 z-0"></div>
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="aurora-blob absolute top-0 left-1/4 w-64 h-64 bg-indigo-600/20"></div>
            <div className="aurora-blob absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/15" style={{ animationDelay: '-6s' }}></div>
          </div>
          <ForceGraph3D
            ref={fgRef}
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(node) => {
              if (node.status === 'completed') return '#22d3ee'; // vibrant cyan glow
              if (node.status === 'active') return '#a855f7'; // vibrant purple glow
              return '#64748b'; // muted slate for locked
            }}
            nodeRelSize={6}
            linkColor={() => 'rgba(129, 140, 248, 0.45)'}
            linkWidth={2}
            onNodeClick={handleNodeClick}
            backgroundColor="#020617"
          />

          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="absolute top-4 right-4 w-80 bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/90 z-20"
              >
                <button 
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 font-bold transition-colors"
                  onClick={() => setSelectedNode(null)}
                >
                  ✕
                </button>
                <div className="mb-2">
                  <span className={`px-2.5 py-1 text-xs rounded-full font-bold uppercase tracking-wide border ${
                    selectedNode.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    selectedNode.status === 'active' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {selectedNode.status}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold tracking-tight mb-2 text-slate-900">{selectedNode.name}</h3>
                <p className="text-slate-500 font-medium text-sm mb-4">{selectedNode.description}</p>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button className="w-full text-sm py-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all duration-200">View Modules</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
