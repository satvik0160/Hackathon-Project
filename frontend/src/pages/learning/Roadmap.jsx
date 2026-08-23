import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, Sparkles, ChevronDown, ChevronUp, Lock, CheckCircle, 
  PlayCircle, Award, Target, BookOpen
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { learningService } from '../../services/api';
import { toast } from 'react-hot-toast';

const Roadmap = () => {
  const { user } = useAuth();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedNodeId, setExpandedNodeId] = useState(null);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await learningService.getPaths();
      // Assume API returns structured nodes for roadmap
      setNodes(res.data?.nodes || []);
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

  const toggleNode = (id) => {
    setExpandedNodeId(expandedNodeId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="page-container py-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-3">
          Career Intelligence
        </span>
        <h1 className="text-4xl font-bold mb-4">Your Path to {user?.career_goal || 'Success'}</h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          We've mapped out the skills you need to achieve your career goals. Complete milestones to advance along your personalized journey.
        </p>
        
        {nodes.length === 0 && (
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="btn btn-primary mt-6 inline-flex items-center gap-2 px-6 py-3 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {generating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate My Roadmap
          </button>
        )}
      </div>

      {nodes.length > 0 && (
        <div className="roadmap-container relative px-4 sm:px-12 py-8">
          {/* Central Line */}
          <div className="absolute left-[2.5rem] sm:left-1/2 top-0 bottom-0 w-1 sm:-ml-[0.5px] bg-gradient-to-b from-primary/20 via-primary/10 to-transparent"></div>

          {nodes.map((node, index) => {
            const isCompleted = node.status === 'completed';
            const isActive = node.status === 'active';
            const isLocked = node.status === 'locked';
            const isExpanded = expandedNodeId === node.id;
            
            // Alternate left/right for desktop, always right for mobile
            const isEven = index % 2 === 0;

            return (
              <motion.div 
                key={node.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`roadmap-node relative mb-12 flex flex-col sm:flex-row items-start sm:items-center w-full ${isEven ? 'sm:flex-row-reverse' : ''}`}
              >
                {/* Connector Dot */}
                <div className={`absolute left-0 sm:left-1/2 w-12 h-12 -ml-[1.25rem] sm:-ml-6 rounded-full border-4 z-10 flex items-center justify-center transition-all duration-500 ${
                  isCompleted ? 'bg-green-500 border-white dark:border-gray-900 shadow-[0_0_15px_rgba(34,197,94,0.5)]' :
                  isActive ? 'bg-primary border-white dark:border-gray-900 shadow-[0_0_20px_rgba(99,102,241,0.6)] animate-pulse' :
                  'bg-gray-200 border-gray-100 dark:bg-gray-700 dark:border-gray-800'
                }`}>
                  {isCompleted ? <CheckCircle className="w-6 h-6 text-white" /> :
                   isActive ? <Target className="w-6 h-6 text-white" /> :
                   <Lock className="w-5 h-5 text-gray-400" />}
                </div>

                {/* Content Card */}
                <div className={`w-full sm:w-[calc(50%-3rem)] pl-12 sm:pl-0 ${isEven ? 'sm:pr-12 text-left sm:text-right' : 'sm:pl-12 text-left'}`}>
                  <div 
                    onClick={() => !isLocked && toggleNode(node.id)}
                    className={`card p-6 rounded-2xl border-2 transition-all duration-300 ${
                      isLocked ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-75 cursor-not-allowed' :
                      isActive ? 'bg-white dark:bg-gray-800 border-primary/50 shadow-lg cursor-pointer hover:border-primary' :
                      'bg-white dark:bg-gray-800 border-green-200 dark:border-green-900/50 cursor-pointer hover:shadow-md'
                    }`}
                  >
                    <div className={`flex flex-col ${isEven ? 'sm:items-end' : 'items-start'}`}>
                      <span className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                        isCompleted ? 'text-green-600' : isActive ? 'text-primary' : 'text-gray-400'
                      }`}>
                        Stage {index + 1}
                      </span>
                      <h3 className="text-xl font-bold mb-2">{node.title}</h3>
                      <p className={`text-sm mb-4 ${isLocked ? 'text-gray-400' : 'text-muted'}`}>
                        {node.description}
                      </p>

                      {!isLocked && (
                        <div className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
                          {isExpanded ? 'Hide Details' : 'View Details'}
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      )}
                    </div>

                    {/* Expandable Content */}
                    <AnimatePresence>
                      {isExpanded && !isLocked && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-6 mt-4 border-t border-gray-100 dark:border-gray-700 text-left">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                <span className="text-xs text-muted block mb-1">Target Score</span>
                                <span className="font-bold text-lg">{node.target_score || 80}%</span>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                <span className="text-xs text-muted block mb-1">Est. Effort</span>
                                <span className="font-bold text-lg">{node.estimated_hours || 10}h</span>
                              </div>
                            </div>

                            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-primary" /> Recommended Resources
                            </h4>
                            <ul className="space-y-2 mb-6">
                              {(node.resources || []).slice(0, 3).map(res => (
                                <li key={res.id} className="text-sm flex items-start gap-2 text-muted">
                                  <PlayCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                  <a href={res.url} className="hover:text-primary transition-colors line-clamp-1">{res.title}</a>
                                </li>
                              ))}
                            </ul>

                            <a href={`/assessments?category=${node.category_id}`} className="w-full btn btn-outline btn-sm justify-center">
                              Take Related Assessment
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          <div className="absolute left-[2.5rem] sm:left-1/2 bottom-0 w-12 h-12 -ml-[1.25rem] sm:-ml-6 bg-gradient-to-b from-transparent to-white dark:to-gray-900 z-0"></div>
          <div className="relative z-10 flex flex-col items-center mt-8">
            <Award className="w-16 h-16 text-yellow-400 drop-shadow-lg mb-2" />
            <span className="font-bold text-lg">Goal Reached</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
