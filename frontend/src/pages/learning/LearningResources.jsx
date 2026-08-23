import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  BookOpen, Video, FileText, CheckCircle, 
  ExternalLink, Search, Filter, Loader, 
  RefreshCw, Sparkles, AlertCircle, Clock
} from 'lucide-react';
import { learningService } from '../../services/api';

const LearningResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    resource_type: '',
    difficulty_level: '',
    is_free: false,
    skill_category: ''
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await learningService.getResources(filters);
      setResources(data.data || []);
    } catch (error) {
      console.error('Failed to fetch resources', error);
      toast.error('Failed to load learning resources');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePath = async () => {
    try {
      setGenerating(true);
      await learningService.generatePath();
      toast.success('AI Learning Path generated successfully!');
      fetchResources();
    } catch (error) {
      toast.error('Failed to generate path');
    } finally {
      setGenerating(false);
    }
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
    <div className="page-container">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Your Personalized Learning Path</h1>
          <p className="text-muted mt-2">Curated resources to help you achieve your career goals.</p>
        </div>
        <button 
          onClick={handleGeneratePath}
          disabled={generating}
          className="btn btn-primary flex items-center gap-2"
        >
          {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate AI Path
        </button>
      </div>

      <div className="filter-bar flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <span className="font-semibold text-sm">Filters:</span>
        </div>
        
        {['All', 'Video', 'Article', 'Course'].map(type => (
          <button
            key={type}
            onClick={() => setFilters(f => ({ ...f, resource_type: type === 'All' ? '' : type }))}
            className={`filter-chip chip ${filters.resource_type === (type === 'All' ? '' : type) ? 'bg-primary text-white' : 'bg-white dark:bg-gray-700'}`}
          >
            {type}
          </button>
        ))}

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
        
        {['Beginner', 'Intermediate', 'Advanced'].map(diff => (
          <button
            key={diff}
            onClick={() => setFilters(f => ({ ...f, difficulty_level: diff === filters.difficulty_level ? '' : diff }))}
            className={`filter-chip chip ${filters.difficulty_level === diff ? 'bg-accent text-white' : 'bg-white dark:bg-gray-700'}`}
          >
            {diff}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-auto gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card skeleton-card h-48 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="empty-state flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-gray-800 rounded-xl">
          <AlertCircle className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-xl font-semibold mb-2">No resources found</h3>
          <p className="text-muted max-w-md">Try adjusting your filters or click Generate AI Path to create new personalized content.</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-auto gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
        >
          {resources.map((resource) => (
            <motion.div
              key={resource.id}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="card card-hover flex flex-col p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="badge badge-primary px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {resource.skill_category || 'General'}
                </span>
                <span className={`badge px-2 py-1 text-xs rounded-md ${
                  resource.difficulty_level === 'Beginner' ? 'bg-green-100 text-green-800' :
                  resource.difficulty_level === 'Advanced' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {resource.difficulty_level || 'Beginner'}
                </span>
              </div>
              
              <h3 className="card-title text-lg font-bold mb-2 line-clamp-2">{resource.title}</h3>
              <p className="text-sm text-muted mb-4 line-clamp-2 flex-grow">{resource.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-muted mb-4">
                <div className="flex items-center gap-1">
                  {getIcon(resource.resource_type)}
                  <span>{resource.resource_type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{resource.duration || '10 min'}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                <button 
                  onClick={() => handleToggleComplete(resource.id, resource.completed)}
                  className={`flex items-center gap-2 text-sm font-medium ${resource.completed ? 'text-green-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  <CheckCircle className={`w-5 h-5 ${resource.completed ? 'fill-current' : ''}`} />
                  {resource.completed ? 'Completed' : 'Mark Complete'}
                </button>
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default LearningResources;
