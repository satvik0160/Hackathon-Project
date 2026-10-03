import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, Video, FileText, CheckCircle, 
  ExternalLink, Search, Filter, Loader, 
  RefreshCw, Sparkles, AlertCircle, Clock, X, Target
} from 'lucide-react';
import { learningService } from '../../services/api';
import { TiltCard } from '../../components/common/TiltCard';
import { getCategoriesForGoal } from '../../utils/roleMapping';

const LearningResources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    resource_type: '',
    difficulty_level: '',
    search_query: ''
  });
  
  // AI Modal States
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Semantic Relevance
  const [relevantCategories, setRelevantCategories] = useState([]);
  
  // Current active goal driving the UI
  const [activeGoal, setActiveGoal] = useState(user?.career_goal || 'Backend Engineer');

  useEffect(() => {
    // Instantly map categories from local fuzzy matcher
    if (activeGoal) {
      setRelevantCategories(getCategoriesForGoal(activeGoal));
    } else {
      setRelevantCategories([]);
    }
  }, [activeGoal]);

  useEffect(() => {
    // Re-fetch locally when categories or structural filters change
    fetchResources();
  }, [relevantCategories, filters.resource_type, filters.difficulty_level]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      // Only pass structural filters to backend/mock
      const apiFilters = {
        resource_type: filters.resource_type,
        difficulty_level: filters.difficulty_level
      };
      const data = await learningService.getResources(apiFilters);
      
      let rawResources = data.data?.results || data.data || [];
      
      if (activeGoal) {
        // The role mapping fallback returns these 3 generic skills
        const fallbackSkills = ['Git & Github', 'Python', 'Javascript'].sort().join(',');
        const currentSkills = [...relevantCategories].sort().join(',');
        const isFallback = fallbackSkills === currentSkills;
        
        let filteredByCategories = [];
        if (!isFallback && relevantCategories.length > 0) {
           // We found a specific role! Only show these categorized resources.
           filteredByCategories = rawResources.filter(r => relevantCategories.includes(r.skill_category));
        }
        
        // Also match standard search query in titles/descriptions
        const sq = activeGoal.toLowerCase();
        let filteredByText = rawResources.filter(r => 
           (r.title && r.title.toLowerCase().includes(sq)) || 
           (r.description && r.description.toLowerCase().includes(sq)) || 
           (r.skill_category && r.skill_category.toLowerCase().includes(sq))
        );
        
        // Combine them uniquely
        const combined = [...filteredByCategories, ...filteredByText];
        rawResources = Array.from(new Set(combined.map(r => r.id)))
                            .map(id => combined.find(r => r.id === id));
      }
      
      setResources(rawResources);
    } catch (error) {
      toast.error('Failed to load learning resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSemanticSearch = (e) => {
    e.preventDefault();
    if (filters.search_query.trim()) {
      setActiveGoal(filters.search_query.trim());
    } else {
      setActiveGoal('');
    }
  };

  const openAiModal = () => {
    setAiModalOpen(true);
  };

  const handleToggleComplete = async (resourceId, currentStatus) => {
    try {
      await learningService.updateProgress({ resource_id: resourceId, completed: !currentStatus });
      toast.success(currentStatus ? 'Marked as incomplete' : 'Resource completed!');
      setResources(resources.map(r => r.id === resourceId ? { ...r, completed: !currentStatus } : r));
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const getIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'article': return <FileText className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="page-container relative">
      <div className="page-header flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Your Personalized Path
          </h1>
          <p className="text-muted mt-2">
            Curated resources optimized for <span className="font-semibold text-primary">{activeGoal || 'All'}</span>.
          </p>
        </div>
        <button 
          onClick={openAiModal}
          className="btn btn-primary flex items-center gap-2 whitespace-nowrap shadow-lg shadow-primary/20 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4" />
          Generate AI Path
        </button>
      </div>

      <div className="filter-bar flex flex-col md:flex-row gap-4 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm items-center">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Filter className="w-4 h-4 text-muted" />
            <span className="font-semibold text-sm hidden lg:inline">Type:</span>
          </div>
          {['All', 'Video', 'Article'].map(type => (
            <button
              key={type}
              onClick={() => setFilters(f => ({ ...f, resource_type: type === 'All' ? '' : type }))}
              className={`filter-chip chip cursor-pointer transition-colors ${filters.resource_type === (type === 'All' ? '' : type) ? 'bg-primary text-slate-800 font-medium' : 'bg-white hover:bg-gray-100'}`}
            >
              {type}
            </button>
          ))}

          <div className="h-6 w-px bg-gray-300 mx-2 hidden md:block"></div>
          
          {['Beginner', 'Intermediate', 'Advanced'].map(diff => (
            <button
              key={diff}
              onClick={() => setFilters(f => ({ ...f, difficulty_level: diff === filters.difficulty_level ? '' : diff }))}
              className={`filter-chip chip cursor-pointer transition-colors ${filters.difficulty_level === diff ? 'bg-accent text-slate-800 font-medium' : 'bg-white hover:bg-gray-100'}`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Semantic Search Bar */}
        <form onSubmit={handleSemanticSearch} className="relative flex-grow flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search roles or topics (e.g. Data Scientist, Blockchain)..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
              value={filters.search_query}
              onChange={(e) => {
                setFilters(f => ({ ...f, search_query: e.target.value }));
                // Live typing updates
                setActiveGoal(e.target.value);
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary px-4 py-2.5 rounded-lg font-medium text-sm">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-auto gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card skeleton-card h-48 rounded-xl bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="empty-state flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <AlertCircle className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-xl font-semibold mb-2">No resources found</h3>
          <p className="text-muted max-w-md">Try adjusting your filters, clearing your search, or click Generate AI Path to create tailored content.</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-auto gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
        >
          {resources.map((resource) => {
            const isHighlyRelevant = relevantCategories.includes(resource.skill_category);
            return (
              <TiltCard
                key={resource.id}
                variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                className={`card flex flex-col p-5 rounded-xl shadow-sm border transition-shadow hover:shadow-md ${isHighlyRelevant ? 'bg-white border-primary/40 ring-1 ring-primary/10' : 'bg-white border-gray-100'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`badge px-2.5 py-1 text-xs font-semibold rounded-md border ${isHighlyRelevant ? 'bg-primary/10 text-primary border-primary/20' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                    {resource.skill_category || 'General'}
                    {isHighlyRelevant && <Sparkles className="w-3 h-3 inline ml-1" />}
                  </span>
                  <span className={`badge px-2.5 py-1 text-xs font-semibold rounded-md border ${
                    resource.difficulty_level === 'Beginner' ? 'bg-green-50 text-green-700 border-green-100' :
                    resource.difficulty_level === 'Advanced' ? 'bg-red-50 text-red-700 border-red-100' :
                    'bg-yellow-50 text-yellow-700 border-yellow-100'
                  }`}>
                    {resource.difficulty_level || 'Beginner'}
                  </span>
                </div>
                
                <h3 className="card-title text-lg font-bold mb-2 line-clamp-2 text-gray-900 leading-snug">{resource.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow leading-relaxed">{resource.description}</p>
                
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-5">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                    {getIcon(resource.resource_type)}
                    <span>{resource.resource_type}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{resource.duration || '10 min'}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleToggleComplete(resource.id, resource.completed)}
                    className={`flex items-center gap-2 text-sm font-semibold transition-colors ${resource.completed ? 'text-green-600' : 'text-gray-400 hover:text-gray-700'}`}
                  >
                    <CheckCircle className={`w-5 h-5 ${resource.completed ? 'fill-current' : ''}`} />
                    {resource.completed ? 'Completed' : 'Mark Done'}
                  </button>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                  >
                    Open <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </TiltCard>
            );
          })}
        </motion.div>
      )}

      {/* AI Goal Selection Modal */}
      <AnimatePresence>
        {aiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2 text-primary font-bold text-lg">
                  <Sparkles className="w-5 h-5" />
                  AI Learning Copilot
                </div>
                <button onClick={() => setAiModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <h3 className="text-gray-900 font-semibold text-lg mb-2">What is your target?</h3>
                <p className="text-sm text-gray-500 mb-6">Enter your career goal to get a specialized learning path instantly.</p>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const target = new FormData(e.target).get('target');
                  if (target.trim()) {
                    setAiModalOpen(false);
                    setFilters(f => ({ ...f, search_query: target }));
                    setActiveGoal(target);
                  }
                }}>
                  <div className="relative mb-4">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10 pointer-events-none" />
                     <input 
                       name="target" 
                       type="text" 
                       placeholder="e.g. Frontend Developer" 
                       autoFocus 
                       className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm" 
                     />
                  </div>
                  <button type="submit" className="w-full btn btn-primary py-2.5 rounded-lg font-medium">Generate Path</button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningResources;
