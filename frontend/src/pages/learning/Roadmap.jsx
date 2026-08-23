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
      setNodes(res.data?.nodes || [
        { id: '1', title: 'HTML & CSS', status: 'completed', description: 'Basics of web' },
        { id: '2', title: 'JavaScript', status: 'active', description: 'Programming' },
        { id: '3', title: 'React', status: 'locked', description: 'Frontend framework' }
      ]);
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
        <div className="spinner w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="page-container py-8 max-w-6xl mx-auto h-[90vh] flex flex-col relative">
      <div className="text-center mb-6 z-10">
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-3">
          3D Skill Galaxy
        </span>
        <h1 className="text-4xl font-bold mb-4">Your Path to {user?.career_goal || 'Success'}</h1>
        
        {nodes.length === 0 && (
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="btn btn-primary mt-4 inline-flex items-center gap-2 px-6 py-3"
          >
            {generating ? <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate My Roadmap
          </button>
        )}
      </div>

      {nodes.length > 0 && (
        <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-black/5">
          <ForceGraph3D
            ref={fgRef}
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(node) => {
              if (node.status === 'completed') return '#22c55e'; // green
              if (node.status === 'active') return '#9333ea'; // purple
              return '#9ca3af'; // gray
            }}
            nodeRelSize={6}
            linkColor={() => 'rgba(150, 150, 150, 0.4)'}
            linkWidth={2}
            onNodeClick={handleNodeClick}
            backgroundColor="#0a0a0a"
          />

          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="absolute top-4 right-4 w-80 bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-gray-200 z-20"
              >
                <button 
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold"
                  onClick={() => setSelectedNode(null)}
                >
                  ✕
                </button>
                <div className="mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-bold uppercase ${
                    selectedNode.status === 'completed' ? 'bg-green-100 text-green-700' :
                    selectedNode.status === 'active' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedNode.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{selectedNode.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{selectedNode.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="btn btn-primary w-full text-sm py-2">View Modules</button>
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
