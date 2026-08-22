import { PlayCircle, FileText, CheckSquare, Square } from 'lucide-react';
import { useState } from 'react';

const LearningPath = () => {
  const [completed, setCompleted] = useState({ 1: true, 2: false, 3: false });

  const toggle = (id) => setCompleted(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Your Learning Path</h1>
        <p className="page-subtitle">Curated content based on your recent "React Fundamentals" assessment.</p>
      </div>

      <div style={{ position: 'relative', paddingLeft: '2rem' }}>
        <div style={{ position: 'absolute', left: '0.9rem', top: '0', bottom: '0', width: '2px', background: 'var(--glass-border)' }}></div>
        
        <div style={{ marginBottom: '2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '-2rem', top: '1.5rem', width: '20px', height: '20px', borderRadius: '50%', background: completed[1] ? 'var(--success)' : 'var(--card-bg)', border: '2px solid var(--success)', zIndex: 1 }}></div>
          <div className="glass-panel" style={{ opacity: completed[1] ? 0.7 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <PlayCircle size={24} color="#9d4edd" />
                <div>
                  <h3 style={{ textDecoration: completed[1] ? 'line-through' : 'none' }}>React Performance Optimization</h3>
                  <p className="page-subtitle" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Video Course • 45 mins • Intermediate</p>
                </div>
              </div>
              <button onClick={() => toggle(1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                {completed[1] ? <CheckSquare size={24} color="#06d6a0" /> : <Square size={24} color="#adb5bd" />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '-2rem', top: '1.5rem', width: '20px', height: '20px', borderRadius: '50%', background: completed[2] ? 'var(--success)' : 'var(--card-bg)', border: '2px solid var(--accent)', zIndex: 1 }}></div>
          <div className="glass-panel" style={{ opacity: completed[2] ? 0.7 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <FileText size={24} color="#4cc9f0" />
                <div>
                  <h3 style={{ textDecoration: completed[2] ? 'line-through' : 'none' }}>Understanding useEffect Dependencies</h3>
                  <p className="page-subtitle" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Article • 15 mins • Advanced</p>
                </div>
              </div>
              <button onClick={() => toggle(2)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                {completed[2] ? <CheckSquare size={24} color="#06d6a0" /> : <Square size={24} color="#adb5bd" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
